#!/usr/bin/env python
import gtk
import TentiaWindows

class Tentia:

	def __init__(self):
		self.setup_preferences_window()
		self.preferences_window.show()
		gtk.main()

	def quit(self, sender):
		gtk.main_quit()

	def setup_preferences_window(self):
		self.preferences_window = TentiaWindows.Preferences(self)

	def resources_path(self):
		return "../"

		
if __name__ == "__main__":
	Tentia()