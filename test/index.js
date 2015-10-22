/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')

var dataset = require('..')

var test_data = {
  resources: [
    {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/my-file.txt',
      hash: '8b4781a921e9f1a1cb5aa3063ca8592cac3ee39276d8e8212b336b6e73999798'
    },
    {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/another_file.txt',
      hash: '0f431dfe11d428f809edb32a31867be71e753f9203945676cbc77c514c7324bf'
    },
    {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/another_file.txt',
      hash: 'abcd6899095d366f25a612e56d8b4ebd32c6914288991e3a8a48265c38e6b6cb' // invalid hash
    }
  ]
}

var tmpDir = '/tmp/'

describe('Install files', function () {
  it('should download and cache the files', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      files.forEach(function (file, i) {
        assert(fs.lstatSync(file.path).isFile())
        if ([0, 1].indexOf(i) > -1) { // valid files
          assert.equal(file.hash, test_data.resources[i].hash)
          assert(file.valid)
        } else {
          assert.notEqual(file.hash, test_data.resources[i].hash)
        }
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      files.forEach(function (file, i) {
        assert(fs.lstatSync(file.path).isFile())
        if ([0, 1].indexOf(i) > -1) { // valid files
          assert(file.valid)
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
      url: 'https://github.com/empiricalci/fixtures/raw/master/my-files.tar.gz',
      hash: '0e4710c220e7ed2d11288bcf3cf111ac01bdd0cb2a4d64f81455c5b31f1a4fbe'
    }
  ]
}

describe('Install tarballs', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
      dirs.forEach(function (dir, i) {
        assert(fs.lstatSync(dir.path).isDirectory())
        assert(dir.valid)
        assert.equal(dir.hash, test_dirs.resources[i].hash)
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
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
