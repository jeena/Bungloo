from PyQt4 import QtCore, QtGui, QtWebKit
import Helper, urllib, urllib2

class Preferences:

	def __init__(self, app):

		self.app = app

		# window
		self.window = QtGui.QMainWindow()
		self.window.setWindowTitle("Preferences")
		self.window.resize(480, 186)
		self.window.setMinimumSize(480, 186)
		self.window.setMaximumSize(480, 186)

		# image view
		image = QtGui.QPixmap(self.app.resources_path() + "/Icon.png")
		image_view = QtGui.QLabel(self.window)
		image_view.setGeometry(20, 20, 146, 146)
		image_view.setPixmap(image)
		image_view.setScaledContents(True)

		# info text
		info_text = QtGui.QLabel(self.window)
		info_text.setGeometry(194, 60, 262, 17)
		info_text.setText("Add your entity to log in:")

		# login button
		button = QtGui.QPushButton(self.window)
		button.setText("Login")
		button.setGeometry(390, 109, 72, 32)
		button.setAutoDefault(True)
		self.window.connect(button, QtCore.SIGNAL('clicked()'), self.on_login_button_clicked)

		# text field
		self.text_field = QtGui.QLineEdit(self.window)
		self.text_field.setText("http://jeena.net")
		self.text_field.setPlaceholderText("https://example.tent.is")
		self.text_field.setGeometry(194, 84, 262, 22)
		self.window.connect(self.text_field, QtCore.SIGNAL('returnPressed()'), self.on_login_button_clicked)
		entity = self.app.controller.stringForKey("entity")
		if entity:
			self.text_field.setText(entity)

		# activity_indicator
		self.activity_indicator = QtGui.QProgressBar(self.window)
		self.activity_indicator.setMinimum(0)
		self.activity_indicator.setMaximum(0)
		self.activity_indicator.setGeometry(310, 114, 72, 22)

		self.active(False)


	def quit(self, wiget, foo):
		self.window.hide()
		self.app.quit(self)

	def on_login_button_clicked(self):
		self.active(True)
		self.app.login_with_entity(self.text_field.text())

	def show(self):
		self.window.show()

	def hide(self):
		self.window.hide()

	def active(self, active):
		if active:
			self.activity_indicator.show()
		else:
			self.activity_indicator.hide()

class Timeline:

	def __init__(self, app, action="timeline", title="Tentia"):
		self.app = app
		self.action = action
		self.title = title

		self.window = QtGui.QMainWindow()

		self.window.setWindowTitle(title)

		self.window.resize(380, 600)
		self.window.setMinimumSize(200, 200)

		self.webView = Helper.WebViewCreator(self.app, True, self.window)
		self.webView.load_local(self.load_finished)
		self.window.setCentralWidget(self.webView)

		# self.window.addWidget(self.webView)
		self.initUI()

	def initUI(self):
		newPostAction = QtGui.QAction("&New Post", self.window)        
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		menubar = self.window.menuBar()
		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)

	def show(self):
		self.window.show()

	def hide(self):
		self.window.hide()

	def load_finished(self, widget):
		script = "function HostAppGo() { start('" + self.action + "'); }"
		self.webView.page().mainFrame().evaluateJavaScript(script)

	def set_window_title(self, title):
		self.window.setWindowTitle(title)


