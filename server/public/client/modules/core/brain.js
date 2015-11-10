function Brain() {
	
	var self = this;
	var rhymeManager;
	var worldManager;
	
	self.init = function() {
		self.createRhymeManager();
		self.createWorldManager();
		self.createServerWebSocket();
	}

	self.createRhymeManager = function() {
		rhymeManager = new RhymeManager(self);
	}

	self.createWorldManager = function() {
		worldManager = new WorldManager(self);
	}

	self.createServerWebSocket = function() {
		self.serverWebSocket = new ServerWebSocket();
	}



	self.getWorldManager = function() { return worldManager; }
	self.getRhymeManager = function() { return rhymeManager; }



	self.init();
}









































