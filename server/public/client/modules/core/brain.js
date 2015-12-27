function Brain() {
	
	var self = this;
	var rhymeManager;
	var worldManager;
	var socketManager;
	
	self.init = function() {
		self.createSocketManager(self);
		self.createRhymeManager(self);
		self.createWorldManager(self);
	};

	self.createRhymeManager = function() {
		rhymeManager = new RhymeManager(self);
	};

	self.createWorldManager = function() {
		worldManager = new WorldManager(self);
	};

	self.createSocketManager = function() {
		socketManager = new SocketManager();
	};

	self.getWorldManager = function() { return worldManager; };
	self.getRhymeManager = function() { return rhymeManager; };
	self.getSocketManager = function() { return socketManager; };

	self.init();
}









































