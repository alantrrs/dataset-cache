var fetch = require('node-fetch')
var fs = require('fs')
var shortid = require('shortid')
var path = require('path')
var tar = require('tar-fs')
var gz = require('gunzip-maybe')
var debug = require('debug')('dataset-cache')
var hash = require('hash-then')

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

function validate (object_path, source_hash) {
  return hash(object_path).then(function (hash) {
    return {
      path: object_path,
      cached: false,
      hash: hash,
      valid: (hash && source_hash) ? hash === source_hash : false
    }
  })
}

function getFile (source, data_dir) {
  // Check if the data exists and is valid
  const cache_path = path.join(data_dir, source.hash)
  return validate(cache_path, source.hash).then(function (data) {
    debug('Chached data valid: ' + data.valid)
    if (data.valid) {
      data.cached = true
      return data
    }
    // Download
    return download(source.url, data_dir)
    // Get checksum & verify against source hash
    .then(function (file_path) {
      return validate(file_path, source.hash)
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

function getDir (source, data_dir) {
  debug(`[SOURCE url]: ${source.url}`)
  debug(`[SOURCE hash]: ${source.hash}`)
  // Check if data exist and is valid
  const cache_path = path.join(data_dir, source.hash)
  debug('Cached path: ' + cache_path)
  return validate(cache_path, source.hash).then(function (data) {
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
      return validate(dir, source.hash).then(function (data) {
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
exports.hash = hash
exports.extract = uncompress
