from gi.repository import Gtk

class PreferencesWindow(Gtk.Window):

	def __init__(self, app):

		self.app = app
		Gtk.Window.__init__(self, title="Preferences")

		self.login_button = Gtk.Button(label="Login")
		self.login_button.connect("clicked", self.on_login_button_clicked)
		self.add(self.login_button)

	def on_login_button_clicked(self, widget):
		print "Login"