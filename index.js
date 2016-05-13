var fetch = require('node-fetch')
var fs = require('fs')
var checksum = require('checksum')
var shortid = require('shortid')
var path = require('path')
var tar = require('tar-fs')
var gz = require('gunzip-maybe')
var debug = require('debug')('datasetjs')

function download (source, data_dir) {
  return new Promise(function (resolve, reject) {
    debug('downloading ' + source)
    return fetch(source).then(function (response) {
      var outputPath = path.join(data_dir, source.split('/').pop() + shortid.generate() + '.tmp')
      var out = fs.createWriteStream(outputPath)
      response.body.pipe(out).on('finish', function () {
        resolve(outputPath)
      }).on('error', reject)
    }).catch(reject)
  })
}

function validateFile (file_path, source_hash) {
  return hashFile(file_path).then(function (hash) {
    return {
      path: file_path,
      cached: false,
      hash: hash,
      valid: (hash && source_hash) ? hash === source_hash : false
    }
  })
}

function getFile (source, data_dir) {
  // Check if the data exists and is valid
  const cache_path = path.join(data_dir, source.hash)
  return validateFile(cache_path, source.hash).then(function (data) {
    debug('Chached data valid: ' + data.valid)
    if (data.valid) {
      data.cached = true
      return data
    }
    // Download
    return download(source.url, data_dir)
    // Get checksum & verify against source hash
    .then(function (file_path) {
      return validateFile(file_path, source.hash)
      // Rename using hash
      .then(function (newFile) {
        debug('newFile path' + newFile.path)
        const new_path = path.join(data_dir, newFile.hash)
        fs.renameSync(newFile.path, new_path)
        newFile.path = new_path
        return newFile
      })
    })
  })
}

function uncompress (compressed_file, uncompressed_dir) {
  return new Promise(function (resolve, reject) {
    fs.createReadStream(compressed_file)
    .pipe(gz())
    .pipe(tar.extract(uncompressed_dir)).on('finish', function () {
      resolve(uncompressed_dir)
    }).on('error', reject)
  })
}

function tarCompress (dir_path) {
  return new Promise(function (resolve, reject) {
    var tmp_file = '/tmp/' + shortid.generate()
    var out = fs.createWriteStream(tmp_file)
    tar.pack(dir_path, {
      map: function (header) {
        if (header.name === '.') header.mtime = new Date('2009', '04', '27')
        console.log(header)
        return header
      }
    }).pipe(out).on('finish', function () {
      resolve(tmp_file)
    }).on('error', function (err) {
      reject(err)
    })
  })
}

function validateDir (dir_path, source_hash) {
  return hashDir(dir_path).then(function (hash) {
    return {
      path: dir_path,
      cached: false,
      hash: hash,
      valid: (hash && source_hash) ? hash === source_hash : false
    }
  })
}

function getDir (source, data_dir) {
  debug(`[SOURCE url]: ${source.url}`)
  debug(`[SOURCE hash]: ${source.hash}`)
  // Check if data exist and is valid
  const cache_path = path.join(data_dir, source.hash)
  debug('Cached path: ' + cache_path)
  return validateDir(cache_path, source.hash).then(function (data) {
    debug('Chached hash: ' + data.hash)
    debug('Chached data valid: ' + data.valid)
    if (data.valid) {
      data.cached = true
      return data
    }
    // Download compressed file
    return download(source.url, data_dir)
    // Uncompress files into temp directory
    .then(function (tarball) {
      var tmp_dir = path.join(data_dir, shortid.generate())
      return uncompress(tarball, tmp_dir)
    })
    // Get dir checksum & validate against source hash
    .then(function (dir) {
      return validateDir(dir, source.hash).then(function (data) {
        // Rename directory using hash
        debug('New directory path' + data.path)
        const new_path = path.join(data_dir, data.hash)
        fs.renameSync(data.path, new_path)
        data.path = new_path
        debug('data path:', data.path)
        return data
      })
    })
  })
}

function get (source, data_dir) {
  if (source.url.indexOf('.tar.gz') === -1) return getFile(source, data_dir)
  return getDir(source, data_dir)
}

function hashFile (file) {
  return new Promise(function (resolve, reject) {
    checksum.file(file, {algorithm: 'sha256'}, function (err, sum) {
      if (err) {
        // If the file doesn't exist return null
        if (err.code === 'ENOENT') return resolve(null)
        return reject(err)
      }
      resolve(sum)
    })
  })
}

function hashDir (dir) {
  // Check if directory exists
  return new Promise(function (resolve, reject) {
    fs.stat(dir, function (err, stats) {
      if (err) {
        // If the file doesn't exist return null
        if (err.code === 'ENOENT') return resolve(null)
        return reject(err)
      }
      resolve(stats.isDirectory())
    })
  })
  // Tar directory and hash tar file
  .then(function (isDirectory) {
    if (!isDirectory) return null
    return tarCompress(dir).then(function (tar_path) {
      return hashFile(tar_path)
      // Cleanup and return the hash
      .then(function (hash) {
        debug('temp tar:', tar_path)
        // fs.unlinkSync(tar_path)
        return hash
      })
    })
  })
}

/**
 * Installs datasets from a dataset.json
 * @param {object} config - the dataset.json contents
 * @param {string} out_dir - destination directory
 */
function install (config, out_dir) {
  if (!out_dir) out_dir = '/tmp/'
  return Promise.all(config.resources.map(function (resource) {
    return get(resource, out_dir)
  }))
}

exports.get = get
exports.install = install
exports.hashDir = hashDir
exports.extract = uncompress
