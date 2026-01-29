#!/usr/bin/env bash

set -e

sudo ./build.sh
cd modules
noodle ./rand_test.bowl
cd -