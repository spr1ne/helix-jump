import * as RAPIER                                       from '@dimforge/rapier3d';
import { map }                                           from 'lodash-es';
import * as THREE                                        from 'three';
import { createBall }                                                         from '../objects/primitives.ts';
import { createEmptyCollider, createRigidBodySphere, createRigidBodyTrimesh } from '../objects/RigidBodies.ts';
import { createLevel }                                                        from './Level.ts';

export type GameObject = {
    collider: RAPIER.Collider;
    mesh: THREE.Mesh
}

export class LevelObjectManager {
    scene: THREE.Scene;
    world: RAPIER.World;

    /**
     * Floor
     */
    floorsCount = 5;
    floorHeight = 2;
    segmentHeight = .2;

    objects: GameObject[] = [];
    floors: GameObject[] = [];
    ball: GameObject;
    column: GameObject;

    get meshes() {
        return map(this.objects, 'mesh')
    }

    constructor(scene: THREE.Scene, world: RAPIER.World) {
        this.scene = scene;
        this.world = world;
        this.floors = this.createFloors();
        this.ball = this.createBall();
        this.column = this.createColumn();

        this.objects = [this.ball, this.column].concat(this.floors);
    }

    dispose() {
        const meshes = this.objects.map(obj => obj.mesh);
        this.scene.remove.apply(this.scene, meshes);
        this.floors = [];
        this.objects = [];
    }

    hide() {
        this.objects.forEach(({ mesh }) => mesh.visible = false);
    }

    show() {
        this.objects.forEach(({ mesh }) => mesh.visible = true);
    }

    addObjectsToScene() {
        this.scene.add.apply(this.scene, this.meshes);
    }

    createFloors() {
        const floors     = createLevel(this.floorsCount);
        const gameObjects: GameObject[] = [];

        floors.map(floor => {
            floor.forEach(segment => {
                const collider = createRigidBodyTrimesh(segment, this.world);
                const gameObject = { collider, mesh: segment };
                gameObjects.push(gameObject);
            });
        });

        return gameObjects;
    }

    /**
     * Центральный цилиндр
     */
    createColumn() {
        const height     = this.floorsCount * (this.floorHeight + this.segmentHeight);

        const g = new THREE.CylinderGeometry(1, 1, height, 32);
        const m = new THREE.MeshStandardMaterial({ color: Math.random() * 0xff44bb });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.y += height / 2;
        mesh.receiveShadow = true;
        mesh.userData = { name: 'column' };

        const gameObject = { collider: createEmptyCollider(mesh, this.world), mesh };

        return gameObject;
    }

    createBall() {
        const ball          = createBall(0.25);
        ball.position.y     = this.floorsCount * (this.floorHeight + this.segmentHeight);
        ball.position.z     = 1.5;

        const ballCollider = createRigidBodySphere(ball, this.world);
        const gameObject = { collider: ballCollider, mesh: ball };

        return gameObject;
    }
}
