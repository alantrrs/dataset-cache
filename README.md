# Dataset.js
_A solution for downloading and caching datasets_


## Description
Dataset.js allows you to download your datasets, cache them and 
guarantee that the data you're using is the correct one.

## Use
### Download and cache a single file
Library:
```js
dataset.get('http://example.com/my-file.txt', '/output_dir').then(function (data) {
  console.log(data.path) // /output_dir/23424343434342343.txt
  console.log(data.hash) // 23123123214242424
})
```
CLI:
```
$ dataset get http://example.com/my-file.txt -o /my_data
> downloading..
> 232352523523 /my_data/24234234235235.txt
```

### Download, uncompress and cache a directory (tar.gz)
```js
dataset.get('http://example.com/my-files.tar.gz', output_dir).then(function (data) {
  console.log(data.path) // /output_dir/23424343434342343
  console.log(data.hash) // 23123123214242424
})
```
CLI:
```
$ dataset get http://example.com/my-file.tgz -o /my_data
> downloading..
> uncompressing..
> 232352523523 /my_data/24234234235235.txt
```

### Get the checksum of a file
```
$ dataset hash /path/to/my-file.txt
> 2343rksdgsdgsdgsdg334  /path/to/my-file.txt
```
### Pack and get the checksum of a directory
This will generate a ``tar.gz`` file and return the checksum of ther directory.

```
$ dataset pack /my-directory
> 32424234234234242423432   ./my-directory.tgz
```

## Rules
1. A whole dataset will be downloaded and extracted into a single directory
2. A dataset is comprised of resources. Each resource is a URL that is poiting to one of the following:
  - A compressed file
  - An uncompressed file
  - Another dataset
3. Dataset config files can be referenced:
  - By url
  - Path to local file
4. Each dataset should have a README with instructions on how to use the dataset
