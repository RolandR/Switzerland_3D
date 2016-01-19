function processFile(file){
	console.log('Loaded file, processing...');
	var flatMap = file.split(' ');
	var entriesCount = flatMap.length;
	console.log('List has '+entriesCount+' entries.');
	var map = [];
	for(var i = 0; i < flatMap.length/3; i++){
		map[i] = [+flatMap[i*3], +flatMap[i*3 + 1], +flatMap[i*3 + 2]];
	}
	//console.log(map);
	var maximumX = map[0][0];
	var maximumY = map[0][1];
	var maximumZ = map[0][2];
	
	var minimumX = map[0][0];
	var minimumY = map[0][1];
	var minimumZ = map[0][2];
	console.log('Finding extreme values...');
	for(var i = 0; i < map.length; i++){

		if(map[i][0] > maximumX){
			maximumX = map[i][0];
		}
		if(map[i][0] < minimumX){
			minimumX = map[i][0];
		}
		
		if(map[i][1] > maximumY){
			maximumY = map[i][1];
		}
		if(map[i][1] < minimumY){
			minimumY = map[i][1];
		}

		if(map[i][2] > maximumZ){
			maximumZ = map[i][2];
		}
		if(map[i][2] < minimumZ){
			minimumZ = map[i][2];
		}
	}
	
	var width = maximumX - minimumX;
	var height = maximumY - minimumY;
	var zRange = maximumZ - minimumZ;
	
	console.log('Extreme values:');
	console.log('X: '+minimumX+" - "+maximumX+', width: '+width);
	console.log('Y: '+minimumY+" - "+maximumY+', height: '+height);
	console.log('Z: '+minimumZ+" - "+maximumZ);
	
	var scale = 200;

	mapWidth = Math.round(width/scale);
	mapHeight = Math.round(height/scale);
	
	console.log('Building world object...');

	var World = {
		 height: mapHeight
		,width: mapWidth
		,scale: scale
		,terrain: new Array(mapHeight+1)
	}
	
	for(var i = 0; i < World.terrain.length; i++){
		World.terrain[i] = new Array(mapWidth+1);
	}

	/*var mapCanvas = document.getElementById('bumpmap');
	var mapCanvasContext = mapCanvas.getContext('2d');
	
	mapCanvas.width = mapWidth;
	mapCanvas.height = mapHeight;

	heightmapImageData = mapCanvasContext.createImageData(mapCanvas.width, mapCanvas.height);*/
	
	for(var i = 0; i < map.length; i++){
		var x = Math.round(((map[i][0] - minimumX) / width) * mapWidth);
		var y = mapHeight - Math.round(((map[i][1] - minimumY) / height) * mapHeight);

		World.terrain[y][x] = map[i][2] / scale;

		/*var c = Math.floor(((map[i][2] - minimumZ)/zRange)*255);
		var a = (y * mapWidth + x) * 4;
		heightmapImageData.data[a  ] = c;
		heightmapImageData.data[a+1] = c;
		heightmapImageData.data[a+2] = c;
		heightmapImageData.data[a+3] = 255;*/
	}
	//mapCanvasContext.putImageData(heightmapImageData, 0, 0);
	
	console.log('World generated.');
	
	threeRenderer.init(World);
	
}

