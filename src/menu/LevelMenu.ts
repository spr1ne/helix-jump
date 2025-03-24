import gsap                     from 'gsap';
import * as THREE               from 'three';
// @ts-ignore
import { EffectComposer }       from 'three/examples/jsm/postprocessing/EffectComposer';
// @ts-ignore
import { RenderPass }           from 'three/examples/jsm/postprocessing/RenderPass';
// @ts-ignore
import { ShaderPass }           from 'three/examples/jsm/postprocessing/ShaderPass';
import { GameManager }          from '../GameManager.ts';
import { createText, loadFont } from '../utils/misc.ts';

export class LevelMenu {
    gameManager: GameManager;

    objects: THREE.Mesh[] = [];
    buttons: THREE.Mesh[] = [];

    clock: THREE.Clock;

    target = { x: 0, y: 0, z: 0 };

    onStartGame?: () => void;

    animation: gsap.core.Tween;

    composer: EffectComposer;

    constructor(gameManager: GameManager) {
        this.gameManager = gameManager;

        this.init();
        this.clock = new THREE.Clock();

        this.gameManager

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

    disposeHandlers!: () => void;

    init() {
        const { scene } = this.gameManager;

        // Создание заголовка меню
        this.addItems(scene);

        this.disposeHandlers = this.initHandlers();
        scene.updateMatrixWorld(true);
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
        const titleGeometry = new THREE.PlaneGeometry(6, 1);
        const titleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const titleMesh     = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.set(0, 1, 0);
        this.setText(titleMesh, 'Выберите уровень!')

        this.objects.push(titleMesh);
        scene.add(titleMesh);

        let row = 0;
        let col = -1;

        const buttonGeometry = new THREE.PlaneGeometry(.5, 0.5, 50, 50);
        buttonGeometry.computeVertexNormals();
        const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide, flatShading: false });

        const meshes = this.gameManager.levels.map((_level, idx) => {
            const buttonMesh     = new THREE.Mesh(buttonGeometry, buttonMaterial);

            if (idx !== 0 && idx % 3 === 0) {
                row -= 1;
                col = -1;
            }

            buttonMesh.userData = {
                name: 'button',
                levelIdx: idx
            };

            buttonMesh.position.set(col, row, 0);
            this.setText(buttonMesh, `${idx + 1}`, .3)
            this.objects.push(buttonMesh);

            col += 1;

            return buttonMesh;
        });

        this.objects.push.apply(this, meshes);
        this.buttons = meshes;
        scene.add.apply(scene, this.objects);
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

        // Преобразование координат мыши в нормализованные координаты (от -1 до 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Проверка пересечения луча с кнопкой
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(this.buttons);

        if (intersects.length > 0) {
            const foundObject = intersects.find(intersection => intersection.object.userData.name === 'button');
            if (foundObject) {
                this.dispose();
                this.gameManager.eventBus.publish('game:level-selected', foundObject.object.userData.levelIdx);
            }
        }
    }

    show() {
        const { camera, renderer } = this.gameManager;

        renderer.setAnimationLoop(this.animate.bind(this));
        camera.position.x = 0.5;
        camera.position.y = 0.5;
        camera.position.z = 4;
        camera.lookAt(new THREE.Vector3(0, -0.5, 0));
    }

    animate() {
        const { camera, scene, renderer } = this.gameManager;
        renderer.render(scene, camera);
    }

    dispose() {
        const { scene } = this.gameManager;
        this.disposeHandlers();
        this.animation.kill();
        scene.remove.apply(scene, this.objects);
    }
}
