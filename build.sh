#!/bin/bash

yarn build
# 进入dist目录
git add .
git commit -m update
git push