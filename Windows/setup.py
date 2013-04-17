#!/usr/bin/env python2

import os
from distutils.core import setup
import py2exe

files = []
for dirname, dirnames, filenames in os.walk('WebKit'):
    for filename in filenames:
        files += [(dirname, [os.path.join(dirname, filename)])]

for dirname, dirnames, filenames in os.walk('images'):
    for filename in filenames:
        files += [(dirname, [os.path.join(dirname, filename)])]

imageformats = []
for dirname, dirnames, filenames in os.walk('C:\\Python27\\Lib\\site-packages\\PyQt4\\plugins\\imageformats'):
    for filename in filenames:
        imageformats += [os.path.join(dirname, filename)]

files += [('imageformats', imageformats)]

setup(
    name = "Bungloo",
    version = "1.4.0",
    author = "Jeena Paradies",
    author_email = "spam@jeenaparadies.net",
    url = "http://jabs.nu/bungloo",
    license = "BSD license",
    data_files = files,
    windows = [{
        'script': "Bungloo.py",
        'icon_resources': [(1, 'images/Icon.ico')],
    }],
    options = {
        "py2exe": {
            "includes": ["sip", "ssl", "PyQt4.QtCore", "PyQt4.QtGui", "PyQt4.QtNetwork"],
        }
    }
)
