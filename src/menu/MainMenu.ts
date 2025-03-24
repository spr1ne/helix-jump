import gsap                     from 'gsap';
import * as THREE               from 'three';
import { GameManager }          from '../GameManager.ts';
import { createText, loadFont } from '../utils/misc.ts';

export class MainMenu {
    gameManager: GameManager;

    objects: THREE.Mesh[] = [];
    buttonMesh!: THREE.Mesh;

    clock: THREE.Clock;

    target = { x: 0, y: 0, z: 0 };

    onStartGame?: () => void;

    animation: gsap.core.Tween;

    disposeHandlers!: () => void;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;

        this.init();
        this.clock = new THREE.Clock();

        this.animation = gsap.fromTo(this.target, { x: 0, y: -.1, z: 0 }, {
            duration: 2.5,
            ease: "circ.out",
            x: 0,
            y: 0.1,
            z: .1,
            repeat: -1,
            yoyo: true
        });
    }

    init() {
        const { camera, scene } = this.gameManager;
        camera.position.x = 0.5;
        camera.position.y = 0.5;
        camera.position.z = 4;
        camera.lookAt(new THREE.Vector3(0, -0.5, 0));

        this.addItems(scene);

        this.disposeHandlers = this.initHandlers();
    }

    setText(mesh: THREE.Mesh, text: string, size = 0.4) {
        loadFont().then((font) => {
            const textMesh = createText(text, {
                font,
                size,
                depth: 0.2
            });

            const box = new THREE.Box3();
            textMesh.geometry.computeBoundingBox();
            box.copy( textMesh.geometry.boundingBox ).applyMatrix4( textMesh.matrixWorld );
            let measure = new THREE.Vector3();
            box.getSize(measure);

            textMesh.position.x -= measure.x / 2;
            textMesh.position.y -= measure.y / 3;
            textMesh.position.z = 0;
            mesh.add(textMesh);
        });
    }

    private addItems(scene: THREE.Scene) {
        const titleGeometry = new THREE.PlaneGeometry(4, 1);
        const titleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const titleMesh     = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(0, 1, 0);
        this.setText(titleMesh, 'Хеликс jump')

        const buttonGeometry = new THREE.PlaneGeometry(2, 0.5);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const buttonMesh     = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.position.set(0, 0, 0);
        this.buttonMesh = buttonMesh;
        this.setText(buttonMesh, 'Старт', .3)

        this.objects.push(titleMesh);
        this.objects.push(buttonMesh);
        scene.add(titleMesh);
        scene.add(buttonMesh);
    }

    initHandlers() {
        const onStartClick_bind = this.onStartClick.bind(this);
        window.addEventListener('click', onStartClick_bind);

        return () => {
            window.removeEventListener('click', onStartClick_bind);
        }
    }

    onStartClick(event: MouseEvent) {
        const { camera } = this.gameManager;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Преобразование координат мыши в нормализованные координаты (-1 to 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Проверка пересечения луча с кнопкой
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(this.buttonMesh);

        if (intersects.length > 0) {
            this.dispose();
            this.gameManager.eventBus.publish('game:start');
        }
    }

    show() {
        const { renderer } = this.gameManager;
        renderer.setAnimationLoop(this.animate.bind(this));
    }

    animate() {
        const { camera, scene, renderer } = this.gameManager;

        this.buttonMesh.position.y = this.target.y;
        this.buttonMesh.position.x = this.target.x;
        this.buttonMesh.position.z = this.target.z;

        renderer.render(scene, camera);
    }

    dispose() {
        this.disposeHandlers();
        const { scene } = this.gameManager;
        this.objects.forEach(mesh => scene.remove(mesh));
        this.animation.kill();
    }
}
