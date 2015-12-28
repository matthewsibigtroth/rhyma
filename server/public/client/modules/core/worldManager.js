function WorldManager(brain) {

	var self = this;
	var scene;
	var camera;
	var renderer;
	var stats = null;
	var mainContainer;
	var worldContainer;
	var directionalLight;
	var rhymePlot;
	var orbitControls;

	self.init = function() {
		self.initContainers();
		self.createScene();
		self.createRenderer();
		self.createDirectionalLight();
		self.createCamera();
		//self.createStats();
		self.createRhymePlot();
		self.createOrbitControls();
		self.listenForWindowResize();
		self.animate();
	}

	self.initContainers= function() {
		mainContainer = document.querySelector("#mainContainer");
		worldContainer = document.querySelector("#worldContainer");
	}

	self.createScene = function() {
		scene = new THREE.Scene();
	}

	self.createRenderer = function() {
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setClearColor(0x000000);
		renderer.setSize(worldContainer.offsetWidth, worldContainer.offsetHeight);
		worldContainer.appendChild(renderer.domElement);
	}

	self.createDirectionalLight = function() {
		var color = 0xffffff;
		var intensity = 1;

		directionalLight = new THREE.DirectionalLight(color, intensity);
    	directionalLight.position.set(-1, 1, 1).normalize();
    	scene.add(directionalLight);
    }

	self.createCamera = function() {
		camera = new THREE.PerspectiveCamera(45, worldContainer.offsetWidth/worldContainer.offsetHeight, 1, 10000);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 100;
		scene.add(camera);
	}

	self.createOrbitControls = function() {
		orbitControls = new THREE.OrbitControls( camera );
		orbitControls.damping = 0.2;
		orbitControls.addEventListener("change", self.render);
	}

	self.createStats = function() {
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		worldContainer.appendChild(stats.domElement);
	}

	self.createRhymePlot = function() {
		rhymePlot = new RhymePlot(brain, scene);
	}

	self.listenForWindowResize = function() {
		window.addEventListener("resize", self.onWindowResize);
	}




	self.getScene = function() { return scene; }
	self.getCamera = function() { return camera; }
	self.getRenderer = function() { return renderer; }
	self.getRhymePlot = function() {return rhymePlot; }



	self.onWindowResize = function() {
		windowHalfX = worldContainer.offsetWidth / 2;
		windowHalfY = worldContainer.offsetHeight / 2;
		camera.aspect = worldContainer.offsetWidth / worldContainer.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(worldContainer.offsetWidth, worldContainer.offsetHeight);
	}



	self.animate = function() {
		requestAnimationFrame(self.animate);
		self.render();
		if (stats != null) {
			stats.update();
		}
	}

	self.render = function() {
		rhymePlot.render();
		renderer.render(scene, camera);
	}

	self.disableOrbitControls = function() {
		orbitControls.enabled = false;
	};

	self.enableOrbitControls = function() {
		orbitControls.enabled = true;
	};


	
	self.init();
}
