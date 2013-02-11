#!/usr/bin/env ruby -wKU
require 'time'

def test var, message
	unless var
		puts message
		exit
	end
end

path = File.dirname File.expand_path(__FILE__)
mac_path = File.expand_path(path + "/..")
release_path = mac_path + "/build/Release/"

version = `defaults read \"#{release_path}/Tentia.app/Contents/Info\" CFBundleVersion`.gsub(/\n/,'')
length = `stat -f %z \"#{release_path}/Tentia.app.zip\"`.gsub(/\n/,'')
signature = `ruby \"#{mac_path}/../../Sparkle\ 1.5b6/Extras/Signing Tools/sign_update.rb\" \"#{release_path}/Tentia.app.zip\" \"#{mac_path}/publish/dsa_priv.pem\"`.gsub(/\n/,'')

test version, "Couldn't find version"
test length, "Couldn't find length"
test signature, "Couldn't find signature"

unless File.exists? "#{release_path}/Tentia.app/Contents/Resources/dsa_pub.pem"
	puts "#{release_path}/Tentia.app/Contents/dsa_pub.pem"
	exit
end

xml = <<XML
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle"  xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>Tentia's Changelog</title>
		<link>http://jabs.nu/Tentia/download/Appcast.xml</link>
		<description>Most recent changes with links to updates.</description>
		<language>en</language>
		<item>
			<title>Version #{version}</title>
			<sparkle:minimumSystemVersion>10.5.0</sparkle:minimumSystemVersion>
			<sparkle:releaseNotesLink>http://jabs.nu/Tentia/download/ReleaseNotes.html</sparkle:releaseNotesLink>
			<pubDate>#{Time.now.rfc2822}</pubDate>
			<enclosure	url="http://jabs.nu/Tentia/download/Tentia.app.zip"
						sparkle:version="#{version}"
						length="#{length}"
						type="application/octet-stream"
						sparkle:dsaSignature="#{signature}" />
		</item>
	</channel>
</rss>
XML

File.open("#{path}/Appcast.xml", 'w') {|f| f.write(xml) }
system "scp \"#{release_path}/Tentia.app.zip\" jeena@jeena.net:~/jabs.nu/public/Tentia/download/"
system "scp \"#{path}/ReleaseNotes.html\" jeena@jeena.net:~/jabs.nu/public/Tentia/download/"
system "scp \"#{path}/Appcast.xml\" jeena@jeena.net:~/jabs.nu/public/Tentia/download/"

puts "Done."