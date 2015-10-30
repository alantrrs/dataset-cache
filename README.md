# Dataset.js
This library defines a common API for installing and interfacing with datasets.
The idea is that using a dataset should be as simple as requiring it into your project.

## Setup
The idea with dataset.js is that you don't have to re-download datasets multiple time and that
you can guarantee that the data you're using is the correct one.
In order to do that, you need to determine a directory to be used specifically for data. e.g ``~/data``
Dataset.js will read this path from the environment variable ``DATASETS_HOME``

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
  - Path to SciHub dataset d/dataset-name
4. Each dataset should have a README with instructions on how to use the dataset
