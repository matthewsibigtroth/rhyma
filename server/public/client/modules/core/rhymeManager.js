
function RhymeManager(brain) {

	var self = this;
	var wordList = [];
	var NUM_WORDS = 100;//10;

	self.init = function() {
		self.createWordList();
		self.createRhymeScores();
	};

	self.createWordList = function() {
		for (var i=0; i<NUM_WORDS; i++) {
			var randomWord = Math.floor((Math.random()*1000)).toString();
			wordList.push(randomWord);
		}
	};

	self.createRhymeScores = function() {
		// send the word list to the server
		// server will create and return a data structure
		// that gives a rhyme score for each word pair from the list
	};


	self.getWordList = function() {
		return wordList;
	};

	self.init();

};

