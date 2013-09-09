define([
	"helper/HostApp",
	"controller/Timeline",
	"lib/URI",
	"helper/APICalls",
	"helper/Core"
],

function(HostApp, Timeline, URI, APICalls, Core) {


	function Mentions() {

		this.is_not_init = false;
		this.unread_mentions = 0;

		Timeline.call(this);

		this.action = "mentions";
		this.container.className = this.action;
		
		this.hide();
	}

	Mentions.prototype = Object.create(Timeline.prototype);

	Mentions.prototype.show = function() {
		Core.prototype.show.call(this, this.container);
	}

	Mentions.prototype.hide = function() {
		Core.prototype.hide.call(this, this.container);
	}


	Mentions.prototype.newStatus = function(statuses, append) {

		Timeline.prototype.newStatus.call(this, statuses, append);

		if(this.is_not_init) {
			for (var i = 0; i < statuses.posts.length; i++) {
				
				var status = statuses.posts[i];
				var name = bungloo.cache.profiles[status.entity] ? bungloo.cache.profiles[status.entity].name : status.entity

				if(!append && status.type.startsWith("https://tent.io/types/status/v0#")) {
					HostApp.notificateUserAboutMention(status.content.text, name, status.id, status.entity);
				}
			}
		}

		this.is_not_init = true;
	}

	Mentions.prototype.getNewData = function(add_to_search, append, query) {

		add_to_search = add_to_search || {};

		if (!add_to_search["mentions"]) {
			add_to_search["mentions"] = HostApp.stringForKey("entity");
		}

		Timeline.prototype.getNewData.call(this, add_to_search, append, query);

		this.getLatestMentionRead();
	}

	Mentions.prototype.mentionRead = function(id, entity) {
		if (this.unread_mentions > 0) {
			this.unread_mentions--;
			HostApp.unreadMentions(this.unread_mentions);
		}
	}

	Mentions.prototype.setAllMentionsRead = function() {
		this.unread_mentions = 0;
		HostApp.unreadMentions(this.unread_mentions);
		this.updateLatestMentionRead();
	}

	Mentions.prototype.updateLatestMentionRead = function() {

		var cursor_url = HostApp.serverUrl("posts_feed") + "?types=" + "https://tent.io/types/cursor/v0";

		// find the first real post
		for (var i = 0; i < this.body.childNodes.length; i++) {

			var status = this.body.childNodes[i].status;

			if (!status.__repost) {
				if (status && status.type.startsWith("https://tent.io/types/status/v0#")) {

					// First find out if there is such a cursor or if we need to create it first
					APICalls.get(cursor_url, { callback: function(resp) {

						var posts = JSON.parse(resp.responseText).posts;
						var mentions_post = null;
						
						for (var i = 0; i < posts.length; i++) {
							var post = posts[i];

							if(post.type == "https://tent.io/types/cursor/v0#https://tent.io/rels/status-mentions") {

								mentions_post = post;

							}
						};

						// Now prepare the cursor
						

						var data = {
							type: "https://tent.io/types/cursor/v0#https://tent.io/rels/status-mentions",
							content: {},
							permissions: {
								public: false,
							},
							refs: [
								{
									"post": status.id,
									"type": status.type,
									"entity": status.entity
								}
							]
						};

						// update version if the post exists
						if(mentions_post) {
							data.version = {
								parents: [
									{
										version: mentions_post.version.id
									}
								]
							}
						}

						var options = {
							content_type: data.type,
							accept: 'application/vnd.tent.post.v0+json; type="https://tent.io/types/cursor/v0#https://tent.io/rels/status-mentions"',
							callback: function(resp) {

						}};

						// either update or create the cursor
						if(mentions_post) {
							var url = HostApp.serverUrl("post")
            					.replace(/\{entity\}/, encodeURIComponent(HostApp.stringForKey("entity")))
					            .replace(/\{post\}/, mentions_post.id)
							APICalls.put(url, JSON.stringify(data), options);
						} else {
							var url = HostApp.serverUrl("posts_feed");
							APICalls.post(url, JSON.stringify(data), options);
						}

					}});
				}

				break;
			}
		}

	}


	Mentions.prototype.getLatestMentionRead = function() {

		var cursor_url = HostApp.serverUrl("posts_feed") + "?types=" + "https://tent.io/types/cursor/v0";

		APICalls.get(cursor_url, { callback: function(resp) {

			var posts = JSON.parse(resp.responseText).posts;
			
			for (var i = 0; i < posts.length; i++) {
				var post = posts[i];

				if(post.type == "https://tent.io/types/cursor/v0#https://tent.io/rels/status-mentions") {

					var since = post.version.received_at;
					var post_id = post.refs[0].post;
					var post_types = [
						"https://tent.io/types/status/v0#reply",
						"https://tent.io/types/status/v0#"
					];

					var uri = URI(HostApp.serverUrl("posts_feed"));
					uri.addSearch("types", post_types.join(","));
					uri.addSearch("since", since);
					uri.addSearch("mentions", HostApp.stringForKey("entity"));

					APICalls.head(uri.toString(), { callback: function(resp) {

						this.unread_mentions = APICalls.getCount(resp);
						HostApp.unreadMentions(this.unread_mentions);

					}});
				}
			};

		}});
	}

	return Mentions;

});