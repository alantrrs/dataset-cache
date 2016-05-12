var fetch = require('node-fetch')
var fs = require('fs')
var checksum = require('checksum')
var shortid = require('shortid')
var path = require('path')

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

function validateCache (data_dir, source_hash) {
  var cached_path = path.join(data_dir, source_hash)
  return hashFile(cached_path).then(function (hash) {
    var valid = (hash === source_hash)
    return {
      path: cached_path,
      hash: hash,
      valid: valid,
      cached: valid
    }
  })
}

function get (source, data_dir) {
  // Check if the data exists and is valid
  return validateCache(data_dir, source.hash).then(function (data) {
    if (data.cached) return data
    // Download
    return download(source.url, data_dir)
    // Get checksum
    .then(function (file) {
      return hashFile(file).then(function (hash) {
        return {
          path: file,
          hash: hash
        }
      })
    })
    // Verify against original hash
    .then(function (newFile) {
      newFile.valid = false
      if (newFile.hash === source.hash) {
        newFile.valid = true
      }
      return newFile
    })
    // Move file to final data_dir
    .then(function (newFile) {
      const new_path = path.join(data_dir, newFile.hash)
      fs.renameSync(newFile.path, new_path)
      newFile.path = new_path
      return newFile
    })
  })
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

/*
function hashDir (dir) {
  // TODO: Try this? : http://unix.stackexchange.com/questions/35832/how-do-i-get-the-md5-sum-of-a-directorys-contents-as-one-sum
  // TODO: Parse directory
  // TODO: Sort the files
  // TODO: Hash of hashes?
}
*/

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
