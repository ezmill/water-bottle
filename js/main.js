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

    rtFinal = new THREE.WebGLRenderTarget(w, h);
    rtFinal.minFilter = THREE.LinearFilter;
    rtFinal.magFilter = THREE.NearestFilter;
    rtFinal.format = THREE.RGBFormat;

    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    // window.addEventListener('resize', onWindowResize, false);
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
			step_h: {type: "f", value: 1/h}
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
			step_h: {type: "f", value: 1/h}
 
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
    bottleMaterial = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		map: rtFB
    })
    loader.load("js/models/water-bottle-2.js", function(geometry) {
        createBottle(geometry, bottleMaterial);
    });
}
function createBottle(geometry, material){
	bottle = new THREE.Mesh(geometry, material);
	var scale = 100.0;
	bottle.position.set(50,-65,-100);
	bottle.rotation.set(0,0,44.7);
	bottle.scale.set(scale,scale,scale);
	scene.add(bottle);
}

function onWindowResize( event ) {
	material.uniforms.resolution.value.x = window.innerWidth;
	material.uniforms.resolution.value.y = window.innerHeight;
	materialFB.uniforms.resolution.value.x = window.innerWidth;
	materialFB.uniforms.resolution.value.y = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var inc = 0;
var addFrames = true;
var translate = false;
function render(){

    camera.lookAt(scene.position);
    material.uniforms.texture.value = tex;
    materialFB.uniforms.texture.value = rtTexture;
    // bottleMaterial.map = rtFinal;
    inc++
	if(inc >= 10){
		addFrames = false;
	}
	if(addFrames){
		renderer.render(sceneRTT, cameraRTT, rtTexture, true);
		translate = true;
	}
	if(translate = true){
		quad.scale.x = 1.008;
		quad.scale.y = 1.008;
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

