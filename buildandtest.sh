#!/usr/bin/env bash

set -e

sudo ./build.sh
cd test
noodle ./test_suite.bowl
cd -