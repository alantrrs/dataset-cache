// TODO: Download data
// TODO: Decompress
// TODO: Define interfaces

var fetch = require('node-fetch')

var fs = require('mz/fs')

var resources = [
  'http://host.robots.ox.ac.uk/pascal/VOC/voc2007/VOCdevkit_08-Jun-2007.tar',
  'http://host.robots.ox.ac.uk/pascal/VOC/voc2007/VOCtestnoimgs_06-Nov-2007.tar'
]

function download(source, destination) {
  return new Promise(function(resolve, reject) {
    return fetch(source).then(function(response){
      // TODO: calculate based on hash?
      var outputPath = destination + source.split('/').pop()
      var out = fs.createWriteStream(outputPath)
      response.body.pipe(out).on('finish',function(){
        resolve(outputPath)
      }).on('error',reject)
    }).catch(reject)
  })
}
const TMP_DIR = './'

// EXECUTE
Promise.all(resources.map(function(r){
  return download(r,TMP_DIR)
})).then(function(paths){
  console.log('files:', paths)
}).catch(function(err){
  console.error(err)
})
