define([
],

function() {

	function NewPost() {

		this.entities = JSON.parse(controller.getCachedEntities());
		this.mentions = [];
		this.is_private = false;
		document.body.className = "new_post";

		// Textarea

		this.container = $("<table id='new_post_container'><tr class='text'><td><div></div><textarea></textarea></td></tr><tr><td id='status_bar'></td></tr></table>");
		this.textarea = this.container.find("textarea");
		this.highlighter = this.container.find("div");

		$(document.body).append(this.container);

		this.textarea.keyup(this.keyup.bind(this));
		this.textarea.keydown(this.keydown.bind(this));

		this.suggestions = $("<ul id='suggestions'></ul>");

		$(document.body).append(this.suggestions);

		// Status bar
		this.counter = $("<span>256</span>");
		var buttons = $(
			"<p>" +	
			"<button id='images'><img src='images/images.png'></button>" +
			"<button id='private'><img src='images/public.png'></button>" +
			"<button id='send'><img src='images/send.png'></button>" +
			"</p>");
		
		this.buttons = {
			images: buttons.find("#images"),
			is_private: buttons.find("#private"),
			send: buttons.find("#send")
		}

		//this.buttons.images.bind("click", this.addImage.bind(this));
		//this.buttons.is_private.bind("click", this.togglePrivate.bind(this));
		this.buttons.send.bind("click", this.send.bind(this));

		this.container.find("#status_bar").append(this.counter);
		this.container.find("#status_bar").append(buttons);

		this.textarea.focus()
	}

	NewPost.prototype.setString = function(string) {
		this.textarea.val(string);
	}

	NewPost.prototype.setMentions = function(mentions) {

		if(mentions && mentions.length > 0) {
			var mentions_string = " ";
			for (var i = 0; i < mentions.length; i++) {
				mentions_string += mentions[i].name + " ";
			}

			this.textarea.val(this.textarea.val() + " " + mentions_string);
			this.mentions = mentions;
		}
		this.keyup();
	}

	NewPost.prototype.setIsPrivate = function(is_private) {
		this.is_private = is_private;
	}

	NewPost.prototype.toggleIsPrivate = function() {
		this.is_private = !this.is_private;
	};

	NewPost.prototype.keyup = function(e) {
		if(!e) return;

		var key = e.which;
		if(key != 38 && key != 40 && key != 13) {

			this.applyText($(this.textarea).val());

		} else {

			var lis = this.suggestions.find("li");

			if (lis.length > 0) {
				e.preventDefault();
				var active = this.suggestions.find(".active");
				if(key == 38) { // up
					var prev = active.prev();
					if(active.lentgh == 0) {
						lis.last().addClass("active");
					} else if(prev) {
						active.removeClass("active");
						prev.addClass("active");
					}
				} else if(key == 40) { // down 
					var next = active.next();
					if(active.length == 0) {
						lis.first().addClass("active");
					} else if(next) {
						active.removeClass("active");
						next.addClass("active");
					}
				} else if(key == 13) { // enter
					if(active.length > 0) {
						this.replaceWithName(this.textarea.val(), this.suggestions.find("li.active").get(0).item);
					}
				}
			}
		}
	}

	NewPost.prototype.keydown = function(e) {
		var key = e.which;
		var lis = this.suggestions.find("li");
		if(lis.length > 0 && (key == 38 || key == 40 || key == 13)) {
			e.preventDefault();
		}
	}

	NewPost.prototype.replaceAll = function(txt, replace, with_this) {
		return txt.replace(new RegExp(replace, 'g'),with_this);
	}

	NewPost.prototype.replaceWithName = function(txt, with_item) {
		var words = txt.match(/(^|\s)\^([^\s]+)/);
		var replace = words[2];

		var original = txt.replace("^" + replace, with_item.name);
		this.textarea.val(original);

		this.mentions.push(with_item);

		this.applyText(original);
	}

	NewPost.prototype.applyText = function (text) {
		var words = text.match(/(^|\s)\^([^\s]+)/);
		this.suggestions.html("");

		if(words) {
			var name = words[2];
			for (var key in this.entities.length) {
				var item = this.entities[key];
				if(item.name.toLowerCase().indexOf(name.toLowerCase()) != -1 || item.entity.toLowerCase().indexOf(name.toLowerCase()) != -1) {
					var li = $("<li><strong>" + item.name + "</strong> <em>" + item.entity + "</em></li>")
					li.get(0).item = item;
					this.suggestions.append(li)
				}
			}
		}

		// parse the text:
		// replace all the line braks by <br/>, and all the double spaces by the html version &nbsp;
		text = this.replaceAll(text,'\n','<br/>');
		text = this.replaceAll(text,'  ','&nbsp;&nbsp;');

		// replace the words by a highlighted version of the words

		var remove = [];
		
		for (var i=0;i<this.mentions.length; i++) {
			var name = this.mentions[i].name;
			if(text.match(new RegExp(name))) {
				text = this.replaceAll(text, name, '<span>' + name + '</span>');    
			} else {
				remove.push(this.mentions[i]);
			}
		}

		for (var i = 0; i < remove.length; i++) {
			this.mentions.splice(this.mentions.indexOf(remove[i]), 1);
		}

		// re-inject the processed text into the div
		this.highlighter.html(text);

		var count = 256 - this.textarea.val().length + (this.mentions.length * 6);
		this.counter.html(count)

		return true;
	}

	NewPost.prototype.send = function() {
		debug("Send not implemented yet");
		$("textarea").focus();
	}


	return NewPost;
})