let scene, renderer, camera, container;
let moveMeshes = [];
let floorMesh;

let addCube = document.getElementById('add-cube');

function init(){
    container = document.getElementById('container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color('skyblue');

    createCamera();
    createMoveMeshes();
    createFloor();
    createLights();
    createRenderer();
    
    
    let controls = new THREE.DragControls(moveMeshes, camera, renderer.domElement);
    renderer.setAnimationLoop(()=>{
        render();
        update();
    });
}
function createCamera(){
    const fov = 60;
    const aspect = container.clientWidth/container.clientHeight;
    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0,2,10)
}
function createMoveMeshes(){
    const meshLeft = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2,2,2),
        new THREE.MeshPhongMaterial({color: 0xff4432})
    );
    meshLeft.position.set(-3,2,0);
    moveMeshes.push(meshLeft);
    scene.add(meshLeft);
    
    const meshRight = meshLeft.clone();
    meshRight.position.set(3,2,0);
    moveMeshes.push(meshRight);
    scene.add(meshRight);
    
}
function createFloor(){
    const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10,10,100,100),
        new THREE.MeshPhongMaterial({color: 0xffffff, wireframe: false})
    );
    floor.material.side = THREE.DoubleSide;
    floor.rotation.x = Math.PI/2;
    scene.add(floor);
}
function createLights(){
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(10,10,10);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight, directionalLight);
}
function createRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);
}
function update(){
    moveMeshes.forEach((mesh, originalIndex) =>{
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        //working under the assumption that originalIndex < index
        //as this is firing synchronously it is a safe assumption
        moveMeshes.forEach((checkMesh,index) =>{
           if(!(checkMesh === mesh) && checkMesh.position.distanceTo(mesh.position) <2){
                console.log('initial meshes: ' + moveMeshes);
                let newPositionVector = (checkMesh.position.add(mesh.position))
                const newMesh = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(3,3,3),
                    new THREE.MeshPhongMaterial({color:0xff4432})
                )
                newMesh.position.set.y = 3;
                newPositionVector = newPositionVector.divideScalar(2);
                newMesh.position.set(newPositionVector.x, newPositionVector.y, newPositionVector.z);
                
                console.log(`checkpoint 1: ${moveMeshes}`);
                moveMeshes.splice(index,1);
                moveMeshes.splice(originalIndex,1);
                console.log(`checkpoint 2: ${moveMeshes}`);
                
                mesh.geometry.dispose();
                mesh.material.dispose();
                scene.remove(mesh);

                checkMesh.geometry.dispose();
                checkMesh.material.dispose();
                scene.remove(checkMesh);

                scene.add(newMesh);
                moveMeshes.push(newMesh);
                console.log('final meshes: ' + moveMeshes);

           }
        })
    })
}
function render(){
    renderer.render(scene, camera);
}
function onResize(){
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

addCube.addEventListener('click', e =>{
    let mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(2,2,2),
        new THREE.MeshPhongMaterial({color: 0xff4432})
    );
    mesh.position.y = 2 + Math.random()*2;
    mesh.position.x = 10 - Math.random()*20;
    moveMeshes.push(mesh);
    scene.add(mesh);
})

window.addEventListener('resize', onResize);
init();