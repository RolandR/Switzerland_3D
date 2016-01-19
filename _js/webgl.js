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
		
	//scene.fog = new THREE.Fog(skyColor, 0, 100);
	
	renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
	rendererContainer.appendChild(renderer.domElement);
	
	var ambientLight = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
	scene.add( ambientLight );	
	
	//var light = new THREE.SpotLight( 0xFFFFFF, 2 );
	//light.position.set(-150, 150 , 1000);
	//scene.add(light);
	
	camera.rotation.x = 0;
	camera.rotation.y = 0;
	camera.rotation.z = 0;

	var switzer3D;
	
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
		if(switzer3D){
			switzer3D.update();
		}

		renderer.render(scene, camera);
	};

	function init(world){
		switzer3D = new Switzer3D(world);
	}

	function Switzer3D(world){
		// We'll divide the map into chunks, so we won't have to render everything at once
		var chunksX = 40;
		var chunksY = 20;

		var rest = world.width % chunksX;
		world.width -= rest;

		rest = world.height % chunksY;
		world.height -= rest;

		xSize = world.width/chunksX;
		ySize = world.height/chunksY;

		console.log(xSize +" wide chunks for "+ world.width +" wide world");
		console.log(ySize +" high chunks for "+ world.height +" high world");

		var scale = 0.2;

		var chunks = [];
		
		for(var x = 0; x < chunksX; x++){
			for(var y = 0; y < chunksY; y++){
				var chunk = {
					 x: x
					,y: y
					,mesh: null
					,isBuilt: false
					,isDisplayed: false
				};

				chunks.push(chunk);
			}
		}

		function update(){

			var targetX = Math.floor(controls.target.x / xSize / scale);
			var targetY = 0 - Math.floor(controls.target.y / ySize / scale);

			var radius = 5;
			
			for(var i in chunks){
				var chunk = chunks[i];
				var distance = Math.sqrt(Math.pow(chunk.x - targetX, 2) + Math.pow(chunk.y - targetY, 2));
				if(distance < radius){
					if(!chunk.isDisplayed){
						scene.add(getMesh(chunk));
						chunk.isDisplayed = true;
						console.log(chunk.x, chunk.y);
					}
				} else {
					if(chunk.isDisplayed){
						scene.remove(scene.getObjectByName("chunk" + chunk.x + "_" + chunk.y));
						deleteMesh(chunk);
						chunk.isDisplayed = false;
						console.log("removing", chunk.x, chunk.y);
					}
				}
			}
			
			//var nearestX = Math.floor(controls.target.x / xSize / scale);
			//var nearestY = 0 - Math.floor(controls.target.y / ySize / scale);
			
		};

		function getChunkAt(x, y){
			
			for(var i in chunks){
				if(chunks[i].x == x && chunks[i].y == y){
					return chunks[i];
				}
			}

			return null;
		}

		function getMesh(chunk){

			if(!chunk.isBuilt){
				var startX = chunk.x * xSize;
				var startY = chunk.y * ySize;

				chunk.mesh = buildMesh(world, xSize, ySize, scale, startX, startY, chunk.x, chunk.y);
				chunk.mesh.name = "chunk" + chunk.x + "_" + chunk.y;

				chunk.isBuilt = true;
			}
			
			return chunk.mesh;
		}

		function deleteMesh(chunk){

			if(chunk.isBuilt){

				chunk.mesh.geometry.dispose();
				chunk.mesh.material.dispose();
				delete chunk.mesh;

				chunk.isBuilt = false;
			}
			
		}

		controls.target.set(5*xSize*scale, 0-3*ySize*scale, 0);
		controls.update();

		render();

		return {
			update: update
		};
		
	}
	
	function buildMesh(world, xSize, ySize, scale, startX, startY, chunkX, chunkY){
		
		
		var geometry = new THREE.PlaneGeometry(xSize * scale, ySize * scale, xSize, ySize);

		var x;
		var y;
		for(y = 0; y <= ySize; y++){
			for(x = 0; x <= xSize; x++){

				var height = 0;
				var row = world.terrain[y + startY - 1];

				if(row){
					height = row[x + startX - 1];
				}

				var i = y * (xSize+1) + x;

				//console.log(i);
				geometry.vertices[i].z = height * scale;
			}
		}
		var textureCanvas = document.getElementById("texture_"+chunkX+"_"+chunkY);
		if(!textureCanvas){
			var textureImg = document.getElementById("texture");
			var textureRatioX = textureImg.width / world.width;
			var textureRatioY = textureImg.height / world.height;
			var imgXSize = textureRatioX * xSize;
			var imgYSize = textureRatioY * ySize;
			
			var textureCanvas = document.createElement("canvas");
			textureCanvas.width = imgXSize;
			textureCanvas.height = imgYSize;
			textureCanvas.id = "texture_"+chunkX+"_"+chunkY;

			document.getElementById("textures").appendChild(textureCanvas);
			
			textureCanvas.getContext("2d").drawImage(textureImg, startX * textureRatioX, startY * textureRatioY, imgXSize, imgYSize, 0, 0, imgXSize, imgYSize);
		}
		
		var texture = new THREE.Texture(textureCanvas);
		//texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestMipMapLinearFilter;
		texture.needsUpdate = true;
		
		var material = new THREE.MeshPhongMaterial({
			 map: texture
			//,bumpMap: texture
			//,bumpScale: 10
			,shininess: 1
		});		
		
		var plane = new THREE.Mesh(geometry, material);
		plane.material.side = THREE.DoubleSide;
		
		plane.position.x = chunkX * xSize * scale;
		plane.position.y = 0 - chunkY * ySize * scale;

		return plane;
	}

	return {
		 buildMesh: buildMesh
		,switzer3D: switzer3D
		,init: init
	};
}

var threeRenderer = new ThreeRenderer();
