from PyQt4 import QtCore, QtGui, QtWebKit
import Helper

class Preferences:

	def __init__(self, app):

		self.app = app

		# window
		self.window = QtGui.QMainWindow()
		self.window.setWindowTitle("Preferences")
		self.window.resize(480, 186)
		self.window.setMinimumSize(480, 186)
		self.window.setMaximumSize(480, 186)
		self.window.move(1400, 700)

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

	def __init__(self, app, action="home_timeline", title="Tentia"):
		self.app = app
		self.action = action
		self.title = title

		self.window = gtk.Window()
		self.window.connect("delete-event", self.quit)
		self.window.set_title(self.title)
		self.window.set_position(gtk.WIN_POS_CENTER)
		self.window.set_size_request(390, 650)

		scroller = gtk.ScrolledWindow()
		self.window.add(scroller)

		self.web_view = webkit.WebView()
		scroller.add(self.web_view)

	def quit(self, widget, foo):
		self.window.hide()
		self.app.quit(self)

	def show(self):
		self.window.show()

	def hide(self):
		self.window.hide()

	def init_web_view(self):
		self.web_view.connect("load-finished", self.load_finished)
		self.web_view.open(self.app.resources_path() + "index.html")

	def load_finished(self, widget):
		delay = 1 
		if self.action == "mentions":
			delay = 1000

		script = "setTimeout(\
			function() {\
				tentia_instance = new Core('" + self.action + "');\
				document.getElementsByTagName('body')[0].appendChild(tentia_instance.body);\
				setTimeout(function(){ loadPlugin(controller.pluginURL()) }, 1); }, " + delay + "\
			);"

		self.web_view.execute_script(script)

class Oauth:

	def __init__(self, app):
		self.app = app
		self.window = Helper.WebViewCreator(self.app, self)

	def load_finished(self, ok):
		if ok:
			script = "function HostAppGo() { start('oauth'); }"
			self.window.view.page().mainFrame().evaluateJavaScript(script)

