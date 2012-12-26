#!/usr/bin/env python
import os, sys, pickle
from PyQt4 import QtCore, QtGui, QtWebKit
import Windows, Helper

class Tentia:

	def __init__(self):
		self.app = QtGui.QApplication(sys.argv)
		self.new_message_windows = []
		self.controller = Controller(self)
		self.console = Console()

		self.preferences = Windows.Preferences(self)
		self.preferences.show()

		if self.controller.stringForKey("user_access_token") != "":
			self.authentification_succeded()

		self.app.exec_()

	def resources_path(self):
		return os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

	def resources_uri(self):
		return "file://localhost" + os.path.abspath(os.path.join(self.resources_path(), "WebKit"))

	def login_with_entity(self, entity):
		self.controller.setStringForKey(entity, "entity")
		self.oauth_implementation = Windows.Oauth(self)

	def authentification_succeded(self):
		self.preferences.hide()
		if hasattr(self, "oauth_implementation"):
			self.oauth_implementation.hide()
		self.preferences.active(False)
		self.init_web_views()

	def init_web_views(self):
		self.timeline = Windows.Timeline(self)
		self.mentions = Windows.Timeline(self, "mentions", "Mentions")

		self.timeline.show()
		#self.mentions.show()


class Controller(QtCore.QObject):

	def __init__(self, app):
		QtCore.QObject.__init__(self)
		self.app = app

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
		self.app.oauth_implementation.handle_authentication(str(url))

	@QtCore.pyqtSlot()
	def loggedIn(self):
		self.app.authentification_succeded()

	@QtCore.pyqtSlot(int)
	def unreadMentions(self, count):
		i = int(count)
		if i > 0:
			self.app.timeline.set_window_title("Tentia (^" + count + ")")
		else:
			self.app.timeline.set_window_title("Tentia")

	@QtCore.pyqtSlot(str, str, str, str)
	def notificateUserAboutMention(self, text, name, post_id, entity):
		print "notificateUserAboutMention is not implemented yet"

	@QtCore.pyqtSlot(str, str, str)
	def openNewMessageWidow(self, string):
		print "openNewMessageWidow is not implemented yet"

	@QtCore.pyqtSlot(str, str, str, bool)
	def openNewMessageWindowInReplyTostatusIdwithStringIsPrivate(self, entity, status_id, string, is_private):
		new_message_window = Windows.NewPost()
		new_message_window.inReplyToStatusIdWithString(entity, status_id, string)
		new_message_window.setIsPrivate(is_private)
		new_message_window.show()
		new_message_window.setAttribute(QtCore.Qt.WA_DeleteOnClose)
		self.app.new_message_windows.append(new_message_window)

	@QtCore.pyqtSlot(str, str)
	def showConversation(self, id, entity):
		print "showConversation is not implemented yet"

	@QtCore.pyqtSlot(str)
	def authentificationDidNotSucceed(self, errorMessage):
		msgBox = QtGui.QMessageBox()
		msgBox.setText(errorMessage)
		msgBox.exec_()
	
	@QtCore.pyqtSlot(str, str)
	def alertTitleWithMessage(self, title, message):
		msgBox = QtGui.QMessageBox()
		msgBox.setText(title)
		msgBox.setInformativeText(message)
		msgBox.exec_()

	def logout(self, sender):
		print "logout is not implemented yet"


class Console(QtCore.QObject):

	@QtCore.pyqtSlot(str)
	def log(self, string):
		print "<js>: " + string

	@QtCore.pyqtSlot(str)
	def error(self, string):
		print "<js ERROR>: " + string

	@QtCore.pyqtSlot(str)
	def warn(self, string):
		print "<js WARN>: " + string

	@QtCore.pyqtSlot(str)
	def notice(self, string):
		print "<js NOTICE>: " + string

	@QtCore.pyqtSlot(str)
	def debug(self, string):
		print "<js DEBUG>: " + string

		
if __name__ == "__main__":
	Tentia()