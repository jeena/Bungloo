import sys, urllib
from PyQt4 import QtCore, QtGui, QtWebKit

"""Html snippet."""
html = """
<html><body>
  <center>
  <script language="JavaScript">
    document.write('<p>Python ' + pyObj.pyVersion + '</p>')
  </script>
  <button onClick="pyObj.showMessage('Hello from WebKit')">Press me</button>
  </center>
</body></html>
"""

class StupidClass(QtCore.QObject):
    """Simple class with one slot and one read-only property."""

    @QtCore.pyqtSlot(str)
    def showMessage(self, msg):
        """Open a message box and display the specified message."""
        QtGui.QMessageBox.information(None, "Info", msg)

    def _pyVersion(self):
        """Return the Python version."""
        return sys.version

    """Python interpreter version property."""
    pyVersion = QtCore.pyqtProperty(str, fget=_pyVersion)

def isBasicAuth(url):
    url_opener = urllib.URLopener()

    try:
        url_opener.open(url)
    except IOError, error_code:
            if error_code[0] == "http error" :
                if error_code[1] == 401:
                    return True
                else:
                    return False

    return False

def main():
    app = QtGui.QApplication(sys.argv)

    myObj = StupidClass()

    webView = QtWebKit.QWebView()
    # Make myObj exposed as JavaScript object named 'pyObj'
    webView.page().mainFrame().addToJavaScriptWindowObject("pyObj", myObj)

    url = "http://lala.home.jeena.net:3002/admin"
    if isBasicAuth(url):
        print "Basic Auth"
    else:
        webView.load(QtCore.QUrl(url))
    #webView.setHtml(html)

    window = QtGui.QMainWindow()
    window.setCentralWidget(webView)
    window.show()

    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
