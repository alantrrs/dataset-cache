/*global describe, it */

var assert = require('assert')
var fs = require('mz/fs')

var dataset = require('..')

var test_data = {
  resources: [
    'http://host.robots.ox.ac.uk/pascal/VOC/voc2007/VOCdevkit_08-Jun-2007.tar',
    'http://host.robots.ox.ac.uk/pascal/VOC/voc2007/devkit_doc_07-Jun-2007.pdf'
  ]
}

describe('Install', function () {
  it('should download the data', function (done) {
    this.timeout(60000)
    dataset.install(test_data).then(function (filepaths) {
      filepaths.forEach(function (path) {
        assert(fs.lstatSync(path).isFile)
      })
      done()
    }).catch(done)
  })
})
