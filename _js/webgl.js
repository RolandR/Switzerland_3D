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
	controls.maxDistance = 70;
	controls.minDistance = 0;
	controls.update();
	
	scene.fog = new THREE.Fog(skyColor, 0, 100);
	
	renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
	rendererContainer.appendChild(renderer.domElement);
	
	var ambientLight = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
	scene.add( ambientLight );	
	
	//var light = new THREE.SpotLight( 0xFFFFFF, 2 );
	//light.position.set(-150, 150 , 1000);
	//scene.add(light);

	var showCursor = false;

	if(showCursor){
		var cursor = new THREE.Mesh(
			 new THREE.SphereGeometry( 2, 8, 8 )
			,new THREE.MeshBasicMaterial( {color: 0xff0000} )
		);
		scene.add(cursor);
	}

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

		if(showCursor){
			cursor.position.x = controls.target.x;
			cursor.position.y = controls.target.y;
			cursor.position.z = controls.target.z;
		}

		renderer.render(scene, camera);
	};

	function init(world){
		switzer3D = new Switzer3D(world);
	}

	function Switzer3D(world){
		// We'll divide the map into chunks, so we won't have to render everything at once
		var chunksX = 200;
		var chunksY = Math.round(chunksX/world.width * world.height);

		world.oldWidth = world.width; // We need that later for texture generation
		var rest = world.width % chunksX;
		world.width -= rest;

		world.oldHeight = world.height; // We need that later for texture generation
		rest = world.height % chunksY;
		world.height -= rest;

		xSize = world.width/chunksX;
		ySize = world.height/chunksY;

		console.log(xSize +" wide chunks for "+ world.width +" wide world");
		console.log(ySize +" high chunks for "+ world.height +" high world");

		var scale = 0.2;

		var meshBuilder = new MeshBuilder(world, xSize, ySize, scale);

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

			var radius = chunksX / 12;
			
			for(var i in chunks){
				var chunk = chunks[i];
				var distance = Math.sqrt(Math.pow(chunk.x - 0.5 - targetX, 2) + Math.pow(chunk.y + 0.5 - targetY, 2));
				if(distance < radius){
					if(!chunk.isDisplayed){
						scene.add(getMesh(chunk));
						chunk.isDisplayed = true;
						//console.log("adding", chunk.x, chunk.y);
					}
				} else {
					if(chunk.isDisplayed){
						scene.remove(scene.getObjectByName("chunk" + chunk.x + "_" + chunk.y));
						deleteMesh(chunk);
						chunk.isDisplayed = false;
						//console.log("removing", chunk.x, chunk.y);
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

				chunk.mesh = meshBuilder.buildMesh(startX, startY, chunk.x, chunk.y);
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

		controls.target.set((chunksX/2)*xSize*scale, 0-(chunksY/2)*ySize*scale, 0);
		controls.update();

		render();

		return {
			update: update
		};
		
	}

	function MeshBuilder(world, xSize, ySize, scale){

		var baseGeometry = new THREE.PlaneGeometry(xSize * scale, ySize * scale, xSize, ySize);

		var x;
		var y;
		var height = 0;
		var row;
		var i;

		var textureImg = document.getElementById("texture");
		var texturesContainer = document.getElementById("textures");
		var textureRatioX = textureImg.width / world.oldWidth;
		var textureRatioY = textureImg.height / world.oldHeight;
		var imgXSize = textureRatioX * xSize;
		var imgYSize = textureRatioY * ySize;
		
		function buildMesh(startX, startY, chunkX, chunkY){
			
			var geometry = baseGeometry.clone();
			
			for(y = 0; y <= ySize; y++){
				for(x = 0; x <= xSize; x++){

					height = 0;
					row = world.terrain[y + startY - 1];

					if(row){
						height = row[x + startX - 1];
					}

					i = y * (xSize+1) + x;
					
					geometry.vertices[i].z = height * scale;
				}
			}
			
			var textureCanvas = document.getElementById("texture_"+chunkX+"_"+chunkY);
			//var textureCanvas;
			if(!textureCanvas){
								
				var textureCanvas = document.createElement("canvas");
				textureCanvas.width = imgXSize;
				textureCanvas.height = imgYSize;
				textureCanvas.id = "texture_"+chunkX+"_"+chunkY;

				texturesContainer.appendChild(textureCanvas);
				
				textureCanvas.getContext("2d").drawImage(textureImg, startX * textureRatioX, startY * textureRatioY, imgXSize, imgYSize, 0, 0, imgXSize, imgYSize);
			} else {
				//console.log("Reusing texture_"+chunkX+"_"+chunkY);
			}
			
			var texture = new THREE.Texture(textureCanvas);
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.needsUpdate = true;
			
			var material = new THREE.MeshPhongMaterial({
				 map: texture
				//,wireframe: true
				//,bumpMap: texture
				//,bumpScale: 10
				,shininess: 1
			});

			//geometry.mergeVertices();
			//geometry.computeVertexNormals();
			//changeLOD(0.3, geometry);
			
			assignUVs(geometry);
			
			var plane = new THREE.Mesh(geometry, material);
			plane.material.side = THREE.DoubleSide;
			
			plane.position.x = chunkX * xSize * scale;
			plane.position.y = 0 - chunkY * ySize * scale;

			return plane;
		}

		return {buildMesh: buildMesh};
	}

	return {
		 switzer3D: switzer3D
		,init: init
	};
}

var threeRenderer = new ThreeRenderer();
