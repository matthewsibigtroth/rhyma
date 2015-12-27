


function Brain() {

	var self = this;
	var serverManager;
	var wordManager;

	self.init = function() {
		self.createWordManager();
		self.createServerManager();
	};

	self.getWordManager = function() { return wordManager; };

	self.createWordManager = function() {
		wordManager = new WordManager(self);
	};

	self.createServerManager = function() {
		serverManager = new ServerManager(self);
	};

	self.init();
}

function WordManager() {

	var self = this;
	var cmuDict;
	var words;
	var levenshtein;

	self.init = function() {
		console.log("creating word manager");
		self.createCmuDict();
		self.createWords();
		self.createLevenshtein();
	}

	self.createCmuDict = function() {
		var CMUDict = require('cmudict').CMUDict;
		cmuDict = new CMUDict();
		var phoneme_str = cmuDict.get('prosaic'); //need this line or else library doesn't initialize (???)
	}

	self.createWords = function() {
		words = Object.keys(cmuDict["_cache"]);
		console.log(words.length + " words loaded");
	}

	self.createLevenshtein = function() {
		levenshtein = require("levenshtein");
	}

	self.createRhymeMap = function(numWords) {
		console.log('createRhymeMap for', numWords, 'words');
		var rhymeMap = {};
		var wordsSubset = self.createOrderedWordsSubset(numWords);
		for (var i=0; i<wordsSubset.length; i++) {
			var wordA = wordsSubset[i];
			var wordARhymeData = [];
			for (var j=0; j<wordsSubset.length; j++) {
				var wordB = wordsSubset[j];
				var rhymeDatum = self.generateRhymeDatum(wordA, wordB);
				wordARhymeData.push(rhymeDatum);
			}
			rhymeMap[wordA] = wordARhymeData;
		}

		return rhymeMap;
	};

	self.createOrderedWordsSubset = function(numWords) {
		var wordsSubset = [];
		var wordIndices = Object.keys(words);
		var regularExpression = new RegExp("^[a-zA-Z]+$"); // Alphabet strings only
		while (wordsSubset.length < numWords) {
			var randIndex = Math.floor(Math.random()*wordIndices.length);
			var wordString = words[randIndex].toLowerCase();
			if (regularExpression.test(wordString) == true) {
				wordsSubset.push(wordString);	
			}
		}
		wordsSubset.sort();
		return wordsSubset;
	}

	// Calculates the rhyme score between two words
	// and return it packaged in an object containing 
	// the phonetic data as well
	self.generateRhymeDatum = function(wordA, wordB) {
		var wordAPhonemeString = "";
		var wordAPhonemesToUse = self.findWordPhonemesAfterPrimaryStress(wordA);
		//console.log('wordA phonemes to use', wordAPhonemesToUse);
		if (wordAPhonemesToUse.length == 0) {
			wordAPhonemesToUse = cmuDict.get(wordA).split(" ");
		}
		wordAPhonemesString = self.createPhonemeString(wordAPhonemesToUse);
		//console.log('wordA phoneme string', wordAPhonemesString);
		
		var wordBPhonemeString = "";
		var wordBPhonemesToUse = self.findWordPhonemesAfterPrimaryStress(wordB);
		//console.log('wordB phonemes to use', wordBPhonemesToUse);
		if (wordBPhonemesToUse.length == 0) {
			wordBPhonemesToUse = cmuDict.get(wordB).split(" ");
		}
		wordBPhonemesString = self.createPhonemeString(wordBPhonemesToUse);
		//console.log('wordB phoneme string', wordBPhonemesString);
		
		var levenshteinResult = new levenshtein(wordAPhonemesString, wordBPhonemesString);
		var rhymeScore = levenshteinResult.distance;
		var rhymeDatum = {
			'otherWord': wordB,
			'rhymeScore': rhymeScore,
			'wordPhonemesToUse': wordAPhonemesToUse,
			'otherWordPhonemesToUse': wordBPhonemesToUse
		};

		return rhymeDatum;
	}

	self.findWordPhonemesAfterPrimaryStress = function(word) {
		var phonemesAfterPrimaryStress = [];

		var indexOfPrimaryStress = null;
		var wordPhonemes = cmuDict.get(word).split(" ");
		for (var i=0; i<wordPhonemes.length; i++) {
			if (wordPhonemes[i].indexOf("1") != -1) {
				indexOfPrimaryStress = i;
			}
		}
		if (indexOfPrimaryStress == null) {
			return phonemesAfterPrimaryStress;
		}
		else {
			for (var j=indexOfPrimaryStress; j<wordPhonemes.length; j++) {
				phonemesAfterPrimaryStress.push(wordPhonemes[j]);
			}
		}

		return phonemesAfterPrimaryStress;
	}

	self.createPhonemeString = function(phonemes) {
		var phonemeString = "";
		for (var i=0; i<phonemes.length; i++) {
			phonemeString += phonemes[i];
		}
		return phonemeString;
	}

	self.init();
}

function ServerManager() {

	var self = this;
	var app;
	var express;
	var server;
	var PUBLIC_FOLDER_PATH = "/public";
	var HTML_CLIENT_FOLDER_PATH = PUBLIC_FOLDER_PATH + "/client";
	var HTML_CLIENT_INDEX_PATH = HTML_CLIENT_FOLDER_PATH + "/index.html";
	var FAVICON_PATH = HTML_CLIENT_FOLDER_PATH + "/images/favicon.png";
	var HTML_CLIENT_SOCKET_PORT = 9000;

	self.init = function() {
		console.log("creating server manager");
		self.createServer();
		self.listenForSockets();
	}

	self.createServer = function() {
		express = require('express');
		app = express();
		// Serve up static files from the public folder
		app.use(express.static(__dirname + PUBLIC_FOLDER_PATH));
		// Return the html client index page
		app.get('/', function(req, res){
		  res.sendFile(HTML_CLIENT_INDEX_PATH, {"root": __dirname});
		});
		var http = require("http");
		server = http.createServer(app);
		server.listen(HTML_CLIENT_SOCKET_PORT, function() {
		  console.log('listening on *:' + HTML_CLIENT_SOCKET_PORT.toString());
		});
	}

	self.listenForSockets = function() {
		var io = require('socket.io')(server);
		// Listen for the connection event
		io.on('connection', function(socket) {
			console.log("html client socket " + socket.id + " connection opened");

			socket.on('disconnect', function() {
				console.log("html client socket " + socket.id + " disconnected");
	   		});

	   		socket.on('sendRhymeMap', function(message) {
	   			self.handleSendRhymeMapMessage(message, socket);
	   		});
		});
	}


	/////////////////////////////////////
	// utilities
	/////////////////////////////////////

	self.handleSendRhymeMapMessage = function(message, socket) {
		var numWords = message['numWords'];
		var rhymeMap = brain.getWordManager().createRhymeMap(numWords);
		var message = {'rhymeMap': rhymeMap};
		socket.emit('rhymeMap', message);
	};


	self.init();
}

var brain = new Brain();