class Oauth:

	def __init__(self, app):
		self.app = app
		self.core = Helper.WebViewCreator(self.app)
		self.core.load_local(self.load_finished)

	def load_finished(self, ok):
		if ok:
			script = "function HostAppGo() { start('oauth'); }"
			self.core.page().mainFrame().evaluateJavaScript(script)

	def handle_authentication(self, url):
		self.auth_view = Helper.WebViewCreator(self.app)
		self.auth_view.setWindowTitle("Authentification")

		old_manager = self.auth_view.page().networkAccessManager()
		new_manager = Helper.NetworkAccessManager(old_manager, self.tentia_callback)
		new_manager.authenticationRequired.connect(self.authentication_required)
		self.auth_view.page().setNetworkAccessManager(new_manager)
		self.auth_view.show()
		self.auth_view.load_url(url)
		return False

	def authentication_required(self, reply, authenticator):

		dialog = Login()

		def callback():
			authenticator.setUser(dialog.textName.text())
			authenticator.setPassword(dialog.textPass.text())

		dialog.setInfo(reply.url(), authenticator.realm())
		dialog.accepted.connect(callback)

		dialog.exec_()

	def tentia_callback(self, url):
		script = "tentia_instance.requestAccessToken('" + url.toString() + "');"
		self.core.page().mainFrame().evaluateJavaScript(script)

	def hide(self):
		self.auth_view.hide()


class Login(QtGui.QDialog):
	def __init__(self):
		QtGui.QDialog.__init__(self)
		self.setWindowTitle("Login")

		self.label = QtGui.QLabel(self)
		self.label.setText("The Server requires a username and password.")

		self.textName = QtGui.QLineEdit(self)

		self.textPass = QtGui.QLineEdit(self)
		self.textPass.setEchoMode(QtGui.QLineEdit.Password);
    	#self.textPass.setInputMethodHints(Qt.ImhHiddenText | Qt.ImhNoPredictiveText | Qt.ImhNoAutoUppercase)

		self.buttons = QtGui.QDialogButtonBox(QtGui.QDialogButtonBox.Ok)
		self.buttons.accepted.connect(self.accept)

		layout = QtGui.QVBoxLayout(self)
		layout.addWidget(self.label)
		layout.addWidget(self.textName)
		layout.addWidget(self.textPass)
		layout.addWidget(self.buttons)

	def setInfo(self, url, realm):
		pass
		#self.buttonLogin.clicked.connect(callback)
		#self.label.setText("The server " + url.host() + " requires a username and password.")

class NewPost(QtGui.QMainWindow):
	def __init__(self, app):
		self.app = app
		QtGui.QPlainTextEdit.__init__(self)

		self.textInput = QtGui.QPlainTextEdit(self)
		self.setCentralWidget(self.textInput)
		self.textInput.textChanged.connect(self.onChanged)

		self.setWindowTitle("New Post")
		self.resize(300, 150)
		self.setMinimumSize(100, 100)
		self.initUI()

		self.isPrivate = False
		self.status_id = None
		self.reply_to_entity = None

	def initUI(self):
		newPostAction = QtGui.QAction("&New Post", self)        
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		sendPostAction = QtGui.QAction("&Send Post", self)        
		sendPostAction.setShortcut("Ctrl+Return")
		sendPostAction.setStatusTip("Send post")
		sendPostAction.triggered.connect(self.sendMessage)

		self.statusBar().showMessage('256')

		menubar = self.menuBar()
		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)
		fileMenu.addAction(sendPostAction)

	def setIsPrivate(self, is_private):
		self.isPrivate = is_private

	def toggle_is_private(self):
		self.isPrivate = not self.isPrivate

	def inReplyToStatusIdWithString(self, reply_to, status_id, string):
		self.reply_to_entity = reply_to
		self.status_id = status_id
		self.textInput.setPlainText(string)

		cursor = self.textInput.textCursor()
		cursor.movePosition(QtGui.QTextCursor.End, QtGui.QTextCursor.MoveAnchor)
		self.textInput.setTextCursor(cursor)

	def onChanged(self):
		count = 256 - len(self.textInput.toPlainText())
		self.statusBar().showMessage(str(count))

	def sendMessage(self):
		message = Helper.PostModel()
		message.text = self.textInput.toPlainText()
		message.inReplyTostatusId = self.status_id
		message.inReplyToEntity = self.reply_to_entity
		message.location = None
		message.imageFilePath = None
		message.isPrivate = self.isPrivate
		self.app.controller.sendMessage(message)
		self.close()