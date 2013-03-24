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
		image = QtGui.QPixmap(self.app.resources_path() + "/images/Icon.png")
		image_view = QtGui.QLabel(self.window)
		image_view.setGeometry(20, 20, 146, 146)
		image_view.setPixmap(image)
		image_view.setScaledContents(True)

		self.window.setWindowIcon(QtGui.QIcon(image))

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

	def __init__(self, app, action="timeline", title="Bungloo"):
		self.app = app
		self.action = action
		self.title = title

		self.window = Helper.RestorableWindow(action, self.app)
		self.window.setWindowTitle(title)
		self.window.setWindowIcon(QtGui.QIcon(self.app.resources_path() + "/images/Icon.png"))

		self.webView = Helper.WebViewCreator(self.app, True, self.window)
		self.webView.load_local(self.load_finished)
		self.window.setCentralWidget(self.webView)

		self.initUI()

		self.webView.triggerPageAction(QtWebKit.QWebPage.InspectElement)

	def moveWindow(self, x=0, y=0):
		self.show()
		geo = self.window.geometry()
		self.window.move(geo.x() + x, geo.y() + y)
		self.hide()


	def initUI(self):
		newPostAction = QtGui.QAction("&New Post", self.window)
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		exitAction = QtGui.QAction("&Exit", self.window)
		exitAction.setShortcut("Ctrl+Q")
		exitAction.setStatusTip("Exit Bungloo")
		exitAction.triggered.connect(QtGui.qApp.quit)

		menubar = self.window.menuBar()
		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)
		fileMenu.addAction(exitAction)

		timelineAction = QtGui.QAction("&Timeline", self.window)
		timelineAction.setShortcut("Ctrl+1")
		timelineAction.setStatusTip("Show Timeline")
		timelineAction.triggered.connect(self.app.timeline_show)

		mentionsAction = QtGui.QAction("&Mentions", self.window)
		mentionsAction.setShortcut("Ctrl+2")
		mentionsAction.setStatusTip("Show Mentions")
		mentionsAction.triggered.connect(self.app.mentions_show)

		findEntityAction = QtGui.QAction("&Open Profile", self.window)
		findEntityAction.setShortcut("Ctrl+u")
		findEntityAction.setStatusTip("Find entity and open its profile view")
		findEntityAction.triggered.connect(self.app.find_entity_show)

		hideAction = QtGui.QAction("&Hide window", self.window)
		hideAction.setShortcut("Ctrl+W")
		hideAction.setStatusTip("Hide this window")
		hideAction.triggered.connect(self.hide)

		windowMenu = menubar.addMenu("&Windows")
		windowMenu.addAction(timelineAction)
		windowMenu.addAction(mentionsAction)
		windowMenu.addAction(hideAction)
		windowMenu.addAction(findEntityAction)

	def show(self):
		self.window.show()
		#self.window.raise_()
		#QtGui.qApp.setActiveWindow(self.window)

	def hide(self):
		self.window.hide()

	def load_finished(self, widget):
		script = "function HostAppGo() { start('" + self.action + "'); }"
		self.webView.page().mainFrame().evaluateJavaScript(script)

	def set_window_title(self, title):
		self.window.setWindowTitle(title)

	def evaluateJavaScript(self, func):
		return self.webView.page().mainFrame().evaluateJavaScript(func)


class Oauth:

	def __init__(self, app):
		self.app = app
		self.core = Helper.WebViewCreator(self.app)
		self.core.load_local(self.load_finished)

	def load_finished(self, ok):
		if ok:
			script = "function HostAppGo() { start('oauth'); }"
			self.core.page().mainFrame().evaluateJavaScript(script)

	def login(self):
		script = "bungloo_instance.authenticate();"
		self.core.page().mainFrame().evaluateJavaScript(script)

	def handle_authentication(self, url):
		self.auth_view = Helper.WebViewCreator(self.app)
		self.auth_view.setWindowTitle("Authentication")

		old_manager = self.auth_view.page().networkAccessManager()
		new_manager = Helper.NetworkAccessManager(old_manager, self.bungloo_callback)
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

	def bungloo_callback(self, url):
		script = "bungloo_instance.requestAccessToken('" + url.toString() + "');"
		self.core.page().mainFrame().evaluateJavaScript(script)

	def hide(self):
		if hasattr(self, "auth_view"):
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

