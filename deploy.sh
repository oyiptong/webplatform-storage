#!/bin/bash
set -e
set -x
cd static
npm run dist
cd ..
gcloud app deploy $1
