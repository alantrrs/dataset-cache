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
```js
dataset.get({
  url: 'https://github.com/empiricalci/fixtures/raw/master/my-files.tar.gz',
  hash: '0e4710c220e7ed2d11288bcf3cf111ac01bdd0cb2a4d64f81455c5b31f1a4fbe'
}, output_dir).then(function (data) {
  console.log(data) // {path: '..', hash: '..', valid: '..', cached: '..'} 
})

```

Install multiple resources at once
```js
dataset.install({
  resources: [
    {url: '..', hash: '..'},
    {url: '..', hash: '..'}
  ]
}, function (resources) {
  console.log(resources)
})

```

## TODO [NOT IMPLEMENTED YET]
- If a ``tar.gz`` needs to be downloaded as a file, you can do so by passing ``type: 'file'``
in the resource object.

### Use as CLI

Download and cache a file
```
$ dataset get http://example.com/my-file.txt -o /my_data
> downloading..
> 232352523523 /my_data/24234234235235
```

Download and cache a directory.
```
$ dataset get http://example.com/my-file.tgz -o /my_data
> downloading..
> uncompressing..
> 232352523523 /my_data/24234234235235
```

Get checksum of a file
```
$ dataset hash /path/to/my-file.txt
> 2343rksdgsdgsdgsdg334  /path/to/my-file.txt
```

Get checksum of directory
```
$ dataset pack /my-directory
> 32424234234234242423432   /my-directory
```


