#!/usr/bin/env ruby -wKU

require "time"

PATH = File.dirname(__FILE__)

`cd "#{PATH}"`
version = `defaults read "#{PATH}/build/Release/Twittia.app/Contents/Info" CFBundleVersion`.delete "\n"
length = `stat -f %z build/Release/Twittia.app.zip`.delete "\n"
signature = `"../Sparkle 1.5b6/Extras/Signing Tools/sign_update.rb" build/Release/Twittia.app.zip dsa_priv.pem`.delete "\n"
date = Time.now.rfc2822

xml =<<XML
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"  xmlns:dc="http://purl.org/dc/elements/1.1/">
   <channel>
      <title>Twittia's Changelog</title>
      <link>http://wiki.github.com/jeena/twittia/</link>
      <description>Most recent changes with links to updates.</description>
      <language>en</language>
      <item>
        <title>Version #{version}</title>
		<sparkle:minimumSystemVersion>10.5.0</sparkle:minimumSystemVersion>
		<sparkle:releaseNotesLink>http://jeenaparadies.net/twittia/ReleaseNotes.html</sparkle:releaseNotesLink>
		<pubDate>#{date}</pubDate>
		<enclosure  url="http://jeenaparadies.net/twittia/Twittia.app.zip"
                            sparkle:version="#{version}"
                            length="#{length}"
                            type="application/octet-stream"
                            sparkle:dsaSignature="#{signature}" />
      </item>
   </channel>
</rss>
XML

File.open("#{PATH}/Appcast.xml", 'w') {|f| f.write(xml) }

exit
`scp build/Release/Twittia.app.zip jeena@jeenaparadies.net:~/jeenaparadies.net/htdocs/twittia/`
`scp Appcast.xml jeena@jeenaparadies.net:~/jeenaparadies.net/htdocs/twittia/`