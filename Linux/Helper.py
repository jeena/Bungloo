from PyQt4 import QtCore, QtGui, QtWebKit

class WebPage(QtWebKit.QWebPage):
    def __init__(self, parent):
        super(QtWebKit.QWebPage, self).__init__(parent)

    def javaScriptConsoleMessage(self, message, lineNumber, sourceId):
        print str(message) + " on line: " + str(lineNumber) + " Source: " + str(sourceId)

class WebViewCreator(QtGui.QWidget):
    def __init__(self, app, delegate):

        QtGui.QWidget.__init__(self)

        self.app = app
        self.delegate = delegate

        self.view = QtWebKit.QWebView(self)
        self.view.loadFinished.connect(self.load_finished)

        self.page = WebPage(self)
        self.view.setPage(self.page)
        self.page.settings().setAttribute(QtWebKit.QWebSettings.LocalContentCanAccessRemoteUrls, True)

        layout = QtGui.QVBoxLayout(self)
        layout.addWidget(self.view)

        frame = self.view.page().mainFrame()
        frame.addToJavaScriptWindowObject("controller", self.app.controller)
        frame.addToJavaScriptWindowObject("console", self.app.console)

        url = self.app.resources_uri() + "/index.html"
        self.view.load(QtCore.QUrl(url))


    def load_finished(self, ok):
        self.view.page().mainFrame().evaluateJavaScript("var OS_TYPE = 'linux';")
        self.delegate.load_finished(ok)
