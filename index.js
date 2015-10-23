// TODO: Function to generate a json file based on a dataset
// TODO: Download data
// TODO: Decompress
// TODO: Define interfaces

var fetch = require('node-fetch')
var fs = require('mz/fs')
var md5 = require('md5')
var mkdirp = require('mkdirp')

function unique_path (data, base_path) {
  return base_path + md5(data)
}

function download (source, destination) {
  return new Promise(function (resolve, reject) {
    return fetch(source).then(function (response) {
      // TODO: calculate based on hash?
      var outputPath = destination + source.split('/').pop()
      var out = fs.createWriteStream(outputPath)
      response.body.pipe(out).on('finish', function () {
        resolve(outputPath)
      }).on('error', reject)
    }).catch(reject)
  })
}

// TODO: Cache

// EXECUTE
const DATA_DIR = process.env.SCIHUB_DATA_DIR || '/tmp/'
exports.install = function (config) {
  var out_dir = unique_path(config, DATA_DIR) + '/'
  // Create unique directory
  mkdirp.sync(out_dir)
  return Promise.all(config.resources.map(function (r) {
    return download(r, out_dir)
  }))
}
