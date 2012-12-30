from PyQt4 import QtCore, QtGui, QtWebKit

from PyQt4.QtCore import QTimer, QVariant, SIGNAL
from PyQt4.QtGui import *
from PyQt4.QtNetwork import QNetworkAccessManager, QNetworkRequest, QNetworkReply
from PyQt4.QtWebKit import QWebView

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
        if self.is_local:
            self.page().mainFrame().evaluateJavaScript("var OS_TYPE = 'linux';")

        if callback:
            callback(ok)


class NetworkAccessManager(QNetworkAccessManager):

    def __init__(self, old_manager, tentia_callback):
        QNetworkAccessManager.__init__(self)

        self.tentia_callback = tentia_callback

        self.old_manager = old_manager
        self.setCache(old_manager.cache())
        self.setCookieJar(old_manager.cookieJar())
        self.setProxy(old_manager.proxy())
        self.setProxyFactory(old_manager.proxyFactory())
    
    def createRequest(self, operation, request, data):
        if request.url().scheme() != "tentia":
            return QNetworkAccessManager.createRequest(self, operation, request, data)
        else:
            self.tentia_callback(request.url())
            return QNetworkAccessManager.createRequest(self, QNetworkAccessManager.GetOperation, QNetworkRequest(QtCore.QUrl()))
        
class PostModel:

    def __init__(self):
        self.text = None
        self.inReplyTostatusId = None
        self.inReplyToEntity = None
        self.location = None
        self.imageFilePath = None
        self.isPrivate = False