class FindEntity(QtGui.QDialog):
	def __init__(self, app):
		QtGui.QDialog.__init__(self)

		self.app = app

		self.setWindowTitle("Open Profile ...")
		self.label = QtGui.QLabel(self)
		self.label.setText("Open the profile of the entity:")
		
		self.textEntity = QtGui.QLineEdit(self)

		self.button = QtGui.QDialogButtonBox(QtGui.QDialogButtonBox.Ok)
		self.button.accepted.connect(self.openProfile)

		layout = QtGui.QVBoxLayout(self)
		layout.addWidget(self.label)
		layout.addWidget(self.textEntity)
		layout.addWidget(self.button)

	def openProfile(self):
		self.app.controller.showProfileForEntity(self.textEntity.text())
		self.hide()
		

class NewPost(Helper.RestorableWindow):
	def __init__(self, app):
		self.app = app
		Helper.RestorableWindow.__init__(self, "newpost", self.app)

		self.setWindowIcon(QtGui.QIcon(self.app.resources_path() + "/images/Icon.png"))

		self.textInput = QtGui.QPlainTextEdit(self)
		self.setCentralWidget(self.textInput)
		self.textInput.textChanged.connect(self.onChanged)

		self.setWindowTitle("New Post")
		self.resize(300, 150)
		self.setMinimumSize(100, 100)
		self.initUI()

		self.setIsPrivate(False)
		self.status_id = None
		self.reply_to_entity = None
		self.imageFilePath = None

	def initUI(self):
		newPostAction = QtGui.QAction("&New Post", self)
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		sendPostAction = QtGui.QAction("&Send Post", self)
		sendPostAction.setShortcut("Ctrl+Return")
		sendPostAction.setStatusTip("Send post")
		sendPostAction.triggered.connect(self.sendMessage)

		togglePrivateAction = QtGui.QAction("&Toggle private", self)
		togglePrivateAction.setShortcut("Ctrl+P")
		togglePrivateAction.setStatusTip("Toogle if private post")
		togglePrivateAction.triggered.connect(self.toggleIsPrivate)

		exitAction = QtGui.QAction("&Exit", self)
		exitAction.setShortcut("Ctrl+Q")
		exitAction.setStatusTip("Exit Bungloo")
		exitAction.triggered.connect(QtGui.qApp.quit)

		menubar = self.menuBar()
		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)
		fileMenu.addAction(sendPostAction)
		fileMenu.addAction(togglePrivateAction)
		fileMenu.addAction(exitAction)

		timelineAction = QtGui.QAction("&Timeline", self)
		timelineAction.setShortcut("Ctrl+1")
		timelineAction.setStatusTip("Show Timeline")
		timelineAction.triggered.connect(self.app.timeline_show)

		mentionsAction = QtGui.QAction("&Mentions", self)
		mentionsAction.setShortcut("Ctrl+2")
		mentionsAction.setStatusTip("Show Mentions")
		mentionsAction.triggered.connect(self.app.mentions_show)

		findEntityAction = QtGui.QAction("&Open Profile", self)
		findEntityAction.setShortcut("Ctrl+u")
		findEntityAction.setStatusTip("Find entity and open its profile view")
		findEntityAction.triggered.connect(self.app.find_entity_show)

		hideAction = QtGui.QAction("&Hide window", self)
		hideAction.setShortcut("Ctrl+W")
		hideAction.setStatusTip("Hide this window")
		hideAction.triggered.connect(self.close)

		windowMenu = menubar.addMenu("&Windows")
		windowMenu.addAction(timelineAction)
		windowMenu.addAction(mentionsAction)
		windowMenu.addAction(findEntityAction)
		windowMenu.addAction(hideAction)

		self.statusBar().showMessage('256')

		self.addButton = QtGui.QToolButton()
		self.addButton.setToolTip("Add photo")
		self.addButton.clicked.connect(self.openFileDialog)
		self.addButton.setAutoRaise(True)
		#addIcon = QtGui.QIcon.fromTheme("insert-image", QtGui.QIcon(self.app.resources_path() + "/images/Actions-insert-image-icon.png"))
		addIcon = QtGui.QIcon(self.app.resources_path() + "/images/glyphicons_138_picture.png")
		self.addButton.setIcon(addIcon)
		self.statusBar().addPermanentWidget(self.addButton)

		self.isPrivateButton = QtGui.QToolButton()
		self.isPrivateButton.setToolTip("Make private")
		self.isPrivateButton.clicked.connect(self.toggleIsPrivate)
		self.isPrivateButton.setAutoRaise(True)
		#self.isPrivateIcon = QtGui.QIcon(self.app.resources_path() + "/images/Lock-Lock-icon.png")
		self.isPrivateIcon = QtGui.QIcon(self.app.resources_path() + "/images/glyphicons_203_lock.png")
		#self.isNotPrivateIcon = QtGui.QIcon(self.app.resources_path() + "/images/Lock-Unlock-icon.png")
		self.isNotPrivateIcon = QtGui.QIcon(self.app.resources_path() + "/images/glyphicons_204_unlock.png")
		self.isPrivateButton.setIcon(self.isNotPrivateIcon)
		self.statusBar().addPermanentWidget(self.isPrivateButton)

		self.sendButton = QtGui.QToolButton()
		self.sendButton.setToolTip("Send")
		self.sendButton.clicked.connect(self.sendMessage)
		self.sendButton.setAutoRaise(True)
		#sendIcon = QtGui.QIcon.fromTheme("mail-send", QtGui.QIcon(self.app.resources_path() + "/images/send-icon.png"))
		sendIcon = QtGui.QIcon(self.app.resources_path() + "/images/glyphicons_123_message_out.png")
		self.sendButton.setIcon(sendIcon)
		self.statusBar().addPermanentWidget(self.sendButton)

	def setIsPrivate(self, is_private):
		self.isPrivate = is_private
		icon = self.isNotPrivateIcon
		if self.isPrivate:
			icon = self.isPrivateIcon

		self.isPrivateButton.setIcon(icon)

	def toggleIsPrivate(self):
		self.setIsPrivate(not self.isPrivate)

	def inReplyToStatusIdWithString(self, reply_to, status_id, string):
		self.reply_to_entity = reply_to
		self.status_id = status_id
		self.textInput.setPlainText(string)

		cursor = self.textInput.textCursor()
		cursor.movePosition(QtGui.QTextCursor.End, QtGui.QTextCursor.MoveAnchor)
		cursor.movePosition(QtGui.QTextCursor.Start, QtGui.QTextCursor.KeepAnchor)
		cursor.movePosition(QtGui.QTextCursor.EndOfLine, QtGui.QTextCursor.KeepAnchor)
		self.textInput.setTextCursor(cursor)

	def onChanged(self):
		count = 256 - len(self.textInput.toPlainText())
		self.statusBar().showMessage(str(count))

	def sendMessage(self):
		count = len(self.textInput.toPlainText())
		if count > 0 and count <= 256:
			message = Helper.PostModel()
			message.text = unicode(self.textInput.toPlainText().toUtf8(), "utf-8")
			message.inReplyTostatusId = self.status_id
			message.inReplyToEntity = self.reply_to_entity
			message.location = None
			message.imageFilePath = self.imageFilePath
			message.isPrivate = self.isPrivate
			self.app.controller.sendMessage(message)
			self.close()
		else:
			 QtGui.qApp.beep()

	def openFileDialog(self):
		fileNamePath = QtGui.QFileDialog.getOpenFileName(self, "Choose a image", "", "Images (*.png *.gif *.jpg *.jpeg)")
		if len(fileNamePath) > 0:
			self.imageFilePath = str(fileNamePath)
		else:
			self.imageFilePath = None



