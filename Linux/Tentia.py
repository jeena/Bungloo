#!/usr/bin/env python
import os
import sys
from PyQt4 import QtCore, QtGui
import TentiaWindows

class Tentia:

	def __init__(self):
		self.app = QtGui.QApplication(sys.argv)
		self.controller = Controller()
		self.console = Console()

		self.setup_windows()
		self.preferences.show()
		self.app.exec_()

	def quit(self, sender):
		print "quit"

	def setup_windows(self):
		self.preferences = TentiaWindows.Preferences(self)
		#self.timeline = TentiaWindows.Timeline(self)
		#self.mentions = TentiaWindows.Timeline(self, action="mentions", title="Mentions")

	def resources_path(self):
		return "../"

	def resources_uri(self):
		return "file://localhost" + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', "WebKit"))


	def login_with_entity(self, entity):
		self.controller.setStringForKey("entity", entity)
		self.oauth_implementation = TentiaWindows.OauthImplementation(self)

	def controller():
		return self.controller;


class Controller(QtCore.QObject):

	user_defaults = {}

	@QtCore.pyqtSlot(str, str)
	def setStringForKey(self, string, key):
		self.user_defaults[string] = key

	def stringForKey(self, key):
		if key in self.user_defaults:
			return self.user_defaults[key]


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