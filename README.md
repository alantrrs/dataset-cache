# Dataset Cache [![CircleCI](https://circleci.com/gh/empiricalci/dataset-cache.svg?style=svg)](https://circleci.com/gh/empiricalci/dataset-cache)
_A solution for downloading and caching datasets_

## How does it work?
**dataset-cache** allows you to download your datasets, cache them and 
guarantee that the data you're using is the correct one.

When a file is downloaded it will be saved to the output directory, 
then it will be hashed using ``sha256`` and renamed to it's hash for caching.

Directories can be provided in the form of a tarball (``tar.gz``). After downloading,
the contents will be extracted and the directory will be hashed using [hash-then](https://github.com/alantrrs/hash-then).
The contents then will be saved in a directory named using the hash.


## Use
### As a library

Donwload and cache a file
```js
dataset.get({
  url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/my-file.txt',
  hash: '8b4781a921e9f1a1cb5aa3063ca8592cac3ee39276d8e8212b336b6e73999798'
}, '/output_dir').then(function (data) {
  console.log(data) // {path: '..', hash: '..', valid: '..', cached: '..'} 
})
```

Donwload and cache a directory
If ``directory: true`` the library will extract the ``.zip`` or ``.tar.gz``
```js
dataset.get({
  url: 'https://github.com/empiricalci/fixtures/raw/master/my-files.tar.gz',
  hash: '0e4710c220e7ed2d11288bcf3cf111ac01bdd0cb2a4d64f81455c5b31f1a4fbe',
  directory: true
}, output_dir).then(function (data) {
  console.log(data) // {path: '..', hash: '..', valid: '..', cached: '..'} 
})

```

Install multiple datasets at once
```js
dataset.install({
  resource1: {url: '..', hash: '..'},
  dataset2: {url: '..', hash: '..'}
}, function (datasets) {
  console.log(datasets)
})

```
