import * as RAPIER from '@dimforge/rapier3d';
import * as THREE  from 'three';

export function createRigidBodyTrimesh(mesh: THREE.Mesh, world: RAPIER.World) {
    const { x, y, z } = mesh.position;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
    rigidBodyDesc.setTranslation(x, y, z);
    const rigidBody = world.createRigidBody(rigidBodyDesc);
    rigidBody.userData = { mesh };

    const vertices = Float32Array.from(mesh.geometry.attributes.position.array);
    if (!mesh.geometry.index) {
        throw new Error('Нет index в geometry');
    }
    const indices = Uint32Array.from(mesh.geometry.index.array);
    const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    colliderDesc.setMass(0);

    rigidBody.setEnabledRotations(false, true, false, true);

    const collider = world.createCollider(colliderDesc, rigidBody);

    return collider;
}

export function createRigidBodySphere(sphereMesh: THREE.Mesh, world: RAPIER.World) {
    const { x, y, z } = sphereMesh.position;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(x, y, z);
    rigidBodyDesc.enabledTranslations(false, true, false);
    const rigidBody = world.createRigidBody(rigidBodyDesc);
    rigidBody.userData = { mesh: sphereMesh };

    const colliderDesc = RAPIER.ColliderDesc.ball(sphereMesh.userData.radius || .25);
    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = world.createCollider(colliderDesc, rigidBody);

    return collider;
}

export function createEmptyCollider(mesh: THREE.Mesh, world: RAPIER.World) {
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.mass = 0;
    const rigidBody = world.createRigidBody(rigidBodyDesc);
    rigidBody.userData = { mesh };
    rigidBody.setEnabledTranslations(false, false, false, false);
    const colliderDesc = RAPIER.ColliderDesc.cylinder(1, .5);
    const collider = world.createCollider(colliderDesc, rigidBody);

    return collider;
}
