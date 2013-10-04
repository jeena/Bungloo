#!/bin/bash

rm -rf bungloo
mkdir bungloo
cp -r ../Qt/* bungloo
cp -r ../WebKit bungloo
cp -r ../images bungloo
cp Icon.icns bungloo/images
cp setup.py bungloo
cp Info.plist bungloo
cd bungloo
python setup.py py2app
#mv dist/Bungloo.app ..
cd ..
#rm -rf bungloo