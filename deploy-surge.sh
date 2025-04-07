#!/usr/bin/env bash

yarn run build
cp CNAME dist/CNAME
cp dist/index.html dist/200.html
surge dist
