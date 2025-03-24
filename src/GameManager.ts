import * as THREE        from 'three';
import { WebGLRenderer } from 'three';
import { Level, Level1 } from './level/Level.ts';
import { LevelMenu }     from './menu/LevelMenu.ts';
import { MainMenu }      from './menu/MainMenu.ts';
import { EventBus }      from './utils/EventBus.ts';

export class GameManager {
    isPaused = true;
    currentLevelNumber = 0;
    currentLevel!: Level;

    levels: Array<new (gameManager: GameManager) => Level> = [];

    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: WebGLRenderer;

    menu!: MainMenu | null;
    levelMenu!: LevelMenu | null;

    eventBus = new EventBus();

    constructor(renderer: WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;

        this.menu = new MainMenu(this);
        this.menu.show();

        // 7 рандомных уровней
        new Array(7).fill(null).map(() => this.levels.push(Level1));

        this.initHandlers();

        this.eventBus.subscribe('game:start', () => {
            this.hideMainMenu();
            this.levelMenu = new LevelMenu(this);
            this.levelMenu.show();
        });

        this.eventBus.subscribe<number>('game:level-selected', (level) => {
            this.isPaused = false;
            this.hideLevelMenu();
            this.start(level);
        });
    }

    initHandlers() {
        window.addEventListener('keydown', this.onPressEsc.bind(this));
    }

    onPressEsc(e: KeyboardEvent) {
        if (e.code !== 'Escape') {
            return true;
        }

        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    resume() {
        this.isPaused = false;
        this.currentLevel.gameObjectManager.show();
        this.currentLevel.start();
        this.hideMainMenu();
        this.currentLevel.gameCamera.restore();
    }

    pause() {
        this.isPaused = true;
        this.currentLevel.gameObjectManager.hide();
        this.showMainMenu();
    }

    hideMainMenu() {
        if (!this.menu) {
            return;
        }
        this.menu.dispose();
        this.menu = null;
    }

    hideLevelMenu() {
        if (!this.levelMenu) {
            return;
        }
        this.levelMenu.dispose();
        this.levelMenu = null;
    }

    showMainMenu() {
        this.menu = new MainMenu(this);
        this.menu.show();
    }

    start(level: number) {
        if (!this.levels[level]) {
            console.error(`Уровень №${level} не существует!`)
            return;
        }

        if (this.currentLevel) {
            this.currentLevel.dispose();
        }

        this.currentLevel = new this.levels[level](this);
        this.currentLevelNumber = level;
    }

    showLevelMenu() {
        this.isPaused = true;
        this.currentLevel.gameObjectManager.hide();
        this.levelMenu = new LevelMenu(this);
        this.levelMenu.show();
    }
}
