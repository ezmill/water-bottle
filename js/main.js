var scene, camera, renderer;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var sceneRTT, cameraRTT;
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

	renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    rtTexture = new THREE.WebGLRenderTarget(w, h);
    rtTexture.minFilter = THREE.LinearFilter;
    rtTexture.magFilter = THREE.NearestFilter;
    rtTexture.format = THREE.RGBFormat;

    // document.addEventListener('mousemove', onDocumentMouseMove, false);
    // window.addEventListener('resize', onWindowResize, false);
    createBackgroundScene();
    loadBottle();
	animate();

}
function createBackgroundScene(){
	var planeGeometry = new THREE.PlaneBufferGeometry( w,h );
	var materialParameters = {
		uniforms: { time: { type: "f", value: 0.0 } },
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent
	}
	var material = new THREE.ShaderMaterial( materialParameters );
	var quad = new THREE.Mesh( planeGeometry, material );
	sceneRTT.add( quad );
}

function loadBottle(){
    loader = new THREE.BinaryLoader(true);
    var material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		map: rtTexture
    })
    loader.load("js/models/water-bottle.js", function(geometry) {
        createBottle(geometry, material);
    });
}
function createBottle(geometry, material){
	var bottle = new THREE.Mesh(geometry, material);
	var scale = 500.0;
	bottle.position.set(0,-50,-100);
	bottle.scale.set(scale,scale,scale);
	scene.add(bottle);
}
function render(){
    camera.lookAt(scene.position);
    renderer.render( sceneRTT, camera, rtTexture, true );
    renderer.render(scene, camera);
}
function animate(){
	window.requestAnimationFrame(animate);
	render();
}

