from gi.repository import Gtk
import webkit

class Preferences(Gtk.Window):

	def __init__(self, app):

		self.app = app
		Gtk.Window.__init__(self, title="Preferences")
		self.connect("delete-event", self.quit)

		self.login_button = Gtk.Button(label="Login")
		self.login_button.connect("clicked", self.on_login_button_clicked)
		self.add(self.login_button)

	def quit(self):
		self.hide_all()
		self.app.quit(self)

	def on_login_button_clicked(self, widget):
		print "Login"


class Timeline(Gtk.Window):

	def __init(self, app):
		self.app = app
		Gtk.Window.__init__(self, title="Tentia")
		self.connect("delete-event", self.quit)
		self.web_view = webkit.WebView()

		scroller = gtk.StrolledWindow()
		self.add(scroller)
		scroller.show()
		scroller.add(self.web_view)
		self.web_view.show()
		self.web_view.open("http://google.com")

	def quit(self)
		self.hide_all()
		self.app.quit(self)
