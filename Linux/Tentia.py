#!/usr/bin/env python
import sys
from PyQt4 import QtCore, QtGui
import TentiaWindows

class Tentia:

	def __init__(self):
		self.app = QtGui.QApplication(sys.argv)
		self.controller = Controller(self)

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

	def login_with_entity(self, entity):
		self.controller.setStringForKey("entity", entity)
		self.oauth_implementation = TentiaWindows.OauthImplementation(self)

	def controller():
		return self.controller;


class Controller:

	def __init__(self, app):
		self.app = app
		self.user_defaults = {}

	def setStringForKey(self, string, key):
		self.user_defaults[string] = key

	def getStringForKey(self, key):
		return self.user_defaults[key]
		
if __name__ == "__main__":
	Tentia()