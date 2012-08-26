var tabID;
var prefixes = /http:\/\/|https:\/\/|ftp:\/\/'/;

function install() {
	if (!localStorage["__installed"]) {
		localStorage["__overwrite_confirm"] = "enabled";
		localStorage["__notifications"] = "enabled";
		localStorage["__notification_timeout"] = "5";
		localStorage["__notifications_add"] = "enabled";
		localStorage["__notifications_remove"] = "enabled";
		localStorage["__notifications_overwrite"] = "enabled";
		localStorage["__default_result"] = "settings";
		localStorage["__default_result_custom_path"] = "http://www.wikipedia.org/wiki/%s";
		localStorage["__installed"] = "true";
	}
}

function getDefaultSuggestion(text) {
	if (localStorage[text])
		return "Go to <match><url>"+localStorage[text]+"</url></match>";
	if (text.match(/^(\+|-)$/))
		return "Enter shortcut.";
	if (text.match(/^\+\S+$/))
		return "Press space to define the URL.";
	if (text.match(/^\+\S+\s+$/))
		return "Enter URL.";
	if (text.match(/^\+\S+\s+\S+$/)) {
		var shortcut = text.substring(1, text.indexOf(' '));
		var link = text.substring(text.indexOf(' ')+1);
		return "Press enter to add shortcut: <match>"+shortcut+
		" -> <url>"+link+"</url></match>";
	}
	if (text.match(/^-\S+$/))
		return "Press enter to remove shortcut.";
	if (localStorage["__default_result"] == "settings")
		return "Go to settings page";
	if (localStorage["__default_result"] == "nothing")
		return "";
	return "Go to <url>"+localStorage["__default_custom_url"].replace(/%s/g,
		"<match>"+text+"</match>")+"</url>";
}

function execute(text) {
	if (text.match(/^\+\S+\s+\S+$/)) {
		var url = text.substring(text.indexOf(' ')+1);
		return addToStorage(text.substring(1, text.indexOf(' ')), url);
	}
	if (text.match(/^-\S+$/)) {
		removeFromStorage(text.substring(1));
		return;
	}
	if (localStorage[text]) {
		chrome.tabs.update(tabID, {
			url: localStorage[text]
		});
		return;
	}
	if (localStorage["__default_result"] == "settings") {
		chrome.tabs.update(tabID, {
			url: "options.html"
		});
		return;
	}
	if (localStorage["__default_result"] == "nothing") return;
	chrome.tabs.update(tabID, {
		url: localStorage["__default_result_custom_path"].replace(/%s/g, text)
	})
}

function addToStorage(shortcut, url) {
	if (!url.match(prefixes)) url = "http://"+url;
	if (!localStorage[shortcut]) {
		localStorage[shortcut] = url;
		if (localStorage["__notifications"] == "enabled" &&
			localStorage["__notifications_add"] == "enabled") {
			var notification = webkitNotifications.createNotification(
				"plus48.png", "Shortcut added",
				shortcut+": "+url
				);
			notification.show();
			setTimeout(function() {
				notification.cancel();
			}, localStorage["__notification_timeout"]*1000);
		}
		return url;
	} 

	var doIt = true;
	var oldURL = localStorage[shortcut];
	if (localStorage["__overwrite_confirm"] == "enabled") {
		doIt = confirm("The shortcut "+shortcut+" already exists, and refers to "+
			oldURL+". Would you like to overwrite it?");
	}
	if (doIt) {
		localStorage[shortcut] = url;
		if (localStorage["__notifications"] == "enabled" &&
			localStorage["__notifications_overwrite"] == "enabled") {
			var notification = webkitNotifications.createNotification(
				"plus48.png", "Shortcut overwritten",
				shortcut+": "+oldURL+" changed to "+oldURL
				);
			notification.show();
			setTimeout(function() {
				notification.cancel();
			}, localStorage["__notification_timeout"]*1000);
		}
		return url;
	} else {
		return false;
	}

}

function removeFromStorage(shortcut) {
	if (localStorage[shortcut] !== null) {
		localStorage.removeItem(shortcut);
		if (localStorage["__notifications"] == "enabled" &&
			localStorage["__notifications_remove"] == "enabled") {
			var notification = webkitNotifications.createNotification(
				"minus48.png", "Shortcut removed",
				"Successfully removed shortcut \""+shortcut+"\""
				);
			notification.show();
			setTimeout(function() {
				notification.cancel();
			}, localStorage["__notification_timeout"]*1000);
		}
	}
}

function generateSuggestions(text) {
	var len = localStorage.length;
	var suggestions = new Array();
	try {
		var reg = new RegExp(text);
	} catch (err) {
		return suggestions;
	}
	
	for (var i=0; i<len; i++) {
		var key = localStorage.key(i);
		if (key.match(reg)) {
			if (key.substring(0, 2) != "__")
				suggestions.push({
					content: key,
					description: localStorage[key]
				});
		}
	}
	suggestions.sort(compareSuggestions);
	return suggestions;
}

function compareSuggestions(a, b) {
	var cmpA = a.description.toLowerCase();
	var cmpB = b.description.toLowerCase();
	if (cmpA < cmpB) return -1;
	if (cmpA > cmpB) return 1;
	return 0;
}

function addClass(element, className) {
	if (element.className.match(className))
		return;
	element.className += " "+className;
	element.className = element.className.replace('  ', ' ');
}

function removeClass(element, className) {
	var t1 = new RegExp("^"+className, "g");
	var t2 = new RegExp("\\s"+className, "g");
	element.className = element.className.replace(t1, ' ');
	element.className = element.className.replace(t2, ' ');
	element.className = element.className.replace('  ', ' ');
}

function hasClass(element, className) {
	return element.className.match(className);
}