#!/bin/bash

HERE=`pwd`
TMP="/tmp"

rm -rf Bungloo.app
rm -rf $TMP/bungloo
mkdir $TMP/bungloo
cp -r ../Qt/* $TMP/bungloo
cp -r ../WebKit $TMP/bungloo
cp -r ../images $TMP/bungloo
cp Icon.icns $TMP/bungloo/images
cp setup.py $TMP/bungloo
cp Info.plist $TMP/bungloo
cd $TMP/bungloo
python setup.py py2app
mv $TMP/bungloo/dist/Bungloo.app $HERE
cd $HERE
rm -rf $TMP/bungloo
Bungloo.app/Contents/MacOS/Bungloo