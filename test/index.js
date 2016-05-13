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

describe('Install files', function () {
  it('should download and cache the files', function (done) {
    this.timeout(30000)
    dataset.install(test_data).then(function (files) {
      files.forEach(function (file, i) {
        assert(fs.lstatSync(file.path).isFile())
        if (file.valid) {
          assert.equal(file.hash, test_data.resources[i].hash)
        } else {
          assert.notEqual(file.hash, test_data.resources[i].hash)
        }
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_data).then(function (files) {
      files.forEach(function (file, i) {
        assert(fs.lstatSync(file.path).isFile())
        if (file.valid) {
          assert.equal(file.hash, test_data.resources[i].hash)
          assert(file.cached)
        } else {
          assert.notEqual(file.hash, test_data.resources[i].hash)
          assert.equal(file.cached, false)
        }
      })
      done()
    }).catch(done)
  })
})

var test_dirs = {
  resources: [
    {
      url: 'https://github.com/alanhoff/node-tar.gz/raw/master/test/fixtures/compressed.tar.gz',
      hash: '68f7543f4f5d874ed603b79f9e18f7960535e653c1c0cdd8538aae90d7207464'
    }
  ]
}

describe('Install tarballs', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs).then(function (dirs) {
      dirs.forEach(function (dir, i) {
        assert(fs.lstatSync(dir.path).isDirectory())
        if (dir.valid) {
          assert.equal(dir.hash, test_dirs.resources[i].hash)
        } else {
          assert.notEqual(dir.hash, test_dirs.resources[i].hash)
        }
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs).then(function (dirs) {
      dirs.forEach(function (dir, i) {
        assert(fs.lstatSync(dir.path).isDirectory())
        assert(dir.valid)
        assert.equal(dir.hash, test_dirs.resources[i].hash)
        assert(dir.cached)
      })
      done()
    }).catch(done)
  })
})
