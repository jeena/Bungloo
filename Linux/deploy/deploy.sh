#!/bin/bash

VERSION="1.3.0"
DEPLOYPATH="bungloo-${VERSION}"
LINUXPATH=".."
SHAREDPATH="../.."
DISTPATH=dist

rm -rf $DEPLOYPATH
rm -rf $DISTPATH

mkdir -p $DEPLOYPATH
mkdir -p $DEPLOYPATH/bin
mkdir -p $DEPLOYPATH/bungloo
touch $DEPLOYPATH/bungloo/__init__.py

cp $LINUXPATH/Bungloo.py $DEPLOYPATH/bin/bungloo
cp $LINUXPATH/Helper.py $LINUXPATH/Windows.py $DEPLOYPATH/bungloo
cat setup.py.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/setup.py
cat Makefile.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/Makefile
cat bungloo.desktop.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/bungloo.desktop
cp -r $SHAREDPATH/WebKit $DEPLOYPATH/bungloo/
cp -r $SHAREDPATH/images $DEPLOYPATH/bungloo/
cp $SHAREDPATH/readme.md $DEPLOYPATH/README
cp $SHAREDPATH/LICENCE.txt $DEPLOYPATH/COPYING
cp -r debian $DEPLOYPATH/
cp bungloo.desktop $DEPLOYPATH/

cd $DEPLOYPATH
make builddeb
make buildrpm

echo "Cleaning up ..."

mv $DISTPATH ..
cd ..
mv bungloo_${VERSION}_all.deb $DISTPATH

rm bungloo_${VERSION}_amd64.changes
rm bungloo_${VERSION}.diff.gz
rm bungloo_${VERSION}.dsc
rm bungloo_${VERSION}.orig.tar.gz
rm -rf $DEPLOYPATH
rm $DISTPATH/bungloo-${VERSION}-1.src.rpm

echo "Done."


# eof
