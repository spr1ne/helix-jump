import * as RAPIER            from '@dimforge/rapier3d';
import { random }             from 'lodash-es';
import * as THREE             from 'three';
import { Camera }             from '../Camera.ts';
import { Controls }           from '../Controls.ts';
import { GameManager }        from '../GameManager.ts';
import { createCylinder }     from '../objects/primitives.ts';
import { LevelObjectManager } from './LevelObjectManager.ts';

export function createFloor(floorIndex = 1, segmentsCount = 12, floorDistance = 1): THREE.Mesh[] {
    const segments = [];

    const emptySpaces         = random(1, 4);
    const emptySpacePositions = new Array(emptySpaces).fill(null).map(() => random(0, segmentsCount - 1));

    const segmentLength = (Math.PI * 2) / segmentsCount;

    for (let i = 0; i < segmentsCount; i++) {
        if (emptySpacePositions.includes(i)) {
            continue;
        }
        const startAng     = i * segmentLength;
        const cylinderMesh = createCylinder(2, 1, .2, 12, startAng, segmentLength);

        cylinderMesh.userData.name = 'segment';
        cylinderMesh.userData.floorIndex = floorIndex;
        cylinderMesh.position.y = floorIndex * floorDistance;
        segments.push(cylinderMesh);
    }

    return segments;
}

export function createLevel(floorCount = 10) {
    const floors = [];
    const floorDitance = 2;

    for(let floorNum = 1; floorNum <= floorCount; floorNum++) {
        const floorSegments = createFloor(floorNum, random(4, 12), floorDitance);
        floors.push(floorSegments);
    }

    const finishFloor = createCylinder(2, 1, .2, 48, 0, Math.PI * 2);
    finishFloor.userData.floorIndex = 0;
    finishFloor.userData.name = 'finish';
    floors.unshift([ finishFloor ]);

    return floors;
}

export abstract class Level {
    fixedBounceVelocity = 5;
    eventQueue = new RAPIER.EventQueue(true);

    world: RAPIER.World;
    gameManager: GameManager;
    gameControls: Controls;
    gameObjectManager: LevelObjectManager;
    gameCamera: Camera;

    get ball() {
        return this.gameObjectManager.ball;
    }

    get floors() {
        return this.gameObjectManager.floors;
    }

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;
        const { scene, camera, renderer } = this.gameManager;

        this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

        this.gameObjectManager = new LevelObjectManager(scene, this.world);
        this.gameObjectManager.show();

        const topFloorPosiiton = this.floors[this.floors.length - 1].mesh.position;
        this.gameCamera = new Camera(camera, topFloorPosiiton.y);

        this.gameCamera.setPosition({
            x: -1,
            y: topFloorPosiiton.y,
            z: 7
        });
        this.gameCamera.setLookAt({
            x: 0,
            y: this.ball.mesh.position.y,
            z: 0
        });

        this.addObjects();

        this.gameControls = new Controls(renderer.domElement, this.gameObjectManager.objects);

        this.start();
    }

    abstract addObjects(): void;

    handleCollision(handle1: RAPIER.ColliderHandle, handle2: RAPIER.ColliderHandle, started: boolean) {
        if (!started) {
            return;
        }

        const world = this.world;

        const colliderA = world.getCollider(handle1);
        const colliderB = world.getCollider(handle2);
        const rbA       = colliderA.parent();
        const rbB       = colliderB.parent();
        // @ts-ignore
        const meshA     = rbA?.userData?.mesh;
        // @ts-ignore
        const meshB     = rbB?.userData?.mesh;

        if (meshA.userData.name === 'ball' || meshB.userData.name === 'ball') {
            // Постоянная высота отскока мяча
            this.ball.collider.parent()?.setLinvel(new RAPIER.Vector3(0, this.fixedBounceVelocity, 0), true);
        }

        if (meshA.userData.name === 'segment') {
            this.gameCamera.cameraAnimationDebounce(meshA);
        }

        if (meshB.userData.name === 'segment') {
            this.gameCamera.cameraAnimationDebounce(meshB);
        }

        if (meshA.userData.name === 'finish' || meshB.userData.name === 'finish') {
            this.gameManager.isPaused = true;
            if (this.gameManager.currentLevel) {
                this.gameManager.showLevelMenu();
            }
        }
    }

    animate() {
        if (this.gameManager.isPaused) {
            return;
        }

        this.world.step(this.eventQueue);

        this.gameObjectManager.objects.forEach(rb => {
            const collider  = rb.collider;
            const rigidBody = collider.parent() as RAPIER.RigidBody;
            // @ts-ignore
            const mesh      = rigidBody?.userData?.mesh;

            const position = rigidBody.translation();

            if (mesh.userData.name !== 'column') {
                rb.mesh.position.copy(position);
            }

            if (mesh.userData.name !== 'ball' && mesh.userData.name !== 'column') {
                const rotation  = rigidBody.rotation();
                mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
        });

        this.eventQueue.drainCollisionEvents(this.handleCollision.bind(this));

        if (this.gameManager.isPaused) {
            return;
        }

        const cameraTarget = this.gameCamera.cameraTarget;
        const cameraPosition = this.gameCamera.cameraPosition;
        this.gameManager.camera.lookAt(new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z));
        this.gameManager.camera.position.y = cameraPosition.y;

        this.gameManager.renderer.render(this.gameManager.scene, this.gameManager.camera);
    }

    start() {
        this.gameManager.renderer.setAnimationLoop(this.animate.bind(this));
    }

    dispose() {
        this.gameObjectManager.dispose();
        this.gameControls.disposeHandlers();
    }
}

export class Level1 extends Level {
    constructor(gameManager: GameManager) {
        super(gameManager);
    }

    addObjects() {
        this.gameObjectManager.addObjectsToScene();

        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(geometry, material);
        // this.gameManager.scene.add(cube);
    }
}
