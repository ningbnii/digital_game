#!/bin/bash

yarn build
# 进入dist目录
cd dist || exit
git pull
git add .
git commit -m update
git push