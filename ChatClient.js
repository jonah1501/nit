module.exports.ChatClient = function () {
	if (module.exports.ChatClient.instance) {
		return module.exports.ChatClient.instance;
	}

	module.exports.ChatClient.instance = this;

	this.host = null;
	this.welcomeTime = 0;
	var interval = null;

	var request = function (msg) {
		var timeoutId = setTimeout(function () {
			new module.exports.ChatClient().stopInterval();
			new module.exports.ChatClient().onError();
		}, 1000);

		var jsonpRequest = {
			url: new module.exports.ChatClient().host,
			cache: false,
			dataType: 'jsonp',
			jsonp: 'ChatResponse',
			async: false,
			success: function(jsonp){
				clearTimeout(timeoutId)
				processResponse(jsonp)
			},
		};

		if (msg) {
			jsonpRequest.data = {q: encodeURIComponent(JSON.stringify(msg).toString())};
		}

		$.ajax(jsonpRequest);
	};

	var processResponse = function (response) {
		var chatClient = new module.exports.ChatClient();

		var thath = this;
		for (var i = response.length - 1; i >= 0; i--) {
			if (!response[i]) {
				continue
			}

			switch(response[i].type) {
				case 'command':
						processCommand(response[i]);
						break;
				case 'normal':
						chatClient.onMessage(response[i]);
						break;
				case 'private':
						chatClient.onPrivateMessage(response[i]);
						break;
			}
		};
	};

	var processCommand = function (command) {
		var chatClient = new module.exports.ChatClient();

		switch (command.name) {
			case 'welcome':
				chatClient.welcomeTime = command.time;
				chatClient.onLogin();
				chatClient.startInterval();
				return;
			case 'users': 
				chatClient.onUsers(command.params);
				return;
			case 'name_changed': 
				chatClient.onNameChange(command.params);
				return;
			case 'do_login': 
				var delta = command.time - chatClient.welcomeTime
				if (delta < 5000) { //skip dologin if delta < 5 sec.
					chatClient.onDoLogin();
					chatClient.stopInterval();
				}
				return;
			case 'new_user': 
				chatClient.onNewUser(command.params);
				return;
		}
	};

	this.sendMessage = function (msg) {
		request(msg);
	};

	this.getMessages = function () {
		request();
	};

	this.startInterval = function(time) {
		var time = time ? time : 333;

		this.stopInterval();
				
		interval = setInterval(this.getMessages, time);
	};

	this.stopInterval = function(time) {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	};

	this.onLogin = function() {};
	this.onMessage = function(msg) {};
	this.onPrivateMessage = function(msg) {};
	this.onSend = function() {};
	this.onDoLogin = function() {};
	this.onUsers = function(users) {};
	this.onNameChange = function(params) {};
	this.onNewUser = function(params) {};
	this.onError = function() {};
}