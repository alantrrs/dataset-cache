/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')

var dataset = require('..')

var test_data = {
  resources: {
    'my-file.txt': {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/my-file.txt',
      hash: '8b4781a921e9f1a1cb5aa3063ca8592cac3ee39276d8e8212b336b6e73999798'
    },
    'another_file.txt': {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/another_file.txt',
      hash: '0f431dfe11d428f809edb32a31867be71e753f9203945676cbc77c514c7324bf'
    },
    'invalid_file': {
      url: 'https://raw.githubusercontent.com/empiricalci/fixtures/another_file.txt',
      hash: 'abcd6899095d366f25a612e56d8b4ebd32c6914288991e3a8a48265c38e6b6cb' // invalid hash
    }
  }
}

var tmpDir = '/tmp/'

describe('Install files', function () {
  it('should download and cache the files', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      var keys = Object.keys(files)
      keys.forEach(function (k) {
        var file = files[k]
        assert(fs.lstatSync(file.path).isFile())
        if (k !== 'invalid_file') { // valid files
          assert.equal(file.hash, test_data.resources[k].hash)
          assert(file.valid)
        } else {
          assert.notEqual(file.hash, test_data.resources[k].hash)
        }
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      var keys = Object.keys(files)
      keys.forEach(function (k) {
        var file = files[k]
        assert(fs.lstatSync(file.path).isFile())
        if (k !== 'invalid_file') { // valid files
          assert(file.valid)
          assert.equal(file.hash, test_data.resources[k].hash)
          assert(file.cached)
        } else {
          assert.notEqual(file.hash, test_data.resources[k].hash)
          assert.equal(file.cached, false)
        }
      })
      done()
    }).catch(done)
  })
})

var test_dirs = {
  resources: {
    'my-files': {
      url: 'https://github.com/empiricalci/fixtures/raw/master/my-files.tar.gz',
      hash: '0e4710c220e7ed2d11288bcf3cf111ac01bdd0cb2a4d64f81455c5b31f1a4fbe'
    }
  }
}

describe('Install tarballs', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
      var dir = dirs['my-files']
      assert(fs.lstatSync(dir.path).isDirectory())
      assert(dir.valid)
      assert.equal(dir.hash, test_dirs.resources['my-files'].hash)
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
      var dir = dirs['my-files']
      assert(fs.lstatSync(dir.path).isDirectory())
      assert(dir.valid)
      assert.equal(dir.hash, test_dirs.resources['my-files'].hash)
      assert(dir.cached)
      done()
    }).catch(done)
  })
})

var test_zip = {
  url: 'https://github.com/empiricalci/fixtures/archive/master.zip',
  hash: 'f90af944289bd305d71ef1da68b97f9d4462e91cfcde9c5f03ebfc7c8c4d6807'
}

describe('Get directory from zip', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(80000)
    dataset.get(test_zip, '/tmp/').then(function (dir) {
      assert(fs.lstatSync(dir.path).isDirectory())
      assert(dir.valid)
      assert.equal(dir.hash, test_zip.hash)
      done()
    }).catch(done)
  })
})

var no_hash = {
  url: 'https://raw.githubusercontent.com/empiricalci/fixtures/data.csv'
}

var no_hash_dir = {
  url: 'https://github.com/empiricalci/fixtures/archive/master.zip'
}

describe('Get a file without a hash', function () {
  it('should download a file without validating it', function (done) {
    dataset.get(no_hash, '/tmp/').then(function (file) {
      assert(fs.lstatSync(file.path).isFile())
      assert.notEqual(file.valid, true)
      done()
    }).catch(done)
  })
  it('should download and uncompress a .zip without validating it', function (done) {
    dataset.get(no_hash_dir, '/tmp/').then(function (dir) {
      assert(fs.lstatSync(dir.path).isDirectory(), 'Path is not a directory')
      assert.notEqual(dir.valid, true, 'Directory is valid')
      done()
    }).catch(done)
  })
})
