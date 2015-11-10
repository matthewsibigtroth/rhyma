
function RhymePlot(brain, scene) {

	var self = this;
	var rhymePoints;
	var SPACE_BETWEEN_RHYME_POINTS = 2;
	var PLOT_X_OFFSET = 0//-2;
	var PLOT_Y_OFFSET = 0//-2;
	var raycaster;
	var mouse;
	var particleSystem;


	self.init = function() {
		self.createRhymePoints();
		self.createRaycaster();
		self.listenForRhymePointTouches();
	};

	self.createRhymePoints = function() {
		// Build the particles array and rhymePoint objects
		rhymePoints = [];
		var particles = new THREE.Geometry();
		var wordList = brain.getRhymeManager().getWordList();
		for (var row=0; row<wordList.length; row++) {
			rhymePoints[row] = [];
			for (var column=0; column<wordList.length; column++) {
				var word = wordList[column];
				var x = (column * SPACE_BETWEEN_RHYME_POINTS) + PLOT_X_OFFSET;
				var y = Math.random()* 10;
				var z = (row * SPACE_BETWEEN_RHYME_POINTS) + PLOT_Y_OFFSET;
				var position = new THREE.Vector3(x, y, z);
				particles.vertices.push(position);
				var rhymePoint = new RhymePoint(self, word, position, row, column, particles.vertices.length-1);
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
		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
		geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

		// Create the material
		var texture = THREE.ImageUtils.loadTexture("client/images/particle_a.png");
		texture.minFilter = THREE.LinearFilter;
		var material = new THREE.PointsMaterial({
			color: 0xFFFFFF,
		   	size: 3,
		    map: texture,
  			blending: THREE.AdditiveBlending,
  			transparent: true
		});

		// Create the system of particles
		particleSystem = new THREE.Points(geometry, material);
		particleSystem.sortParticles = true;
		scene.add(particleSystem);
	}

	self.createRaycaster = function() {
		raycaster = new THREE.Raycaster();
	}


	self.listenForRhymePointTouches = function() {
		mouse = new THREE.Vector2();
		document.addEventListener('mousedown', self.onDocumentMouseDown, false);
		//$("#sceneContainer").click(self.onDocumentMouseDown);
		//document.addEventListener( 'touchstart', self.onDocumentTouchStart, false );
	}





	self.onDocumentTouchStart = function(event) {	
		event.preventDefault();
		event.clientX = event.touches[0].clientX;
		event.clientY = event.touches[0].clientY;
		self.onDocumentMouseDown(event);
	}	
			
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
				console.log(rhymePoint.getRow(), rhymePoint.getColumn());
			}
		}
	}

	
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
	}
	
	self.init();
}



function RhymePoint(parent, word, position, row, column, index) {

	var self = this;
	var SHAPE_SIZE = 1;

	self.init = function() {
	
	}


	self.getRow = function() { return row; };
	self.getColumn = function() { return column; };
	self.getPosition = function() { return position; };
	self.getIndex = function() { return index; };


	self.init();
}

