import gtk, webkit

class Preferences:

	def __init__(self, app):
		self.app = app
		self.window = gtk.Window()
		self.window.set_title("Preferences")
		self.window.set_position(gtk.WIN_POS_CENTER)
		self.window.connect("delete-event", self.quit)

		hbox1 = gtk.HBox()
		self.window.add(hbox1)

		icon = gtk.Image()
		pixbuffer = gtk.gdk.pixbuf_new_from_file(self.app.resources_path() + "Icon.png")
		scaled_buffer = pixbuffer.scale_simple(150, 150, gtk.gdk.INTERP_BILINEAR)
		icon.set_from_pixbuf(scaled_buffer)
		hbox1.pack_start(icon, False, False, 20)

		fix = gtk.Fixed()
		hbox1.pack_start(fix, False, False, 20)

		label = gtk.Label("Please enter your entity:")
		fix.put(label, 0, 30)

		self.entity_entry = gtk.Entry()
		self.entity_entry.set_width_chars(36)
		fix.put(self.entity_entry, 0, 52)

		self.login_button = gtk.Button(label="Login")
		self.login_button.connect("clicked", self.on_login_button_clicked)
		fix.put(self.login_button, 248, 82)

		self.window.show_all()
		self.window.hide()

	def quit(self, wiget, foo):
		self.window.hide()
		self.app.quit(self)

	def on_login_button_clicked(self, widget):
		print "Login"

	def show(self):
		self.window.show()

	def hide(self):
		self.window.hide()

class Timeline:

	def __init__(self, app):
		self.app = app
		self.window = gtk.Window()
		self.window.connect("delete-event", self.quit)

		scroller = gtk.ScrollerWindow()
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
