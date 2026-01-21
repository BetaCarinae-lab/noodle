#!/usr/bin/env bash
set -e

npm run bundle
npm run build

./uninstall.sh
./install.sh