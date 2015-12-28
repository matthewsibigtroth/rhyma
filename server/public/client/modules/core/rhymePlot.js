
function RhymePlot(brain, scene) {

	var self = this;
	var rhymePoints = null;
	var SPACE_BETWEEN_RHYME_POINTS = 2;
	var raycaster;
	var mouse;
	var particleSystem;
	var particlesBufferGeometry;
	var rowWordText;
	var rowWordPhonemes;
	var columnWordText;
	var columnWordPhonemes;
	var rhymeScoreText;
	var numWordsSlider;
	var hideRhymeInfoPanelTimeoutId;
	var RHYME_INFO_PANEL_SHOW_DURATION = 5000;
	var rhymeMap;

	self.init = function() {
		rowWordText = document.querySelector('#rowWordText');
		rowWordPhonemes = document.querySelector('#rowWordPhonemes');
		columnWordText = document.querySelector('#columnWordText');
		columnWordPhonemes = document.querySelector('#columnWordPhonemes');
		rhymeScoreText = document.querySelector('#rhymeScoreText');
		numWordsSlider = document.querySelector('#numWordsSlider');
		rhymeInfoPanel = document.querySelector('#rhymeInfoPanel');
		self.requestRhymeMap();
	};

	self.requestRhymeMap = function(numWordsToRequest) {
		var numWordsToRequest = numWordsSlider.value;
		brain.getSocketManager().requestRhymeMap(numWordsToRequest);
	};

	self.initRhymeMap = function() {
		self.createRhymePoints();
		self.createRaycaster();
		self.listenForRhymePointTouches();
		self.initRhymeInfoPanel();
		self.initPlotControls();
	};

	self.createRhymePoints = function() {
		// Build the particles array and rhymePoint objects
		rhymePoints = [];
		var particles = new THREE.Geometry();
		var words = Object.keys(rhymeMap);
		var offsetX = (words.length * SPACE_BETWEEN_RHYME_POINTS) / 2;
		var scoreScaleFactor = 3;

		for (var row=0; row<words.length; row++) {
			rhymePoints[row] = [];
			var rhymeScores = words[row];
			for (var column=0; column<words.length; column++) {
				var rowWord = words[row];
				var columnWord = words[column];
				var rowPhonemes = rhymeMap[rowWord][column]['wordPhonemesUsed'];
				var columnPhonemes = rhymeMap[rowWord][column]['otherWordPhonemesUsed'];
				var rhymeScore = rhymeMap[rowWord][column]['rhymeScore'];
				var x = (column * SPACE_BETWEEN_RHYME_POINTS) - offsetX;
				var y = -rhymeScore * scoreScaleFactor;
				var z = -(row * SPACE_BETWEEN_RHYME_POINTS);
				var position = new THREE.Vector3(x, y, z);
				particles.vertices.push(position);
				var rhymePoint = new RhymePoint(
					self,
					rowWord,
					columnWord,
					rowPhonemes,
					columnPhonemes,
					rhymeScore,
					position,
					row, 
					column, 
					particles.vertices.length-1
					);
				rhymePoints[row].push(rhymePoint);
			}
		}

		// Create the geomtery with indexable points (each with attributes)
		var vertices = particles.vertices;
		var positions = new Float32Array( vertices.length * 3 );
		var colors = new Float32Array( vertices.length * 3 );
		var sizes = new Float32Array( vertices.length );
		var vertex;
		var color = new THREE.Color();
		for ( var i = 0, l = vertices.length; i < l; i ++ ) {
			vertex = vertices[ i ];
			vertex.toArray( positions, i * 3 );
			color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 )
			color.toArray( colors, i * 3 );
			sizes[ i ] = 5 * 0.5;
		}
		particlesBufferGeometry = new THREE.BufferGeometry();
		particlesBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		particlesBufferGeometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		particlesBufferGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

		/*
		// Create the material
		//var particleImagePath = 'client/images/particle_a.png';
		var particleImagePath = 'client/images/dot_1.png';
		//var particleImagePath = 'client/images/particle.png';
		var texture = THREE.ImageUtils.loadTexture(particleImagePath);
		texture.minFilter = THREE.LinearFilter;
		var material = new THREE.PointsMaterial({
			color: 0xFFFFFF,
		   	size: 3,
		    map: texture,
  			blending: THREE.AdditiveBlending,
  			transparent: true
		});
		*/

		// Create the material
		var particleImagePath = 'client/images/dot_1.png';
		var texture = THREE.ImageUtils.loadTexture(particleImagePath);
		texture.minFilter = THREE.LinearFilter;
		var material = new THREE.PointsMaterial({
			color: 0xFFFFFF,
		   	size: 3,
		    map: texture,
  			blending: THREE.AdditiveBlending,
  			transparent: true
		});


		// Create the system of particles
		particleSystem = new THREE.Points(particlesBufferGeometry, material);
		particleSystem.sortParticles = true;
		scene.add(particleSystem);
	};

	self.createRaycaster = function() {
		raycaster = new THREE.Raycaster();
	};

	self.listenForRhymePointTouches = function() {
		mouse = new THREE.Vector2();
		document.addEventListener('mousedown', self.onDocumentMouseDown, false);
		//$("#sceneContainer").click(self.onDocumentMouseDown);
		//document.addEventListener( 'touchstart', self.onDocumentTouchStart, false );
	};

	self.initRhymeInfoPanel = function() {
		TweenLite.set(rhymeInfoPanel, {y: rhymeInfoPanel.offsetHeight});
	};

	self.initPlotControls = function() {
		var plotControls = document.querySelector('#plotControls');
		plotControls.addEventListener('mousedown', self.onPlotControlsTouchStart);
		plotControls.addEventListener('touchstart', self.onPlotControlsTouchStart);
		plotControls.addEventListener('mouseup', self.onPlotControlsTouchEnd);
		plotControls.addEventListener('touchend', self.onPlotControlsTouchEnd);
		var refreshPlotButton = document.querySelector('#refreshPlotButton');
		refreshPlotButton.addEventListener('click', self.onRefreshPlotButtonClick);
		TweenLite.to(plotControls, .6, {
			opacity: 1,
			ease: Quint.easeOut
		});
	};




	self.onRhymeMapReceived = function(newRhymeMap) {
		rhymeMap = newRhymeMap;
		self.initRhymeMap();
	};

	self.onDocumentTouchStart = function(event) {	
		event.preventDefault();
		event.clientX = event.touches[0].clientX;
		event.clientY = event.touches[0].clientY;
		self.onDocumentMouseDown(event);
	};
			
	self.onDocumentMouseDown = function(event) {
		event.preventDefault();
		mouse.x = (event.clientX / brain.getWorldManager().getRenderer().domElement.width) * 2 - 1;
		mouse.y = - (event.clientY / brain.getWorldManager().getRenderer().domElement.height) * 2 + 1;
		raycaster.setFromCamera(mouse, brain.getWorldManager().getCamera());
		var intersects = raycaster.intersectObject(particleSystem);
		if (intersects.length > 0) {
			console.log("intersection!!!", intersects[0]);

			//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
			
			//var particle = new THREE.Sprite( intersects[ 0 ].object.material );
			//particle.position.copy( intersects[ 0 ].point );
			//particle.scale.x = particle.scale.y = 16;
			//scene.add( particle );

			var rhymePoint = self.findRhymePointWithGivenIndex(intersects[0].index);
			if (rhymePoint != null) {
				self.updateRhymeInfoPanel(rhymePoint);
			}
		}
	};

	self.onPlotControlsTouchStart = function(event) {
		brain.getWorldManager().disableOrbitControls();
	};

	self.onPlotControlsTouchEnd = function(event) {
		brain.getWorldManager().enableOrbitControls();
	};

	self.onRefreshPlotButtonClick = function(event) {
		self.clearPlot();
		self.requestRhymeMap();
	};




	self.updateRhymeInfoPanel = function(rhymePoint) {
		clearTimeout(hideRhymeInfoPanelTimeoutId);
		self.showRhymeInfoPanel();
		hideRhymeInfoPanelTimeoutId = setTimeout(self.hideRhymeInfoPanel, RHYME_INFO_PANEL_SHOW_DURATION);

		TweenLite.to(rowWordInfo, .6, {
			opacity: 0, 
			ease: Quint.easeOut, 
			onComplete: function() {
				rowWordText.textContent = rhymePoint.getWords()[0];
				rowWordPhonemes.textContent = rhymePoint.getRowPhonemesString().toString();
				TweenLite.set(rowWordInfo, {y: 100});
				TweenLite.to(rowWordInfo, .6, {y: 0, opacity: 1, ease: Quint.easeOut});
			}
		});

		TweenLite.to(columnWordInfo, .6, {
			opacity: 0, 
			ease: Quint.easeOut,
			delay: .1,
			onComplete: function() {
				columnWordText.textContent = rhymePoint.getWords()[1];
				columnWordPhonemes.textContent = rhymePoint.getColumnPhonemesString().toString();
				TweenLite.set(columnWordInfo, {y: 100});
				TweenLite.to(columnWordInfo, .6, {y: 0, opacity: 1, ease: Quint.easeOut});
			}
		});

		TweenLite.to(rhymeScoreText, .6, {
			opacity: 0, 
			ease: Quint.easeOut, 
			delay: .2, 
			onComplete: function() {
				rhymeScoreText.textContent = rhymePoint.getRhymeScore().toString();
				TweenLite.set(rhymeScoreText, {y: 100});
				TweenLite.to(rhymeScoreText, .6, {y: 0, opacity: 1, ease: Quint.easeOut});
			}
		});
	};
	
	self.hideRhymeInfoPanel = function() {
		TweenLite.to(rhymeInfoPanel, .6, {
			y: rhymeInfoPanel.offsetHeight, 
			ease: Quint.easeOut
		});
	};

	self.showRhymeInfoPanel = function() {
		TweenLite.to(rhymeInfoPanel, .6, {
			y: 0,
			opacity: 1,
			ease: Quint.easeOut
		});
	};

	self.findRhymePointWithGivenIndex = function(index) {
		for (var row=0; row<rhymePoints.length; row++) {
			var rhymePointsInThisRow = rhymePoints[row];
			for (var column=0; column<rhymePointsInThisRow.length; column++) {
				var rhymePoint = rhymePointsInThisRow[column];
				if (rhymePoint.getIndex() == index) {
					return rhymePoint;
				}
			}
		}	
		return null;
	};

	self.calculatePlotWidth = function() {
		var width = 0;
		for (var column=1; column<rhymePoints.length; column++) {
			width += SPACE_BETWEEN_RHYME_POINTS;
		}
		return width;
	};

	self.render = function() {
		if (rhymePoints == null) {
			return;
		}

		/*
		var positions = particlesBufferGeometry.attributes.position.array;
		var time = Date.now() * 0.005;

		var counter = 0;
		for ( var i = 0; i < positions.length; i++ ) {
			//only update the y value
			if (counter == 1) {
				positions[i] = 10 * ( 1 + Math.sin( 0.001 * i + time ) );
				
			}
			counter += 1;
			if (counter == 3) {
				counter = 0;
			}
		}
		particlesBufferGeometry.attributes.position.needsUpdate = true;
		*/
	};

	self.clearPlot = function() {
		for (var i=scene.children.length - 1; i >= 0; i--) {
			var sceneObject = scene.children[i];
     		scene.remove(sceneObject);
		}
	};
	
	self.init();
}



function RhymePoint(parent, rowWord, columnWord, rowPhonemes, columnPhonemes, rhymeScore, position, row, column, index) {

	var self = this;
	var SHAPE_SIZE = 1;

	self.init = function() {
	};


	self.getRow = function() { return row; };
	self.getColumn = function() { return column; };
	self.getPosition = function() { return position; };
	self.getIndex = function() { return index; };
	self.getWords = function() { return [rowWord, columnWord]; };
	self.getRhymeScore = function() { return rhymeScore; };
	self.getRowPhonemes = function() { return rowPhonemes; };
	self.getColumnPhonemes = function() { return columnPhonemes; };
	self.getRowPhonemesString = function() {
		var phonemesString = '';
		for (var i=0; i<rowPhonemes.length; i++) {
			phonemesString += rowPhonemes[i];
			phonemesString += '  ';
		}
		return phonemesString;
	};
	self.getColumnPhonemesString = function() {
		var phonemesString = '';
		for (var i=0; i<columnPhonemes.length; i++) {
			phonemesString += columnPhonemes[i];
			phonemesString += '  ';
		}
		return phonemesString;
	};


	self.init();
}

