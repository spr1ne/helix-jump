import gsap       from 'gsap';
import * as THREE from 'three';

export class Camera {
    cameraAnimation?: gsap.core.Tween;
    targetAnimation?: gsap.core.Tween;

    cameraTarget;
    cameraPosition;
    cameraTargetSaved = { x: 0, y: 0, z: 0 };
    cameraPositionSaved = { x: 0, y: 0, z: 0 };

    camera: THREE.Camera;
    cameraAnimationDebounce: (mesh: THREE.Mesh) => void;

    offsetY = 3;
    perfN = 0;

    constructor(camera: THREE.Camera, positionY: number) {
        this.cameraTarget = { x: 0, y: positionY, z: 0 };
        this.cameraPosition = { x: 0, y: positionY, z: 0 };

        this.camera = camera;
        this.cameraAnimationDebounce = this.animate;
    }

    setPosition({ x = 0, y = 0, z = 0 } = {}) {
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
    }

    setLookAt({ x = 0, y = 0, z = 0 } = {}) {
        this.camera.lookAt(x, y, z);
    }

    private animate(mesh: THREE.Mesh) {
        if (this.cameraAnimation?.isActive() || this.targetAnimation?.isActive()) {
            return;
        }

        const targetPosition = mesh.position;

        if (this.cameraAnimation) this.cameraAnimation.kill();
        if (this.targetAnimation) this.targetAnimation.kill();

        this.targetAnimation = gsap.to(this.cameraTarget, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1,
            ease: 'power1.out',
        });

        this.cameraAnimation = gsap.to(this.cameraPosition, {
            x: this.camera.position.x,
            y: targetPosition.y + this.offsetY,
            z: this.camera.position.z,
            duration: 1,
            ease: 'power1.out',
        });

        this.cameraPositionSaved = {
            x: this.camera.position.x,
            y: targetPosition.y + this.offsetY,
            z: this.camera.position.z,
        };

        this.cameraTargetSaved = {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
        }
    }

    restore() {
        this.setPosition(this.cameraPositionSaved);
        this.setLookAt(this.cameraTargetSaved);
    }
}
