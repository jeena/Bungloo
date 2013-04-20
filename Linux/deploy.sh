#!/bin/bash

VERSION="1.4.0"
DEPLOYPATH="bungloo-${VERSION}"
QTPATH="../Qt"
SHAREDPATH=".."
DISTPATH="dist"

rm -rf $DEPLOYPATH
rm -rf $DISTPATH

mkdir -p $DEPLOYPATH
mkdir -p $DEPLOYPATH/bin
mkdir -p $DEPLOYPATH/bungloo
touch $DEPLOYPATH/bungloo/__init__.py

cp $QTPATH/Bungloo.py $DEPLOYPATH/bin/bungloo
cp $QTPATH/Helper.py $QTPATH/Windows.py $DEPLOYPATH/bungloo
cat setup.py.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/setup.py
cat Makefile.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/Makefile
cat bungloo.desktop.exmp | sed -e "s/{VERSION}/${VERSION}/g" > $DEPLOYPATH/bungloo.desktop
cp -r $SHAREDPATH/WebKit $DEPLOYPATH/bungloo/
cp -r $SHAREDPATH/images $DEPLOYPATH/bungloo/
cp $SHAREDPATH/readme.md $DEPLOYPATH/README
cp $SHAREDPATH/LICENCE.txt $DEPLOYPATH/COPYING
cp -r debian $DEPLOYPATH/

cd $DEPLOYPATH
make builddeb
make buildrpm

echo "Cleaning up ..."

mv $DISTPATH ..
cd ..

cp bungloo.ebuild.exmp $DISTPATH/bungloo-${VERSION}.ebuild

mv bungloo_${VERSION}_all.deb $DISTPATH
mv bungloo_${VERSION}_amd64.changes $DISTPATH
mv bungloo_${VERSION}.diff.gz $DISTPATH
mv bungloo_${VERSION}.dsc $DISTPATH
mv bungloo_${VERSION}.orig.tar.gz $DISTPATH
mv bungloo_${VERSION}_source.changes $DISTPATH

rm -rf $DEPLOYPATH
rm $DISTPATH/bungloo-${VERSION}-1.src.rpm
mv $DISTPATH/bungloo-${VERSION}-1.noarch.rpm $DISTPATH/bungloo-${VERSION}.noarch.rpm

echo "Done."
echo "dput ppa:jeena/bungloo $DISTPATH/bungloo_${VERSION}_source.changes"

# eof
