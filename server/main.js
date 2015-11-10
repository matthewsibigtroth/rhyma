


function Brain() {

	var self = this;
	var serverManager;
	var wordManager;

	self.init = function() {
		self.createWordManager();
		self.createServerManager();
	}

	self.createWordManager = function() {
		wordManager = new WordManager(self);
	}

	self.createServerManager = function() {
		serverManager = new ServerManager(self);
	}

	self.init();
}

function WordManager() {

	var self = this;
	var cmuDict;
	var words;
	var levenshtein;
	var rhymeMap;

	self.init = function() {
		console.log("creating word manager");
		self.createCmuDict();
		self.createWords();
		self.createLevenshtein();
		self.createRhymeMap();
		//self.calculateRhymeScore("excitation", "concentration");
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

	self.createRhymeMap = function() {
		rhymeMap = {};
		var numWords = 100;
		var wordsSubset = self.createOrderedWordsSubset(numWords);
		for (var i=0; i<wordsSubset.length; i++) {
			var wordA = wordsSubset[i];
			var rhymeScores = [];
			for (var j=0; j<wordsSubset.length; j++) {
				var wordB = wordsSubset[j];
				var rhymeScore = self.calculateRhymeScore(wordA, wordB);
				console.log(wordA, wordB, rhymeScore);
				rhymeScores.push(rhymeScore);
			}
			rhymeMap[wordA] = rhymeScores;
		}
	}

	self.createOrderedWordsSubset = function(numWords) {
		var wordsSubset = [];
		var wordIndices = Object.keys(words);
		for (var i=0; i<numWords; i++) {
			var randIndex = Math.floor(Math.random()*wordIndices.length);
			var wordString = words[randIndex].toLowerCase();
			wordsSubset.push(wordString);
		}
		wordsSubset.sort();

		return wordsSubset;
	}

	self.calculateRhymeScore = function(wordA, wordB) {
		var wordAPhonemeString = "";
		var wordAPhonemesToUse = self.findWordPhonemesAfterPrimaryStress(wordA);
		if (wordAPhonemesToUse.length == 0) {
			wordAPhonemesToUse = cmuDict.get(wordA).split(" ");
		}
		wordAPhonemesString = self.createPhonemeString(wordAPhonemesToUse);

		
		var wordBPhonemeString = "";
		var wordBPhonemesToUse = self.findWordPhonemesAfterPrimaryStress(wordB);
		if (wordBPhonemesToUse.length == 0) {
			wordBPhonemesToUse = cmuDict.get(wordB).split(" ");
		}
		wordBPhonemesString = self.createPhonemeString(wordBPhonemesToUse);

		var levenshteinResult = new levenshtein(wordAPhonemesString, wordBPhonemesString);
		var rhymeScore = levenshteinResult.distance;

		return rhymeScore;
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
	var favicon;
	var PUBLIC_FOLDER_PATH = "/public";
	var HTML_CLIENT_FOLDER_PATH = PUBLIC_FOLDER_PATH + "/client";
	var HTML_CLIENT_INDEX_PATH = HTML_CLIENT_FOLDER_PATH + "/index.html";
	var FAVICON_PATH = HTML_CLIENT_FOLDER_PATH + "/images/favicon.png";
	var HTML_CLIENT_SOCKET_PORT = 9000;
	var htmlClientSockets = [];

	self.init = function() {
		console.log("creating server manager");
		self.createExpress();
		self.createApp();
		self.createFavicon();
		self.createHtmlClientSocket();
	}

	self.createExpress = function() {
		express = require('express');
	}

	self.createApp = function() {
		app = express();
		// Serve up static files from the public folder
		app.use(express.static(__dirname + PUBLIC_FOLDER_PATH));
		// Return the html client index page
		app.get('/', function(req, res){
		  res.sendFile(HTML_CLIENT_INDEX_PATH, {"root": __dirname});
		});
	}

	self.createFavicon = function() {
		var favicon = require('serve-favicon');
		app.use(favicon(__dirname + FAVICON_PATH));
	}

	self.createHtmlClientSocket = function() {
		var server = self.createHttpServer();
		var io = require('socket.io')(server);

		// Listen for the connection event
		io.on('connection', function(socket) {
			console.log("html client socket " + socket.id + " connection opened");

			htmlClientSockets.push(socket);

			socket.on('disconnect', function() {
				console.log("html client socket " + socket.id + " disconnected");
				var socketIndex = htmlClientSockets.indexOf(socket);
				if (socketIndex > -1) {
	    			htmlClientSockets.splice(socketIndex, 1);
				}
	   		});

		});

		server.listen(HTML_CLIENT_SOCKET_PORT, function() {
		  console.log('listening on *:' + HTML_CLIENT_SOCKET_PORT.toString());
		});
	}

	self.createHttpServer = function() {
		var http = require("http");
		var server = http.createServer(app);
		return server;
	}



	/////////////////////////////////////
	// utilities
	/////////////////////////////////////

	self.handleSetColorMessage = function(message) {
		sendMessageToEdison("setColor", message);
	}

	self.handleSetMoodMessage = function(message) {
		sendMessageToEdison("setMood", message);
	}

	self.sendMessageToEdison = function(messageType, message) {
		var json = JSON.stringify(message);
		console.log("sending message to edison: " + json);
		if (edisonClientSocket == undefined) {
			return;
		}
		edisonClientSocket.emit(messageType, message);
	}

	self.handleNetworkInfoMessage = function(message) {
		console.log("handleNetworkInfoMessage");
		console.log(message);
		sendMessageToHtmlClients("networkInfo", message);
	}

	self.sendMessageToHtmlClients = function(messageType, message) {
		for (var i=0; i<htmlClientSockets.length; i++) {
			htmlClientSockets[i].emit(messageType, message);
		}
	}


	self.init();
}

var brain = new Brain();
