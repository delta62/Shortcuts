function initForm() {
	install();
	populateShortcuts();
	loadForm();
}
function populateShortcuts() {
	var len = localStorage.length;
	var options = new Array();
	var select = document.getElementById("shortcuts");
	for (var i=0; i<len; i++) {
		if (localStorage.key(i).substring(0, 2) != "__")
			options[i] = new Option(localStorage.key(i), localStorage[localStorage.key(i)]);
	}
	options.sort(compareShortcuts);
	for (var i=0; i<len; i++) {
		select.options[i] = options[i];
	}
}
function compareShortcuts(a, b) {
	var cmpA = a.text.toLowerCase();
	var cmpB = b.text.toLowerCase();
	if (cmpA < cmpB) return -1;
	if (cmpA > cmpB) return 1;
	return 0;
}
function nukeShortcuts() {
	if (confirm("Are you sure you want to delete all of your shortcuts?")) {
		localStorage.clear();
		init_form();
	}
}
function updateSelectedLink() {
	var index = document.getElementById("shortcuts").selectedIndex;
	document.getElementById("selectedLink").value = document.getElementById("shortcuts").options[index].value;
	document.getElementById("clearSelected").disabled = false;
	document.getElementById("selectedLink").disabled = false;
	processUpdate();
}
function resetSelectedLink() {
	var link = document.getElementById("selectedLink");
	var s = document.getElementById("shortcuts");
	var w = document.getElementById("selected_link_wrapper");
	document.getElementById("clearSelected").disabled = true;
	s.selectedIndex = -1;
	link.value = "";
	link.disabled = true;
	removeClass(w, 'valid');
	removeClass(w, 'invalid');
}
function loadForm() {
	document.getElementById("overwrite_confirm").checked = (localStorage["__overwrite_confirm"] == "enabled") ? true : false;
	document.getElementById("notifications").checked = (localStorage["__notifications"] == "enabled") ? true : false;
	document.getElementById("notification_timeout").value = localStorage["__notification_timeout"];
	document.getElementById("notifications_add").checked = (localStorage["__notifications_add"] == "enabled") ? true : false;
	document.getElementById("notifications_remove").checked = (localStorage["__notifications_remove"] == "enabled") ? true : false;
	document.getElementById("notifications_overwrite").checked = (localStorage["__notifications_overwrite"] == "enabled") ? true : false;
	document.getElementById("default_nothing").checked = (localStorage["__default_result"] == "nothing") ? true : false;
	document.getElementById("default_settings").checked = (localStorage["__default_result"] == "settings") ? true : false;
	document.getElementById("default_custom").checked = (localStorage["__default_result"] == "custom") ? true : false;
	document.getElementById("default_custom_url").disabled = document.getElementById("default_custom").checked ? false : true;
	document.getElementById("default_custom_url").value = localStorage["__default_result_custom_path"];
	document.getElementById("selectedLink").disabled = true;
	toggleSubNotification((localStorage["__notifications"] == "enabled") ? false : true);
	toggleAddButton(false);
}
function toggleOverwrite() {
	if (document.getElementById("overwrite_confirm").checked) {
		localStorage["__overwrite_confirm"] = "enabled";
	}else {
		localStorage["__overwrite_confirm"] = "disabled";
	}
}
function toggleNotifications() {
	if (document.getElementById("notifications").checked) {
		localStorage["__notifications"] = "enabled";
		toggleSubNotification(false);
	} else {
		localStorage["__notifications"] = "disabled";
		toggleSubNotification(true);
	}
}
function toggleSubNotification(disabled) {
	var w = document.getElementById("notification_timeout_wrapper");
	if (disabled) {
		removeClass(w, "valid");
		removeClass(w, "valid");
	}
	document.getElementById("notification_timeout").disabled = disabled;
	document.getElementById("notifications_add").disabled = disabled;
	document.getElementById("notifications_remove").disabled = disabled;
	document.getElementById("notifications_overwrite").disabled = disabled;
}
function setNotificationTimeout() {
	var elem = document.getElementById("notification_timeout_wrapper");
	var timeout = document.getElementById("notification_timeout").value;
	var validator = /^[0-9]+(\.*[0-9]+)?$/;
	if (timeout.match(validator)) {
		localStorage["__notification_timeout"] = timeout;
		removeClass(elem, "invalid");
		addClass(elem, "valid");
	} else {
		removeClass(elem, "valid");
		addClass(elem, "invalid");
	}
}
function blurNotificationTimeout() {
	var w = document.getElementById("notification_timeout_wrapper");
	if (hasClass(w, "valid"))
		removeClass(w, "valid");
}
function toggleAddNotification() {
	if (document.getElementById("notifications_add").checked) {
		localStorage["__notifications_add"] = "enabled";
	} else {
		localStorage["__notifications_add"] = "disabled";
	}
}
function toggleRemoveNotification() {
	if (document.getElementById("notifications_remove").checked) {
		localStorage["__notifications_remove"] = "enabled";
	} else {
		localStorage["__notifications_remove"] = "disabled";
	}
}
function toggleOverwriteNotification() {
	if (document.getElementById("notifications_overwrite").checked) {
		localStorage["__notifications_overwrite"] = "enabled";
	} else {
		localStorage["__notifications_overwrite"] = "disabled";
	}
}
function changeDefaultResult() {
	var d = document.getElementById("default_custom_url");
	if (document.getElementById("default_nothing").checked) {
		localStorage["__default_result"] = "nothing";
		d.disabled = true;
	} else if (document.getElementById("default_settings").checked) {
		localStorage["__default_result"] = "settings";
		d.disabled = true;
	} else {
		localStorage["__default_result"] = "custom";
		d.disabled = false;
	}
}
function setCustomDefaultResult() {
	var w = document.getElementById("custom_url_wrapper");
	var custom = document.getElementById("default_custom_url").value;
	var validator = /^http:\/\//;
	if (!custom.match(validator)) {
		custom = "http://"+custom;
		localStorage["__default_result_custom_path"] = custom;
		removeClass(w, "invalid");
		addClass(w, "valid");
		toggleURLError(false);
	}
}
function blurCustomDefaultResult() {
	var w = document.getElementById("custom_url_wrapper");
	if (hasClass(w, "valid"))
		removeClass(w, "valid");
}
function toggleURLError(error) {
	var message = document.getElementById("default_custom_url_error");
	if (error) {
		addClass(message, 'red');
		removeClass(message, 'green');
		message.innerHTML = "Shortcuts may not begin with two underscores.";
	} else {
		addClass(message, 'green');
		removeClass(message, 'red');
		message.innerHTML = "You may specify the address bar contents by typing %s.";
	}
}
function validateShortcut() {
	var newLink = document.getElementById("newLink").value;
	var lw = document.getElementById("new_link_wrapper");
	var newShortcut = document.getElementById("newShortcut").value;
	var sw = document.getElementById("new_shortcut_wrapper");
	var invalidator = /^__/;
	var validator = /^\S+/;
	var spaceValid = true;
	var underscoreValid = true;
	if (newLink.match(invalidator) || !newLink.match(validator)) {
		if (!newLink.match(invalidator))
			underscoreValid = false;
		else
			spaceValid = false;
		removeClass(lw, "valid");
		addClass(lw, "invalid");
	} else {
		removeClass(lw, "invalid");
		addClass(lw, "valid");
		toggleNewShortcutError(false);
	}
	if (newShortcut.match(invalidator) || !newShortcut.match(validator)) {
		if (!newShortcut.match(invalidator))
			underscoreValid = false;
		else
			spaceValid = false;
		removeClass(sw, "valid");
		addClass(sw, "invalid");
	} else {
		removeClass(sw, "invalid");
		addClass(sw, "valid");
	}
	if (underscoreValid && spaceValid) {
		toggleNewShortcutError(underscoreValid, spaceValid);
		toggleAddButton(true);
		return true;
	} else {
		toggleNewShortcutError(underscoreValid, spaceValid);
		toggleAddButton(false);
		return false;
	}
}
function submitShortcut(event) {
	if (!validateShortcut()) {
		return;
	} 
	if (event.keyCode == 13) {
		document.getElementById('saveNewShortcut').click();
		document.getElementById('newShortcut').focus();
	}
}
function blurNewShortcut() {
	var s = document.getElementById("new_shortcut_wrapper");
	var l = document.getElementById("new_link_wrapper");
	removeClass(s, "invalid");
	removeClass(s, "valid");
	removeClass(l, "invalid");
	removeClass(l, "valid");
	toggleNewShortcutError(true, true);
}
function toggleNewShortcutError(underscoreValid, spaceValid) {
	var space = document.getElementById("blank_error");
	var under = document.getElementById("underscore_error");
	if (!underscoreValid) {
		removeClass(space, 'invisible');
	} else {
		addClass(space, 'invisible');
	}
	if (!spaceValid) {
		removeClass(under, 'invisible');
	} else {
		addClass(under, 'invisible');
	}
}
function toggleAddButton(enabled) {
	var button = document.getElementById("saveNewShortcut");
	if (enabled) {
		button.disabled = false;
	} else {
		button.disabled = true;
	}
}
function processAdd() {
	var shortcut = document.getElementById("newShortcut");
	var link = document.getElementById("newLink");
	addToStorage(shortcut.value, link.value);
	shortcut.value = "";
	link.value = "";
	populateShortcuts();
	resetSelectedLink();
}
function processUpdate() {
	var link = document.getElementById("selectedLink");
	var w = document.getElementById("selected_link_wrapper");
	var index = document.getElementById("shortcuts").selectedIndex;
	if (index === null)
		return;
	var updated = link.value;
	var invalidator = /(^__|^$)/;
	if (updated.match(invalidator)) {
		removeClass(w, 'valid');
		addClass(w, 'invalid');
	} else {
		var key = document.getElementById("shortcuts").options[index].text;
		localStorage[key] = updated;
		document.getElementById("shortcuts").options[index].value = updated;
		removeClass(w, 'invalid');
		addClass(w, 'valid');
	}
}
function blurUpdate() {
	var link = document.getElementById("selectedLink");
	var w = document.getElementById("selected_link_wrapper");
	document.getElementById("shortcuts").selectedIndex = -1;
	removeClass(w, 'invalid');
	removeClass(w, 'valid');
	link.value = "";
	link.disabled = true;
}
function processRemove() {
	var index = document.getElementById("shortcuts").selectedIndex;
	var key = document.getElementById("shortcuts").options[index].text;
	removeFromStorage(key);
	populateShortcuts();
	resetSelectedLink();
}