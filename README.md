# Dataset.js
This library provides a solution for downloading and caching datasets.

Dataset.js allows you to download your datasets only once and 
guarantee that the data you're using is the correct one.

## Install
The first step is getting the resources. These resources are usually compressed, so the second 
step is decompressing them into the proper file structure.

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
