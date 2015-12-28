function Brain() {
	
	var self = this;
	var worldManager;
	var socketManager;
	
	self.init = function() {
		self.createSocketManager(self);
		self.createWorldManager(self);
	};

	self.createWorldManager = function() {
		worldManager = new WorldManager(self);
	};

	self.createSocketManager = function() {
		socketManager = new SocketManager();
	};

	self.getWorldManager = function() { return worldManager; };
	self.getSocketManager = function() { return socketManager; };

	self.init();
}









































