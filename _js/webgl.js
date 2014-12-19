var ThreeRenderer = function(){
	
	var clock = new THREE.Clock(true);
	
	var rendererContainer = document.getElementById("canvasContainer");
	var skyColor = 0x99BBFF;
	//var skyColor = 0x5488D5;
	
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, rendererContainer.clientWidth/rendererContainer.clientHeight, 0.1, 10000 );

	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(skyColor);
	
	camera.up.set( 0, 0, 1 );
	
	var controls = new THREE.OrbitControls(camera, renderer.domElement); 
	controls.target.set(0, 0, 0);
	controls.maxDistance = 50;
	controls.minDistance = 0;
	controls.update();
		
	scene.fog = new THREE.Fog(skyColor, 0, 100);
	
	renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
	rendererContainer.appendChild(renderer.domElement);
	
	var ambientLight = new THREE.AmbientLight( 0x666666 ); // soft white light
	scene.add( ambientLight );	
	
	var light = new THREE.SpotLight( 0xFFFFFF, 2 );
	light.position.set(-150, 150 , 100);
	scene.add(light);
	

	camera.position.x = 0;
	camera.position.y = -30;
	camera.position.z = 12;
	
	camera.rotation.x = 0;
	camera.rotation.y = 0;
	camera.rotation.z = 0;
	
	window.onresize = resize;
	resize();
	function resize(){
		if(renderer){
			renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
			camera.aspect = rendererContainer.clientWidth/rendererContainer.clientHeight;
			camera.updateProjectionMatrix();
		}
	}

	var render = function () {
		requestAnimationFrame(render);
		
		controls.update();

		renderer.render(scene, camera);
	};
	
	function buildMesh(world){
		var xSize = Math.floor(world.width/4);
		var ySize = Math.floor(world.height/4);

		console.log(xSize, ySize);

		var scale = 0.2;
		
		var geometry = new THREE.PlaneGeometry(Math.floor(xSize * scale), Math.floor(ySize * scale), xSize-1, ySize-1);
		
		// for Bern and the Oberland:
		var startX = 500;
		var startY = 480;
		
		// for Lauenen:
		//var startX = 400;
		//var startY = 650;
		
		// for Valais and the Matterhorn:
		//var startX = 500;
		//var startY = 790;
		
		// for central Switzerland:
		//var startX = 800;
		//var startY = 300;

		var x;
		var y;
		for(y = 0; y < ySize; y++){
			for(x = 0; x < xSize; x++){
				var height = world.terrain[y + startY][x + startX];
				if(!height){
					height = 0;
				}

				var i = y * xSize + x;
				
				geometry.vertices[i].z = height * scale;
			}
		}
		
		var textureImg = document.getElementById("texture");
		var textureRatioX = textureImg.width / world.width;
		var textureRatioY = textureImg.height / world.height;
		var imgXSize = textureRatioX * xSize;
		var imgYSize = textureRatioY * ySize;
		
		var imgOffsetX = 0;
		var imgOffsetY = 0;
		
		var textureCanvas = document.getElementById("clippedBmap");
		textureCanvas.width = imgXSize;
		textureCanvas.height = imgYSize;
		
		textureCanvas.getContext("2d").drawImage(textureImg, startX * textureRatioX + imgOffsetX, startY * textureRatioY + imgOffsetY, imgXSize, imgYSize, 0, 0, imgXSize, imgYSize);
		var texture = new THREE.Texture(textureCanvas);
		//texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		
		var material = new THREE.MeshPhongMaterial({
			 map: texture
			//,bumpMap: texture
			//,bumpScale: 10
			,shininess: 1
		});		
		
		var plane = new THREE.Mesh(geometry, material);
		plane.material.side = THREE.DoubleSide;
		
		scene.add(plane);

		render();
	}

	return {
		buildMesh: buildMesh
	};
}

var threeRenderer = new ThreeRenderer();
