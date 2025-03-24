import * as THREE           from 'three';
// @ts-ignore
import { TextGeometry }     from 'three/examples/jsm/geometries/TextGeometry';
// @ts-ignore
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';

export function createGrid() {
    const size      = 10;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions, 0x00ff00, 0xd9d9d9);

    return gridHelper;
}

/**
 * Получение Vector3 точек (вершин) из BufferGeometry (mesh.geometry.attributes.position)
 * @param geometry
 */
export function getPointsFromBufferGeometry(geometry: THREE.BufferGeometry) {
    const positionAttribute = geometry.attributes.position;
    const points = [];

    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        points.push(new THREE.Vector3(x, y, z));
    }

    return points;
}

export function createPoints(mesh: THREE.Mesh) {
    const material = new THREE.PointsMaterial({
        color: 'red',
        size: 0.1,
    });
    const points   = new THREE.Points(mesh.geometry, material);

    return points;
}

interface createTextOpts {
    font: Font;
    position?: THREE.Vector3;
    size?: number
    depth?: number
}

export function createText(text: string, options: createTextOpts) {
    const tg = new TextGeometry(text, {
        font: options.font,
        size: options.size || 0.1,
        depth: options.depth || 0.01,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    });

    let tm    = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    ];
    let tmesh = new THREE.Mesh(tg, tm);

    if (options.position) {
        tmesh.position.copy(options.position);
    }

    return tmesh;
}

let cache: any;

export function loadFont() {
    if (cache) {
        return Promise.resolve(cache);
    }

    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load('Roboto_Regular.json', function (_font: Font) {
            cache = _font;
            resolve(_font);
        }, null, (error: string) => {
            reject(error);
        });

    });
}

/**
 * Показывает точки вершин + пронумеровывает их текстом (для отладки)
 *
 * @param scene
 * @param mesh
 */
export function showMeshVertices(scene: THREE.Scene, mesh: THREE.Mesh) {
    loadFont().then((font) => {
        const cp = createPoints(mesh);
        scene.add(cp);

        const points = getPointsFromBufferGeometry(cp.geometry);

        points.forEach((position, idx) => {
            const mesh = createText(idx.toString(), {
                font,
                position
            });
            scene.add(mesh);
        });
    });
}
