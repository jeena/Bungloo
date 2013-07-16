from PyQt4 import QtCore, QtGui, QtWebKit
import Helper, urllib, urllib2, os

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

	def __init__(self, app, action="timeline", title="Bungloo", custom_after_load=None):
		self.app = app
		self.action = action
		self.title = title
		self.custom_after_load = custom_after_load

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
		menubar = self.window.menuBar()

		newPostAction = QtGui.QAction("&New Post", self.window)
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		findEntityAction = QtGui.QAction("&Open Profile for Entity ...", self.window)
		findEntityAction.setShortcut("Ctrl+u")
		findEntityAction.setStatusTip("Find entity and open its profile view")
		findEntityAction.triggered.connect(self.app.find_entity_show)

		closeAction = QtGui.QAction("&Close Window", self.window)
		closeAction.setShortcut("Ctrl+w")
		closeAction.setStatusTip("Close this window")
		closeAction.triggered.connect(self.window.close)

		logOutAction = QtGui.QAction("&Log Out", self.window)
		logOutAction.setStatusTip("Log out from this entity")
		logOutAction.triggered.connect(self.app.log_out)

		exitAction = QtGui.QAction("&Exit", self.window)
		exitAction.setShortcut("Ctrl+Q")
		exitAction.setStatusTip("Exit Bungloo")
		exitAction.triggered.connect(QtGui.qApp.quit)

		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)
		fileMenu.addAction(findEntityAction)
		fileMenu.addAction(closeAction)
		fileMenu.addSeparator()
		fileMenu.addAction(logOutAction)
		fileMenu.addAction(exitAction)

		timelineAction = QtGui.QAction("&Timeline", self.window)
		timelineAction.setShortcut("Ctrl+1")
		timelineAction.setStatusTip("Show Timeline")
		timelineAction.triggered.connect(self.app.timeline_show)

		mentionsAction = QtGui.QAction("&Mentions", self.window)
		mentionsAction.setShortcut("Ctrl+2")
		mentionsAction.setStatusTip("Show Mentions")
		mentionsAction.triggered.connect(self.app.mentions_show)

		conversationAction = QtGui.QAction("&Conversation", self.window)
		conversationAction.setShortcut("Ctrl+3")
		conversationAction.setStatusTip("Show Conversation")
		conversationAction.triggered.connect(self.app.conversation_show)

		profileAction = QtGui.QAction("&Profile", self.window)
		profileAction.setShortcut("Ctrl+4")
		profileAction.setStatusTip("Show Profile")
		profileAction.triggered.connect(self.app.profile_show)

		searchAction = QtGui.QAction("&Search", self.window)
		searchAction.setShortcut("Ctrl+5")
		searchAction.setStatusTip("Show Search")
		searchAction.triggered.connect(self.app.search_show)

		nextAction = QtGui.QAction("&Next View", self.window)
		nextAction.setShortcut("Ctrl+6")
		nextAction.setStatusTip("Show Next")
		nextAction.triggered.connect(self.app.next_show)

		windowMenu = menubar.addMenu("&View")
		windowMenu.addAction(timelineAction)
		windowMenu.addAction(mentionsAction)
		windowMenu.addAction(conversationAction)
		windowMenu.addAction(profileAction)
		windowMenu.addAction(searchAction)
		windowMenu.addSeparator()
		windowMenu.addAction(nextAction)

		aboutAction = QtGui.QAction("&About Bungloo", self.window)
		aboutAction.setStatusTip("Open about page in Webbrowser")
		aboutAction.triggered.connect(self.app.open_about)

		developerExtrasAction = QtGui.QAction("&Developer Extras", self.window)
		developerExtrasAction.setStatusTip("Activate webkit inspector")
		developerExtrasAction.triggered.connect(self.developer_extras)

		helpMenu = menubar.addMenu("&Help")
		helpMenu.addAction(aboutAction)
		helpMenu.addAction(developerExtrasAction)

	def show(self):
		self.window.show()
		
	def close(self):
		self.window.close()

	def hide(self):
		self.window.hide()

	def load_finished(self, widget):
		script = "function HostAppGo() { start('" + self.action + "'); }"
		if self.custom_after_load:
			script = self.custom_after_load
		self.webView.page().mainFrame().evaluateJavaScript(script)

	def set_window_title(self, title):
		self.window.setWindowTitle(title)

	def evaluateJavaScript(self, func):
		return self.webView.page().mainFrame().evaluateJavaScript(func)

	def developer_extras(self, widget):
		QtWebKit.QWebSettings.globalSettings().setAttribute(QtWebKit.QWebSettings.DeveloperExtrasEnabled, True)


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
		script = "bungloo.oauth.authenticate();"
		self.core.page().mainFrame().evaluateJavaScript(script)

	def log_out(self):
		script = "bungloo.oauth.logout()";
		self.core.page().mainFrame().evaluateJavaScript(script)

	def handle_authentication(self, url):
		self.auth_view = Helper.WebViewCreator(self.app)
		self.auth_view.setWindowTitle("Authentication")

		old_manager = self.auth_view.page().networkAccessManager()
		new_manager = Helper.NetworkAccessManager(old_manager, self.bungloo_callback)
		new_manager.authenticationRequired.connect(self.authentication_required)
		new_manager.sslErrors.connect(lambda reply, errors: self.handleSslErrors(reply, errors))
		self.auth_view.page().setNetworkAccessManager(new_manager)
		self.auth_view.show()
		print url
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
		script = "bungloo.oauth.requestAccessToken('" + url.toString() + "');"
		self.core.page().mainFrame().evaluateJavaScript(script)

	def hide(self):
		if hasattr(self, "auth_view"):
			self.auth_view.hide()

	def handleSslErrors(self, reply, errors):
		if os.name == "nt": # ignore SSL errors on Windows (yes a uggly workaround, don't know how to fix it yet)
			for error in errors:
				print error.errorString()
			reply.ignoreSslErrors(errors)



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
	def __init__(self, app, string=None, mentions="[]", is_private=False, post_id=None):
		self.app = app
		self.string = string
		self.mentions = mentions
		self.is_private = is_private
		self.post_id = post_id

		Helper.RestorableWindow.__init__(self, "newpost", self.app)
		self.activateWindow()
		self.raise_()

		self.setWindowIcon(QtGui.QIcon(self.app.resources_path() + "/images/Icon.png"))

		self.webView = Helper.WebViewCreator(self.app, True, self)
		self.webView.load_local(self.load_finished)
		self.setCentralWidget(self.webView)

		self.initUI()

		self.webView.triggerPageAction(QtWebKit.QWebPage.InspectElement)

		self.setWindowTitle("New Post")
		self.resize(300, 150)
		self.setMinimumSize(100, 100)

	def initUI(self):
		newPostAction = QtGui.QAction("&New Post", self)
		newPostAction.setShortcut("Ctrl+N")
		newPostAction.setStatusTip("Open new post window")
		newPostAction.triggered.connect(self.app.controller.openNewMessageWidow)

		sendPostAction = QtGui.QAction("&Send Post", self)
		sendPostAction.setShortcut("Ctrl+Return")
		sendPostAction.setStatusTip("Send post")
		sendPostAction.triggered.connect(self.sendMessage)

		hideAction = QtGui.QAction("&Close Window", self)
		hideAction.setShortcut("Ctrl+W")
		hideAction.setStatusTip("Close this window")
		hideAction.triggered.connect(self.close)

		exitAction = QtGui.QAction("&Exit", self)
		exitAction.setShortcut("Ctrl+Q")
		exitAction.setStatusTip("Exit Bungloo")
		exitAction.triggered.connect(QtGui.qApp.quit)

		menubar = self.menuBar()
		fileMenu = menubar.addMenu("&File")
		fileMenu.addAction(newPostAction)
		fileMenu.addAction(sendPostAction)
		fileMenu.addAction(hideAction)
		fileMenu.addSeparator()
		fileMenu.addAction(exitAction)

		togglePrivateAction = QtGui.QAction("&Toggle Private", self)
		togglePrivateAction.setShortcut("Ctrl+P")
		togglePrivateAction.setStatusTip("Toogle if private post")
		togglePrivateAction.triggered.connect(self.toggleIsPrivate)

		addImageAction = QtGui.QAction("Add &Image", self)
		addImageAction.setShortcut("Ctrl+I")
		addImageAction.setStatusTip("Add image to post")
		addImageAction.triggered.connect(self.openFileDialog)

		editMenu = menubar.addMenu("&Edit")
		editMenu.addAction(togglePrivateAction)
		editMenu.addAction(addImageAction)

		aboutAction = QtGui.QAction("&About Bungloo", self)
		aboutAction.setStatusTip("Open about page in Webbrowser")
		aboutAction.triggered.connect(self.app.open_about)

		developerExtrasAction = QtGui.QAction("&Developer Extras", self)
		developerExtrasAction.setStatusTip("Activate webkit inspector")
		developerExtrasAction.triggered.connect(self.developer_extras)

		helpMenu = menubar.addMenu("&Help")
		helpMenu.addAction(aboutAction)
		helpMenu.addAction(developerExtrasAction)


	def load_finished(self, widget):
		is_private = "false"
		if self.is_private:
			is_private = "true"

		post_id = ""
		if self.post_id:
			post_id = self.post_id

		callback = "function() { bungloo.newpost.setString('%s'); bungloo.newpost.setIsPrivate(%s); bungloo.newpost.setMentions(%s); bungloo.newPostAction.setPostId(%s); }" % (self.string, is_private, self.mentions, post_id)

		script = "function HostAppGo() { start('newpost', " + callback + "); }"
		self.webView.page().mainFrame().evaluateJavaScript(script)
		self.webView.setFocus()

	def toggleIsPrivate(self):
		script = "bungloo.newpost.toggleIsPrivate();"
		self.webView.page().mainFrame().evaluateJavaScript(script)

	def sendMessage(self):
		script = "bungloo.newpost.send()"
		self.webView.page().mainFrame().evaluateJavaScript(script)
		self.close()
		
		"""
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
		"""

	def openFileDialog(self):
		fileNamePath = QtGui.QFileDialog.getOpenFileName(self, "Choose a image", "", "Images (*.png *.gif *.jpg *.jpeg)")
		if len(fileNamePath) > 0:
			self.imageFilePath = str(fileNamePath)
		else:
			self.imageFilePath = None

	def developer_extras(self, widget):
		QtWebKit.QWebSettings.globalSettings().setAttribute(QtWebKit.QWebSettings.DeveloperExtrasEnabled, True)


