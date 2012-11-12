from PyQt4 import QtCore, QtGui, QtWebKit

class Preferences:

	def __init__(self, app):
		self.app = app
		self.window = QtGui.QMainWindow()
		self.window.setWindowTitle("Preferences")
		self.window.resize(300, 500)
		self.window.setMinimumSize(150, 150)
		self.window.move(0, 0)

		#hbox1 = QtGui.QHBoxLayout()
		#self.window.addWidget(hbox1)

		image = QtGui.QPixmap(self.app.resources_path() + "Icon.png")

		label = QtGui.QLabel(self.window)
		label.setGeometry(20, 20, 150, 150)
		label.setPixmap(image)
		label.setScaledContents(True)




		
		#scaled_buffer = pixbuffer.scale_simple(150, 150, gtk.gdk.INTERP_BILINEAR)
		#icon.set_from_pixbuf(scaled_buffer)
		#hbox1.pack_start(icon, False, False, 20)
#
		#fix = gtk.Fixed()
		#hbox1.pack_start(fix, False, False, 20)
#
		#label = gtk.Label("Please enter your entity:")
		#fix.put(label, 0, 30)
#
		#self.entity_entry = gtk.Entry()
		#self.entity_entry.set_width_chars(36)
		#fix.put(self.entity_entry, 0, 52)
#
		#self.login_button = gtk.Button(label="Login")
		#self.login_button.connect("clicked", self.on_login_button_clicked)
		#fix.put(self.login_button, 248, 82)

	def quit(self, wiget, foo):
		self.window.hide()
		self.app.quit(self)

	def on_login_button_clicked(self, widget):
		self.app.login_with_entity(self.entity_entry.get_text())

	def show(self):
		self.window.show()

	def hide(self):
		self.window.hide()


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

class OauthImplementation:

	def __init__(self, app):
		self.app = app
		self.web_view = gtk.WebView()
		self.init_web_view()

	def init_web_view(self):
		self.web_view.connect("load-finished", self.load_finished)
		self.web_view.open(self.app.resources_path() + "index_oauth.html")

	def load_finished(self, widget):
		script = "setTimeout( function() { tentia_oauth = new OauthImplementation(); }, 2);"
		self.web_view.execute_script(stript)
