function ServerWebSocket() {

	var self = this;

	self.init = function() {
		self.socket = io();
		self.socket.on("connect", self.onConnectionWithServer);
		self.socket.on("connect_failed", self.onConnectionFailedWithServer);
		self.socket.on("disconnect", self.onDisonnectionFromServer);
		self.socket.on("networkInfo", self.handleNetworkInfoMessage);
	}

	self.onConnectionWithServer = function() {
	}

	self.onConnectionFailedWithServer = function() {
	}

	self.onDisonnectionFromServer = function() {
	}

	self.handleNetworkInfoMessage = function(message) {
		console.log("handleNetworkInfoMessage:  " + JSON.stringify(message));
	}

	self.sendMessageToServer = function(messageType, message) {
		var json = JSON.stringify(message);
		console.log("sending message to server: " + json);
		self.socket.emit(messageType, message);
	}

	self.init();
}
