#!/bin/bash

VERSION="2.0.0"
DEPLOYPATH="bungloo-$VERSION"
LINUXPATH=".."
SHAREDPATH="../.."

rm -rf $DEPLOYPATH

mkdir -p $DEPLOYPATH
mkdir -p $DEPLOYPATH/bin
mkdir -p $DEPLOYPATH/bungloo
touch $DEPLOYPATH/bungloo/__init__.py

cp $LINUXPATH/Bungloo.py $DEPLOYPATH/bin/bungloo
cp $LINUXPATH/Helper.py $LINUXPATH/Windows.py $DEPLOYPATH/bungloo
cat setup.py | sed -e "s/{VERSION}/$VERSION/g" > $DEPLOYPATH/setup.py
cat Makefile | sed -e "s/{VERSION}/$VERSION/g" > $DEPLOYPATH/Makefile
cp -r $SHAREDPATH/WebKit $DEPLOYPATH/bungloo/
cp -r $SHAREDPATH/images $DEPLOYPATH/bungloo/
cp $SHAREDPATH/readme.md $DEPLOYPATH/README
cp $SHAREDPATH/LICENCE.txt $DEPLOYPATH/COPYING
cp -r debian $DEPLOYPATH/
cp bungloo.desktop $DEPLOYPATH/

cd $DEPLOYPATH
make builddeb

# eof
