#!/bin/bash

mkdir -p build
mkdir -p build/bin
mkdir -p build/bungloo
touch build/bungloo/__init__.py

cp Bungloo.py build/bin/bungloo
cp Helper.py Windows.py build/bungloo
cp setup.py build/
cp -r ../WebKit build/bungloo/
cp -r ../images build/bungloo/

# eof
