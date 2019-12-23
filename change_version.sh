#!/bin/bash

if [ $# -ne 2 ]
then
  echo "Usage: `basename $0` {old version} {new version}"
  exit -1
fi

find . -name index.html -exec sed -i "" -e "s|Price Tracker\(.*\)$1|Price Tracker\1$2|" {} \;
find . -name setup.py -exec sed -i "" -e "s|version\(.*\)$1|version\1$2|" {} \;
