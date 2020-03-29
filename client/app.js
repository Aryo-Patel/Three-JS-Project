let scene, renderer, camera, container;
let moveMeshes = [];
let floorMesh;
let controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
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
    
    
    controls = new THREE.DragControls(moveMeshes.map(meshObj => meshObj.mesh), camera, renderer.domElement);
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
    const meshLeftObj = {
        mesh: meshLeft,
        size: 2,
        childMeshObjs: []
    };
    moveMeshes.push(meshLeftObj);
    scene.add(meshLeftObj.mesh);
    
    const meshRight = meshLeft.clone();
    meshRight.position.set(3,2,0);
    const meshRightObj = {
        mesh: meshRight,
        size: 2,
        childMeshObjs: []
    };
    moveMeshes.push(meshRightObj);
    scene.add(meshRightObj.mesh);
    
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
//potentially turn moveMeshes into an object so that its dimensions can be stored. This will mean reformatting the update method.
function update(){
    moveMeshes.forEach((meshObj, originalIndex) =>{
        let mesh = meshObj.mesh;
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        //working under the assumption that originalIndex < index
        //as this is firing synchronously it is a safe assumption
        moveMeshes.forEach((checkMeshObj,index) =>{
            let checkMesh = checkMeshObj.mesh;
            // let box = new THREE.Box3().setFromObject(checkMesh);
            if(!(checkMesh === mesh) && checkMesh.position.distanceTo(mesh.position) <2){
                let newPositionVector = (checkMesh.position.add(mesh.position));
                const newMeshSize = (meshObj.size + checkMeshObj.size);
                const newMesh = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(newMeshSize,newMeshSize,newMeshSize),
                    new THREE.MeshPhongMaterial({color:0xff4432})
                )
                newMesh.position.set.y = 3;
                newPositionVector = newPositionVector.divideScalar(2);
                newMesh.position.set(newPositionVector.x, newPositionVector.y, newPositionVector.z);
                const newMeshObj = {
                    mesh: newMesh,
                    size: newMeshSize,
                    childMeshObjs: [checkMeshObj, meshObj]
                }
                moveMeshes.splice(index,1);
                moveMeshes.splice(originalIndex,1);
                
                mesh.geometry.dispose();
                mesh.material.dispose();
                scene.remove(mesh);

                checkMesh.geometry.dispose();
                checkMesh.material.dispose();
                scene.remove(checkMesh);

                scene.add(newMeshObj.mesh);
                moveMeshes.push(newMeshObj);
                console.log(moveMeshes);
                controls = new THREE.DragControls(moveMeshes.map(meshObj => meshObj.mesh), camera, renderer.domElement);
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
    const meshObj = {
        mesh: mesh,
        size: 2,
        childMeshObjs: []
    }
    moveMeshes.push(meshObj);
    scene.add(meshObj.mesh);
    controls = new THREE.DragControls(moveMeshes.map(meshObj => meshObj.mesh), camera, renderer.domElement);
});




window.addEventListener('resize', onResize);
init();
renderer.domElement.addEventListener('mousemove', e =>{
    let rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ( ( e.clientX - rect.left ) / rect.width ) * 2 - 1;
    mouse.y = - ( ( e.clientY - rect.top ) / rect.height ) * 2 + 1;
});
renderer.domElement.addEventListener('contextmenu', e =>{
    e.preventDefault();

    raycaster.setFromCamera(mouse, camera);
    let intersections = raycaster.intersectObjects(moveMeshes.map(meshObj => meshObj.mesh));
    if(intersections.length > 0){
        let mesh = intersections[0].object;

        moveMeshes.forEach((meshObj, index) =>{
            if(meshObj.mesh === mesh){
                console.log('we found it');
                if(meshObj.childMeshObjs.length > 0){
                    const meshLeft = meshObj.childMeshObjs[0].mesh;
                    meshLeft.geometry = new THREE.BoxBufferGeometry(meshObj.childMeshObjs[0].size,meshObj.childMeshObjs[0].size,meshObj.childMeshObjs[0].size);
                    meshLeft.material = new THREE.MeshPhongMaterial({color: 0xff4432});
                    meshLeft.position.set(meshObj.mesh.position.x - meshObj.size, meshObj.mesh.position.y, meshObj.mesh.position.z);
                    const meshLeftObj = meshObj.childMeshObjs[0];

                    const meshRight = meshObj.childMeshObjs[1].mesh;
                    meshRight.geometry = new THREE.BoxBufferGeometry(meshObj.childMeshObjs[1].size,meshObj.childMeshObjs[1].size,meshObj.childMeshObjs[1].size);
                    meshRight.material = new THREE.MeshPhongMaterial({color: 0xff4432});
                    meshRight.position.set(meshObj.mesh.position.x + meshObj.size, meshObj.mesh.position.y, meshObj.mesh.position.z);
                    const meshRightObj = meshObj.childMeshObjs[1];

                    meshObj.mesh.geometry.dispose();
                    meshObj.mesh.material.dispose();

                    moveMeshes.splice(index, 1);
                    moveMeshes.push(meshLeftObj, meshRightObj);

                    scene.remove(meshObj.mesh);
                    scene.add(meshLeft, meshRight);
                    console.log(moveMeshes);
                }
                else{
                    alert("Cube cannot be futher reduced");
                }
            }
        });
    }
});