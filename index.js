var fetch = require('node-fetch')
var fs = require('fs')
var checksum = require('checksum')
var shortid = require('shortid')
var path = require('path')
var tar = require('tar-fs')
var gz = require('gunzip-maybe')
var debug = require('debug')('datasetjs')
var mkdir = require('mkdirp')

function download (source, data_dir) {
  return new Promise(function (resolve, reject) {
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
    if (data.valid){
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
        fs.renameSync(file_path, new_path)
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
  return new Promise (function (resolve, reject) {
    var tmp_file = '/tmp/' + shortid.generate()
    var out = fs.createWriteStream(tmp_file)
    tar.pack(dir_path).pipe(out).on('finish', function () {
      resolve(tmp_file)
    }).on('error', reject)
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
  // Check if data exist and is valid
  const cache_path = path.join(data_dir, source.hash)
  return validateDir(cache_path, source.hash).then(function (data) {
    debug(`[[source url: ${source.url}]]`)
    debug(`[[source hash: ${source.hash}]]`)
    debug('Chached path: ' + data.path)
    debug('Chached hash: ' + data.hash)
    debug('Chached data valid: ' + data.valid)
    if (data.valid) {
      data.cached = true
      return data
    }
    // Download compressed file
    debug('downloading '+ source.url)
    return download(source.url, data_dir)
    // Get tarball checksum & validate against source hash
    .then(function (files) {
      return validateFile(files, source.hash)
    })
    // Uncompress file to directory using hash
    .then(function (files) {
      var dir = path.join(data_dir, files.hash)
      return uncompress(files.path, dir)
      .then(function (dir) {
        debug('extract directory:'+ dir)
        files.path = dir
        return files
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

// Try this alternative?: http://unix.stackexchange.com/questions/35832/how-do-i-get-the-md5-sum-of-a-directorys-contents-as-one-sum
function hashDir (dir) {
  return tmpCompress(dir).then(function (tar_path) {
    return hashFile(tar_path)
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
