#!/usr/bin/env bash
set -e

npm run bundle
npm run build

sudo chown betacarinae ./zipped
sudo chown betacarinae ./js

./uninstall.sh
./install.sh