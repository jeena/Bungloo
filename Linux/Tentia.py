#!/usr/bin/env python
from gi.repository import Gtk
import TentiaWindows

class Tentia:

	def __init__(self):
		self.setup_preferences_window()
		self.preferences_window.show_all()
		Gtk.main()

	def quit(self):
		Gtk.main_quit()

	def setup_preferences_window(self):
		self.preferences_window = TentiaWindows.Preferences(self)

		
if __name__ == "__main__":
	Tentia()