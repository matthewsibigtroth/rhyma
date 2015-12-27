function SocketManager() {

	var self = this;
	var socket;

	self.init = function() {
		socket = io();
		socket.on('connect', self.onConnectionWithServer);
		socket.on('connect_failed', self.onConnectionFailedWithServer);
		socket.on('disconnect', self.onDisonnectionFromServer);
		socket.on('rhymeMap', self.handleRhymeMapMessage);
	};

	self.onConnectionWithServer = function() {
	};

	self.onConnectionFailedWithServer = function() {
	};

	self.onDisonnectionFromServer = function() {
	};

	self.requestRhymeMap = function(numWords) {
		var message = {'numWords': numWords};
		socket.emit('sendRhymeMap', message);
	};

	self.handleRhymeMapMessage = function(message) {
		brain.getRhymeManager().onRhymeMapReceived(message['rhymeMap']);
	};

	self.sendMessageToServer = function(messageType, message) {
		var json = JSON.stringify(message);
		console.log("sending message to server: " + json);
		self.socket.emit(messageType, message);
	};

	self.init();
}
