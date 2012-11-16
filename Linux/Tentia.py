#!/usr/bin/env python
import os, sys, pickle
from PyQt4 import QtCore, QtGui
import Windows

class Tentia:

	def __init__(self):
		self.app = QtGui.QApplication(sys.argv)
		self.controller = Controller()
		self.console = Console()

		self.setup_url_handler()
		self.setup_windows()
		self.preferences.show()
		self.app.exec_()

	def quit(self, sender):
		print "quit"

	def setup_windows(self):
		self.preferences = Windows.Preferences(self)
		#self.timeline = Windows.Timeline(self)
		#self.mentions = Windows.Timeline(self, action="mentions", title="Mentions")

	def resources_path(self):
		return os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

	def resources_uri(self):
		return "file://localhost" + os.path.abspath(os.path.join(self.resources_path(), "WebKit"))

	def login_with_entity(self, entity):
		self.controller.setStringForKey(entity, "entity")
		self.oauth_implementation = Windows.Oauth(self)

	def setup_url_handler(self):
		QtGui.QDesktopServices.setUrlHandler("tentia://", self.reciveURI)

	def reciveURI(uri):
		print uri


class Controller(QtCore.QObject):

	def __init__(self):
		QtCore.QObject.__init__(self)
		self.config_path = os.path.expanduser('~/.tentia.cfg')
		if os.access(self.config_path, os.R_OK):
			with open(self.config_path, 'r') as f:
				self.config = pickle.load(f)
		else:
			print self.config_path + " is not readable"
			self.config = {}

	@QtCore.pyqtSlot(str, str)
	def setStringForKey(self, string, key):
		string, key = str(string), str(key)
		self.config[key] = string
		try:
			with open(self.config_path, 'w+') as f:
				pickle.dump(self.config, f)
		except IOError:
			print self.config_path + " is not writable"
			print "I/O error({0}): {1}".format(e.errno, e.strerror)

	@QtCore.pyqtSlot(str, result=str)
	def stringForKey(self, key):
		key = str(key)
		if key in self.config:
			return self.config[key]
		else:
			return ""

	@QtCore.pyqtSlot(str)
	def openURL(self, url):
		print url
		print QtCore.QUrl(url)
		QtGui.QDesktopServices.openUrl(QtCore.QUrl(url));


class Console(QtCore.QObject):

	@QtCore.pyqtSlot(str)
	def log(self, string):
		print "<js>: " + string

	@QtCore.pyqtSlot(str)
	def warn(self, string):
		print "<js WARN>: " + string

	@QtCore.pyqtSlot(str)
	def error(self, string):
		print "<js ERROR>: " + string

		
if __name__ == "__main__":
	Tentia()