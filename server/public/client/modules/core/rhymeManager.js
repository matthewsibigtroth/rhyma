
function RhymeManager(brain) {

	var self = this;
	var NUM_WORDS = 100;
	var rhymeMap;

	self.init = function() {
		self.requestRhymeMap();
	};

	self.requestRhymeMap = function() {
		brain.getSocketManager().requestRhymeMap(NUM_WORDS);
	};

	self.onRhymeMapReceived = function(newRhymeMap) {
		rhymeMap = newRhymeMap;
		brain.getWorldManager().getRhymePlot().initRhymeMap(rhymeMap);
	};

	self.init();
};

