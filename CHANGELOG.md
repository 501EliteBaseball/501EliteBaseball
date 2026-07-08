# Deploy Script Fix — No rsync

## Fixed
Cloudflare build image does not include `rsync`, so the deploy script failed.

## Changed
Replaced rsync with a POSIX `find ... cp` command that copies only static site files into `dist`.

## Upload
Upload to GitHub root and overwrite:
- deploy.sh
- CHANGELOG.md
