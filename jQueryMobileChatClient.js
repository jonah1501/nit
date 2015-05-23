Date.prototype.prettyTime = function () {
	var hours = this.getHours();
	var minutes = this.getMinutes();
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	return hours + ':' + minutes;
};

String.prototype.sprintf = function () {
	var string = this;
	for (var i = 0; i < arguments.length; i++) {
		string = string.replace('%', arguments[i]);
	}
	return string;
};

function initChat() {
	var chatClient = new module.exports.ChatClient();
	var privateMessageReciever = null;
	var msgTemplate = '<li data-theme="%"><p class="ui-li-aside ui-li-desc"><strong>%</strong></p><p><strong class="user_%">%:</strong> %</p></li>';
	var userTemplate = '<li id="user_list_%"><strong>%</strong></li>';
	var newUserTemplate = '<li><p>User: <strong>%</strong> logged in.</p></li>';
	var userChangedNameTemplate = '<li><p><strong>User: % changed his/her name to: %</strong></p></li>';

	chatClient.onLogin = function () {
		$.mobile.changePage('#page_chat');
	}

	$('#btn_logout').click(function() {
		chatClient.sendMessage(new module.exports.Command('logout'));
	})

	$('#btn_users').click(function() {
		chatClient.sendMessage(new module.exports.Command('users'));
	});

	chatClient.onError = function () {
		alert('Connection error!');
		$.mobile.changePage('#page_login');
	}

	chatClient.onPrivateMessage = chatClient.onMessage = function (msg) {
		$('#chat_area').append(	msgTemplate.sprintf(
									msg.type == 'normal' ? 'c' : 'b',
									new Date(msg.time).prettyTime(),
									msg.user.id,
									msg.user.name,
									msg.text));
		$('#chat_area').listview('refresh');
		$(document).scrollTop($(document).height());
	}

	chatClient.onSend = function () {
		if (!$('#chat_form').valid()) {
			return false;
		}

		chatClient.sendMessage(new module.exports.Message($('#chat_message').val()))
		$('#chat_message').val('');
		return false;
	}

	chatClient.onUsers = function (users) {
		$('#chat_users').empty();
		for (var i = users.length - 1; i >= 0; i--) {
			$('#chat_users').append(userTemplate.sprintf(
				users[i].id, 
				users[i].name));
			$('#user_list_' + users[i].id).click(function() {
				privateMessageReciever = $(this).text();
				$.mobile.changePage('#page_private_message');
			})
		}
		$("#chat_users").listview('refresh');
	}

	chatClient.onDoLogin = function () {
		$.mobile.changePage('#page_login');
	}

	chatClient.onNewUser = function (params) {
		$('#chat_area').append(newUserTemplate.sprintf(params.user.name));
		$('#chat_area').listview('refresh');
	}

	chatClient.onNameChange = function (params) {
		$('.user_' + params.user.id).text(params.to)

		$('#chat_area').append(userChangedNameTemplate.sprintf(params.from, params.to));
		$('#chat_area').listview('refresh');
	}

	$('#login_form').submit(function() {
		if (!$('#login_form').valid()) {
			return false;
		}

		chatClient.host = '%:%'.sprintf($('#chatHost').val(), $('#chatPort').val());
		chatClient.sendMessage(new module.exports.Command('login', {name: $('#nickname').val()}));

		return false;
	});

	$('#chat_form').submit(chatClient.onSend);

	$('#change_name_form').submit(function () {
		if (!$('#change_name_form').valid()) {
			return false;
		}
		
		chatClient.sendMessage(new module.exports.Command('change_name', {
			newName: $('#new_nickname').val()
		}))

		$.mobile.changePage('#page_chat');

		return false;
	});

	$('#private_message_form').submit(function () {
		if (!$('#private_message_form').valid()) {
			return false;
		}
		
		chatClient.sendMessage(new module.exports.PrivateMessage($('#private_message').val() ,null, privateMessageReciever))
		$('#private_message').val('');
		$.mobile.changePage('#page_chat');
		return false;
	});
}

$(document).ready(function() {
	require('ChatClient.js', function() {
		require('Message.js', function() {
			initChat();
		});
	});
});