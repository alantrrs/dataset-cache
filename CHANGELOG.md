# Changelog

## v2.0.1 (11 Oct 2016)
- Fix url parsing when downloading files from URLs with query params

## v2.0.0 (11 Oct 2016)
- **Breaking**: ``.zip`` and ``.tar.gz`` are no longer automatically extracted.
In order to extract directories you now need to pass ``directory: true``.

## v1.2.0 (17 Jul 2016)
- Upgrade hash-then to v1.1.0 which adds functionality to persist the tar

## v1.1.0 (08 Jun 2016)
- hash is now optional. If a hash is not used, it will not validate or cache
- Don't fail if the target directory already exits. Remove directory first

## v1.0.0 (01 Jun 2016)
- Publish to npm
- Adds progress bar for downloads
- README.md fix
