var scene, camera, renderer;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var sceneRTT, cameraRTT;
var sceneFB;
var rtTexture, rtFB, rtFinal;
var bottle;
initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    camera.position.z = 100;
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;
    scene = new THREE.Scene();
	sceneRTT = new THREE.Scene();
	sceneFB = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    rtTexture = new THREE.WebGLRenderTarget(w, h);
    rtTexture.minFilter = THREE.LinearFilter;
    rtTexture.magFilter = THREE.NearestFilter;
    rtTexture.format = THREE.RGBFormat;

    rtFB = new THREE.WebGLRenderTarget(w, h);
    rtFB.minFilter = THREE.LinearFilter;
    rtFB.magFilter = THREE.NearestFilter;
    rtFB.format = THREE.RGBFormat;
    rtFB.wrapS = THREE.RepeatWrapping;
    rtFB.wrapT = THREE.RepeatWrapping;

    rtFinal = new THREE.WebGLRenderTarget(w, h);
    rtFinal.minFilter = THREE.LinearFilter;
    rtFinal.magFilter = THREE.NearestFilter;
    rtFinal.format = THREE.RGBFormat;

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);
	planeGeometry = new THREE.PlaneBufferGeometry( w,h );

    createBackgroundScene();
    createFeedbackScene();
    loadBottle();
    onWindowResize();
	animate();

}
function createBackgroundScene(){
	tex = THREE.ImageUtils.loadTexture("textures/caustics.jpg");
	var materialParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: tex },
			resolution: {type: "v2", value: new THREE.Vector2(w,h)},
			step_w: {type: "f", value: 1/w},
			step_h: {type: "f", value: 1/h},
			mouseX: {type: "f", value: 1.0},
			mouseY: {type: "f", value: 1.0}
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent
	}
	material = new THREE.ShaderMaterial( materialParameters );
	quad = new THREE.Mesh( planeGeometry, material );
	sceneRTT.add( quad );
}
function createFeedbackScene(){
	var tex = THREE.ImageUtils.loadTexture("textures/caustics.jpg");
	var materialFBParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: rtTexture },
			resolution: {type: "v2", value: new THREE.Vector2()},
			step_w: {type: "f", value: 1/w},
			step_h: {type: "f", value: 1/h},
			mouseX: {type: "f", value: 1.0},
			mouseY: {type: "f", value: 1.0}
 
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs-2' ).textContent
	}
	materialFB = new THREE.ShaderMaterial( materialFBParameters );
	quad = new THREE.Mesh( planeGeometry, materialFB );
	sceneFB.add( quad );
}

function loadBottle(){
    loader = new THREE.BinaryLoader(true);
	bottleMaterial = new THREE.ShaderMaterial({
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent,
		uniforms:{
			texture: { type: "t", value: rtFB }
		}
	})
    // loader.load("js/models/water-bottle-2.js", function(geometry) {
    //     createBottle(geometry, bottleMaterial);
    // });
	boxGeometry = new THREE.BoxGeometry(1000,1000,1000);

	mesh = new THREE.Mesh(boxGeometry, bottleMaterial);
	mesh.position.set(0,0,-2000);

	scene.add(mesh);
}
function createBottle(geometry, material){
	bottle = new THREE.Mesh(geometry, material);
	var scale = 1.0;
	bottle.position.set(0,-1000,-2000);
	// bottle.rotation.set(0,0,44.7);
	bottle.scale.set(scale,scale,scale);
	scene.add(bottle);
}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

function onDocumentMouseMove(event){
	mouseX = (event.clientX );
    mouseY = (event.clientY );
    mapMouseX = map(mouseX, window.innerWidth, -1.0,1.0);
    mapMouseY = map(mouseY, window.innerHeight, -1.0,1.0);
	material.uniforms.mouseX.value = mapMouseX;
	material.uniforms.mouseY.value = mapMouseY;
	materialFB.uniforms.mouseX.value = mapMouseX;
	materialFB.uniforms.mouseY.value = mapMouseY;


}
function onWindowResize( event ) {
	material.uniforms.resolution.value.x = window.innerWidth;
	material.uniforms.resolution.value.y = window.innerHeight;
	materialFB.uniforms.resolution.value.x = window.innerWidth;
	materialFB.uniforms.resolution.value.y = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseDown(event){
	renderer.render(sceneRTT, cameraRTT, rtTexture, true);
}
var inc = 0;
var addFrames = true;
var translate = false;
var time = 0;
function render(){
	time +=0.1;
    camera.lookAt(scene.position);
    material.uniforms.texture.value = tex;
    material.uniforms.time.value = time;
    materialFB.uniforms.texture.value = rtTexture;
    materialFB.uniforms.time.value = time;
    // bottleMaterial.map = rtFinal;

    // mesh.rotation.x = Date.now()*0.0002;
    mesh.rotation.y += mapMouseX*0.01;
    mesh.rotation.z += mapMouseY*0.01;
    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		renderer.render(sceneRTT, cameraRTT, rtTexture, true);
		translate = true;
	}
	if(translate = true){
		// quad.scale.x = 1.008;
		// quad.scale.y = 1.008;
	}
	renderer.render(sceneFB, cameraRTT, rtFB, true);
    renderer.render(sceneFB, cameraRTT, rtFinal, true);
    renderer.render(scene, camera);

    var a = rtFB;
    rtFB = rtTexture;
    rtTexture = a;

    // var b = tex;
    // tex = rtFinal;
    // rtFB = b;
    // rtFinal = a;

}
function animate(){
	window.requestAnimationFrame(animate);
	render();
}

