#!/usr/bin/env ruby -wKU
require 'time'

path = File.dirname File.expand_path(__FILE__)

# system "cd \"#{path}/build/Release/\"; zip -r Twittia.app.zip Twittia.app; cd \"#{path}\""
version = `defaults read \"#{path}/build/Release/Twittia.app/Contents/Info\" CFBundleVersion`.gsub(/\n/,'')
length = `stat -f %z \"#{path}/build/Release/Twittia.app.zip\"`.gsub(/\n/,'')
signature = `ruby \"#{path}/../Sparkle\ 1.5b6/Extras/Signing Tools/sign_update.rb\" \"#{path}/build/Release/Twittia.app.zip\" \"#{path}/dsa_priv.pem\"`.gsub(/\n/,'')

xml = <<XML
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"  xmlns:dc="http://purl.org/dc/elements/1.1/">
   <channel>
      <title>Twittia's Changelog</title>
      <link>http://github.com/downloads/jeena/Twittia/Appcast.xml</link>
      <description>Most recent changes with links to updates.</description>
      <language>en</language>
      <item>
        <title>Version #{version}</title>
		<sparkle:minimumSystemVersion>10.5.0</sparkle:minimumSystemVersion>
		<sparkle:releaseNotesLink>http://jeenaparadies.net/twittia/ReleaseNotes.html</sparkle:releaseNotesLink>
		<pubDate>#{Time.now.rfc2822}</pubDate>
		<enclosure	url="http://jeenaparadies.net/twittia/Twittia.app.zip"
					sparkle:version="#{version}"
					length="#{length}"
					type="application/octet-stream"
					sparkle:dsaSignature="#{signature}" />
      </item>
   </channel>
</rss>
XML


File.open("#{path}/Appcast.xml", 'w') {|f| f.write(xml) }
system "scp \"#{path}/build/Release/Twittia.app.zip\" jeena@jeenaparadies.net:~/jeenaparadies.net/htdocs/twittia/"
system "scp \"#{path}/ReleaseNotes.html\" jeena@jeenaparadies.net:~/jeenaparadies.net/htdocs/twittia/"
system "scp \"#{path}/Appcast.xml\" jeena@jeenaparadies.net:~/jeenaparadies.net/htdocs/twittia/"

puts "Done."