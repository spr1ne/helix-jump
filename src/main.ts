import './style.css';
import * as THREE      from 'three';
import { GameManager } from './GameManager.ts';

const height = window.innerHeight;
const width  = window.innerWidth;

const scene       = new THREE.Scene();
scene.background = new THREE.Color().setHex( 0xFFEB7D );
const camera      = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const isWebGL2 = renderer.getContext() instanceof WebGL2RenderingContext;
console.log(isWebGL2 ? 'WebGL 2.0' : 'WebGL 1.0');

/**
 * ==========================
 *           Main
 * ==========================
 */
new GameManager(renderer, scene, camera);

const bLight = new THREE.DirectionalLight(0xffffff, 0.75);
bLight.position.x = 0;
bLight.position.y = 0;
bLight.position.z = -15;

const kLight = new THREE.DirectionalLight(0xffffff, 3);
kLight.castShadow = true;
kLight.position.x = 8;
kLight.position.y = 10;
kLight.position.z = 15;

kLight.shadow.camera.left = -10;
kLight.shadow.camera.right = 10;
kLight.shadow.camera.top = 10;
kLight.shadow.camera.bottom = -10;

const fLight = new THREE.DirectionalLight(0xffffff, 1.5);
fLight.position.x = -15;
fLight.position.y = 10;
fLight.position.z = 15;

scene.add(bLight)
scene.add(kLight)
scene.add(fLight)
// scene.add(new THREE.AmbientLight())


// const bhelper = new THREE.DirectionalLightHelper( bLight, 5 );
// scene.add( bhelper );
//
// const helper = new THREE.DirectionalLightHelper( kLight, 5 );
// scene.add( helper );
//
// const fhelper = new THREE.DirectionalLightHelper( fLight, 5 );
// scene.add( fhelper );
//
//
// const controls = new OrbitControls( camera, renderer.domElement );
// controls.update();
//
// function animate() {
//
//     requestAnimationFrame( animate );
//
//     controls.update();
//
//     renderer.render( scene, camera );
//
// }
//
// animate();
