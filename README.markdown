Twittia
=======

Twittia is a slim Twitter client for OS X written in mostly JavaScript.
It doesn't implement much of Twitters functionality, only the things **I**
care for. Therefore it is **small** and **fast** and looks good
by doing so. _"Keep it simple, stupid!"_ Is the mantra, therefore there
will not by much more functionality as it is now. But you're welcome to
fork and extend it.

[Download Twittia 2](http://github.com/downloads/jeena/Twittia/Twittia.app.zip)

It works on Mac OS 10.5 and higher.

![Twittia screenshot](http://github.com/downloads/jeena/Twittia/Screen-shot.png)

FAQ:s
-----

1. The global hotkey for a new Tweet is: `Ctrl Alt Cmd t`

2. To change the username you have to open upp Keychain Access.app,
   search for the item "api.twitter.com" and remove or change it.

3. No, there is no icon yet.

4. Yes there is a twittia: url scheme, try it out:
   [twittia:Twittia is the shit](twittia:http://twittia.istheshit.net/)
   
5. Yes, there is a JavaScript-plugin-API. Create this file:
   ~/Library/Application Support/Twittia/Plugin.js


Nice to know
------------

There was a original Twittia 1 which was written in Ruby-Cocoa, it was
quite ok back then, but the code was a mess. And then along came
Tweetie and I lost the desire to write my own Twitter client, because
it was so much further then twittia and looked nicer and so on.

But now Tweetie wasn't update for a really long time, and I really
wanted to see retweets in my stream so I decided to rip out the look
from Twittia 1 and implement it in a new much slimmer version.

And because Twitter offers a JSON API and Twittias rendering Engine is
just a simple WebKit WebView I implemented the core functionality in
JavaScript and am very happy with it.