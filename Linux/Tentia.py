#!/usr/bin/env python
import gtk
import TentiaWindows

class Tentia:

	def __init__(self):
		self.controller = Controller()

		self.setup_windows()
		self.preferences.show()
		gtk.main()

	def quit(self, sender):
		gtk.main_quit()

	def setup_windows(self):
		self.preferences = TentiaWindows.Preferences(self)
		self.timeline = TentiaWindows.Timeline(self)
		self.mentions = TentiaWindows.Timeline(self, action="mentions", title="Mentions")

	def resources_path(self):
		return "../"

	def login_with_entity(self, entity):
		self.controller.setString_forKey_("entity", entity)
		self.oauth_implementation = TentiaWindows.OauthImplementation(self)

	def controller():
		return self.controller;


class Controller:

	def __init__(self, app):
		self.app = app

	def setString_forKey_(self, string, key):
		self.user_defaults[string] = key

	def getStringForKey_(self, key):
		return self.user_defaults[key]
		
if __name__ == "__main__":
	Tentia()