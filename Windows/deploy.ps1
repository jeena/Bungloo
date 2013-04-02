
mkdir bungloo
Copy-Item ../Qt/* bungloo -Recurse
Copy-Item ../WebKit bungloo -Recurse
Copy-Item ../images bungloo -Recurse
Copy-Item setup.py bungloo
touch bungloo/__init__.py
Copy-Item msvcp90.dll bungloo