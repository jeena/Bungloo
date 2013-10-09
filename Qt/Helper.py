from PyQt4 import QtCore, QtGui, QtWebKit

from PyQt4.QtCore import QTimer, QVariant, SIGNAL
from PyQt4.QtGui import *
from PyQt4.QtNetwork import QNetworkAccessManager, QNetworkRequest, QNetworkReply, QSslSocket
from PyQt4.QtWebKit import QWebView
from sys import platform as _platform

import os, sys, array

class Helper:
	@classmethod
	def get_resource_path(cls):
		if Helper.is_windows():
			return os.path.dirname(sys.argv[0])
		elif Helper.is_mac():
			return os.path.dirname(sys.argv[0])
		else:
			return os.path.dirname(__file__)

	@classmethod
	def is_local(cls):
		return os.path.basename(sys.argv[0]) == "Bungloo.py"

	@classmethod
	def is_mac(cls):
		return _platform == "darwin"

	@classmethod
	def is_windows(cls):
		return os.name == "nt"

	@classmethod
	def is_linux(cls):
		return not (Helper.is_windows() or Helper.is_mac())

class WebPage(QtWebKit.QWebPage):
	def __init__(self, parent=0, app=None):
		super(QtWebKit.QWebPage, self).__init__(parent)
		self.setLinkDelegationPolicy(QtWebKit.QWebPage.DelegateExternalLinks)
		self.app = app

	def javaScriptConsoleMessage(self, message, lineNumber, sourceId):
		print str(message) + " on line: " + str(lineNumber) + " Source: " + str(sourceId)

	def checkRequest(self, request):
		print request


class WebViewCreator(QtWebKit.QWebView):
	def __init__(self, app, local=True, parent=None):
		if parent != None:
			QtGui.QWidget.__init__(self)
		else:
			QtGui.QWidget.__init__(self)

		self.app = app
		self.is_local = local
		self.connect(self, SIGNAL("linkClicked (const QUrl&)"), self.app.controller.openQURL)
		self.setPage(WebPage(self, self.app))

		self.setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
		self.customContextMenuRequested.connect(self.context_menu_requested)
		self.actions = []

		self.page().networkAccessManager().sslErrors.connect(lambda reply, errors: self.handleSslErrors(reply, errors))

		def copy_link():
			self.page().triggerAction(QtWebKit.QWebPage.CopyLinkToClipboard)
		self.action_copy_link = QtGui.QAction('Copy Lin&k', self, triggered=copy_link)

	def context_menu_requested(self, point):
		context_menu = QtGui.QMenu()

		for action in self.actions:
			if action.isEnabled():
				context_menu.addAction(action)

		frame = self.page().currentFrame()

		hit_test = frame.hitTestContent(point)
		if unicode(hit_test.linkUrl().toString()):
			context_menu.addAction(self.action_copy_link)

		if self.settings().testAttribute(QtWebKit.QWebSettings.DeveloperExtrasEnabled):
			context_menu.addSeparator()
			context_menu.addAction(self.pageAction(QtWebKit.QWebPage.InspectElement))

		context_menu.exec_(self.mapToGlobal(point))

	def load_local(self, callback=None):
		self.page().settings().setAttribute(QtWebKit.QWebSettings.LocalContentCanAccessRemoteUrls, True)
		self.page().settings().setAttribute(QtWebKit.QWebSettings.LocalStorageEnabled, True)
		self.loadFinished.connect(lambda ok: self.load_finished(ok, callback))

		frame = self.page().mainFrame()
		frame.addToJavaScriptWindowObject("controller", self.app.controller)
		frame.addToJavaScriptWindowObject("__console", self.app.console)

		url = self.app.resources_uri() + "/index.html"
		self.load(QtCore.QUrl(url))

	def load_url(self, url, callback=None):
		self.loadFinished.connect(lambda ok: self.load_finished(ok, callback))
		self.load(QtCore.QUrl(url))

	def load_finished(self, ok, callback=None):
		frame = self.page().mainFrame()
		if self.is_local:
			os_type = "linux"
			if Helper.is_windows:
				os_type = "windows"
			elif Helper.is_mac:
				os_type = "osx"
			frame.evaluateJavaScript("var OS_TYPE = '" + os_type + "';")

			js_plugin_path = os.path.expanduser('~/.config/bungloo2/Plugin.js')
			if os.access(js_plugin_path, os.R_OK):
				func = "setTimeout(function() { loadJsPlugin('file://localhost/" + js_plugin_path + "') }, 1000);"
				frame.evaluateJavaScript(func)

			css_plugin_path = os.path.expanduser('~/.config/bungloo2/Plugin.css')
			if os.access(css_plugin_path, os.R_OK):
				func = "setTimeout(function() { loadCssPlugin('file://localhost/" + css_plugin_path + "') }, 1000);"
				frame.evaluateJavaScript(func)

		if callback:
			callback(ok)

	def handleSslErrors(self, reply, errors):
		if Helper.is_windows: # ignore SSL errors on Windows (yes a uggly workaround, don't know how to fix it yet)
			for error in errors:
				print error.errorString()
			reply.ignoreSslErrors(errors)


class NetworkAccessManager(QNetworkAccessManager):

	def __init__(self, old_manager, bungloo_callback):
		QNetworkAccessManager.__init__(self)

		self.bungloo_callback = bungloo_callback

		self.old_manager = old_manager
		self.setCache(old_manager.cache())
		self.setCookieJar(old_manager.cookieJar())
		self.setProxy(old_manager.proxy())
		self.setProxyFactory(old_manager.proxyFactory())
		self.sslErrors.connect(lambda reply, errors: old_manager.sslErrors)

	def createRequest(self, operation, request, data):
		if request.url().scheme() != "bungloo":
			return QNetworkAccessManager.createRequest(self, operation, request, data)
		else:
			self.bungloo_callback(request.url())
			return QNetworkAccessManager.createRequest(self, QNetworkAccessManager.GetOperation, QNetworkRequest(QtCore.QUrl()))

class PostModel:

	def __init__(self):
		self.text = None
		self.inReplyTostatusId = None
		self.inReplyToEntity = None
		self.location = None
		self.imageFilePath = None
		self.isPrivate = False

class RestorableWindow(QtGui.QMainWindow):

	def __init__(self, action, app):
		self.action = action
		self.app = app
		QtGui.QMainWindow.__init__(self)
		self.restoreGeometry(QtCore.QByteArray.fromRawData(self.app.controller.stringForKey("mainWindowGeometry-" + self.action)))
		self.restoreState(QtCore.QByteArray.fromRawData(self.app.controller.stringForKey("mainWindowState-" + self.action)))

	def closeEvent(self, event):
		self._saveGeometry()

	def _saveGeometry(self):
		self.app.controller.setStringForKey(self.saveGeometry(), "mainWindowGeometry-" + self.action)
		self.app.controller.setStringForKey(self.saveState(), "mainWindowState-" + self.action)

	def hide(self):
		self._saveGeometry()
		QtGui.QMainWindow.close(self)

	def sizeHint(self):
		return QtCore.QSize(300, 500)

	def show(self):
		QtGui.QMainWindow.show(self)
		self.activateWindow()
		self.raise_()
