/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')

var dataset = require('..')

var test_data = {
  resources: [
    {
      url: 'https://raw.githubusercontent.com/alantrrs/py-faster-rcnn/master/README.md',
      hash: '9f5e6899095e366f25a612e56d8b4ebd32c6914288991e3a8a48265c38e6b6cb'
    },
    {
      url: 'https://raw.githubusercontent.com/alantrrs/py-faster-rcnn/master/Dockerfile',
      hash: '370a909aff0388e235c54eba9b962bb973ba82ac2008fdf6e9277b14ee3394fb'
    },
    {
      url: 'https://raw.githubusercontent.com/alantrrs/py-faster-rcnn/master/README.md',
      hash: 'abcd6899095d366f25a612e56d8b4ebd32c6914288991e3a8a48265c38e6b6cb' // invalid hash
    }
  ]
}

describe('Install', function () {
  it('should download and cache the data', function (done) {
    this.timeout(30000)
    dataset.install(test_data).then(function (files) {
      files.forEach(function (file) {
        assert(fs.lstatSync(file.path).isFile())
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_data).then(function (files) {
      files.forEach(function (file) {
        assert(fs.lstatSync(file.path).isFile())
        if (file.valid) assert(file.cached)
      })
      done()
    }).catch(done)
  })
})
