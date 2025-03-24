import * as THREE     from 'three';
import { GameObject } from './level/LevelObjectManager.ts';

let dragStart     = false;
let startPosition = {
    x: 0,
    y: 0
};

export class Controls {
    private canvas: HTMLElement;
    private rigidBodies: GameObject[];

    dispose: () => void;

    constructor(canvas: HTMLElement, rigidBodies: GameObject[]) {
        this.canvas      = canvas;
        this.rigidBodies = rigidBodies;
        this.dispose     = this.initHandlers();
    }

    initHandlers() {
        const onMouseDown_bind = this.onMouseDown.bind(this);
        const onMouseUp_bind   = this.onMouseUp.bind(this);
        const onMouseMove_bind = this.onMouseMove.bind(this);

        this.canvas.addEventListener('mousedown', onMouseDown_bind);
        this.canvas.addEventListener('mouseup', onMouseUp_bind);
        this.canvas.addEventListener('mousemove', onMouseMove_bind);
        this.canvas.addEventListener('touchstart', onMouseDown_bind);
        this.canvas.addEventListener('touchend', onMouseUp_bind);
        this.canvas.addEventListener('touchmove', onMouseMove_bind);

        return () => {
            this.canvas.removeEventListener('mousedown', onMouseDown_bind);
            this.canvas.removeEventListener('mouseup', onMouseUp_bind);
            this.canvas.removeEventListener('mousemove', onMouseMove_bind);
            this.canvas.removeEventListener('touchstart', onMouseDown_bind);
            this.canvas.removeEventListener('touchend', onMouseUp_bind);
            this.canvas.removeEventListener('touchmove', onMouseMove_bind);
        };
    }

    disposeHandlers() {
        this.dispose();
    }

    onMouseDown(event: MouseEvent | TouchEvent) {
        let clientX;

        if (event.type.startsWith('touch')) {
            const touchEvent = event as TouchEvent;
            const touch      = touchEvent.touches[0] || touchEvent.changedTouches[0];
            if (!touch) return;
            clientX = touch.clientX;
        } else {
            const mouseEvent = event as MouseEvent;
            clientX          = mouseEvent.clientX;
        }

        dragStart       = true;
        startPosition.x = clientX / window.innerWidth - 0.5;
        startPosition.x *= (window.innerWidth / 2);
    }

    onMouseUp() {
        dragStart = false;
    }

    onMouseMove(event: MouseEvent | TouchEvent) {
        let clientX;

        if (event.type.startsWith('touch')) {
            const touchEvent = event as TouchEvent;
            const touch      = touchEvent.touches[0] || touchEvent.changedTouches[0];
            if (!touch) return;
            clientX = touch.clientX;
        } else {
            const mouseEvent = event as MouseEvent;
            clientX          = mouseEvent.clientX;
        }

        if (dragStart) {
            let currentPositionX = clientX / window.innerWidth - 0.5;
            currentPositionX *= (window.innerWidth / 2);

            const delta         = currentPositionX - startPosition.x;
            const angRad        = (delta * Math.PI) / (window.innerWidth / 2);
            const deltaRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angRad, 0, 'XYZ'));

            this.rigidBodies.forEach(rb => {
                const rigidBody = rb.collider.parent();
                const rotation  = rigidBody?.rotation();
                if (!rotation) {
                    return;
                }

                const currentQuaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
                currentQuaternion.multiply(deltaRotation);

                rigidBody?.setRotation(currentQuaternion, true);
            });
            startPosition.x = currentPositionX;
        }
    }
}
