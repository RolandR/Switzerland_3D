var simplify = new THREE.SimplifyModifier(200);

function changeLOD(k, toSimplify) {

	var sortedGeometry = simplify.modify(toSimplify);
	
	var map = sortedGeometry.map;
	var permutations = sortedGeometry.sortedGeometry;
	var sortedVertices = sortedGeometry.vertices;
	var t = sortedVertices.length - 1;
	t = t * k | 0;

	var numFaces = 0;
	var face;

	var geometry = toSimplify;

	for (i = 0; i < geometry.faces.length; i ++ ) {

		face = geometry.faces[ i ];

		var oldFace = sortedGeometry.faces[ i ];
		face.a = oldFace.a;
		face.b = oldFace.b;
		face.c = oldFace.c;

		while (face.a > t) face.a = map[face.a];
		while (face.b > t) face.b = map[face.b];
		while (face.c > t) face.c = map[face.c];

		if (face.a !== face.b && face.b !== face.c && face.c !== face.a ) numFaces ++;

	}

	// console.log('vertices', t, 'faces', numFaces);

	simplifiedFaces = numFaces;

	simplifiedVertices = t;


	

	// delete geometry.__tmpVertices;
	// console.log(geometry);
	geometry.computeFaceNormals();
	// geometry.computeVertexNormals();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;

}