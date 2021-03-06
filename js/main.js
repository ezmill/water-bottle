var scene, camera, renderer;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var sceneRTT, cameraRTT;
var sceneFB;
var rtTexture, rtFB, rtFinal;
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
	animate();

}
function createBackgroundScene(){
	tex = THREE.ImageUtils.loadTexture("textures/1.jpg");
	var materialParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: tex } 
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent
	}
	material = new THREE.ShaderMaterial( materialParameters );
	quad = new THREE.Mesh( planeGeometry, material );
	sceneRTT.add( quad );
}
function createFeedbackScene(){
	var tex = THREE.ImageUtils.loadTexture("textures/1.jpg");
	var materialFBParameters = {
		uniforms: { 
			time: { type: "f", value: 0.0 } ,
			texture: { type: "t", value: rtTexture } 
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
		map: rtFinal
    })
    loader.load("js/models/water-bottle.js", function(geometry) {
        createBottle(geometry, bottleMaterial);
    });
}
function createBottle(geometry, material){
	var bottle = new THREE.Mesh(geometry, material);
	var scale = 1000.0;
	bottle.position.set(0,-100,-100);
	bottle.scale.set(scale,scale,scale);
	scene.add(bottle);
}
var inc = 0;
var addFrames = true;
function render(){
    camera.lookAt(scene.position);

    // bottleMaterial.map = rtFB;
    // inc++
	// if(inc >= 10){
		// addFrames = false;
	// }
	// if(addFrames){
	    renderer.render(sceneRTT, cameraRTT, rtFB, true );
	// }
	renderer.render(sceneRTT, cameraRTT, rtTexture, true);
	renderer.render(sceneFB, cameraRTT, rtFinal, true);
    renderer.render(scene, camera);

    var a = rtFB;
    rtFB = rtTexture;
    rtTexture = rtFinal;
    rtFinal = a;

    // material.uniforms.texture.value = rtTexture;
    // materialFB.uniforms.texture.value = rtFinal;
}
function animate(){
	window.requestAnimationFrame(animate);
	render();
}

