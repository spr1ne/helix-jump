import { take, takeRight }             from 'lodash-es';
import * as THREE                      from 'three';
import * as BufferGeometryUtils        from 'three/addons/utils/BufferGeometryUtils.js';
import { getPointsFromBufferGeometry } from '../utils/misc.ts';


/**
 * Торцы сегмента
 * @param square
 */
function createCoverGeometry(square: Array<THREE.Vector3>) {

    const coverGeometry = new THREE.BufferGeometry();

    const vertices = new Float32Array( [
        ...square[0].toArray(),
        ...square[1].toArray(),
        ...square[2].toArray(),
        ...square[3].toArray(),
    ] );
    const indices = new Uint16Array([
        0, 1, 2, // Первый треугольник
        0, 2, 3  // Второй треугольник
    ]);

    coverGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    coverGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    const uvs = new Float32Array([
        0, 0, // Левый нижний угол
        1, 0, // Правый нижний угол
        1, 1, // Правый верхний угол
        0, 1  // Левый верхний угол
    ]);
    coverGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    coverGeometry.computeVertexNormals();

    return coverGeometry;
}

/**
 * Сегмент кольца
 * @param R - внешний радуус
 * @param r - внутренний
 * @param h - высота
 * @param segments - количество сегментов меша
 * @param phiStart - угол (старт)
 * @param phiLength - угол (конец)
 */
export function cylinderLathe(R: number, r: number, h: number, segments = 12, phiStart = 0, phiLength = Math.PI / 2){
    let halfH = h * 0.5;

    let shapePoints = [
        new THREE.Vector2(r, -halfH),
        new THREE.Vector2(R, -halfH),
        new THREE.Vector2(R, halfH),
        new THREE.Vector2(r, halfH),
        new THREE.Vector2(r, -halfH)
    ];

    let g = new THREE.LatheGeometry(shapePoints, segments, phiStart, phiLength);

    const points = getPointsFromBufferGeometry(g);

    // Перемещаем крышки на нужные позиции
    const firstSquare= take(points, 4);
    const lastSquare = takeRight(points, 4);


    const topCoverGeometry = createCoverGeometry(firstSquare);
    const bottomCoverGeometry = createCoverGeometry(lastSquare);

    // Объединяем геометрии
    const mergedGeometry = BufferGeometryUtils.mergeGeometries([
        g,
        topCoverGeometry,
        bottomCoverGeometry
    ]);

    return mergedGeometry;
}

export function createBall(raius = .25) {
    const geometry = new THREE.SphereGeometry(raius);
    const material= new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.radius = .25;
    mesh.userData.name = 'ball';
    mesh.castShadow = true;

    return mesh;
}


/**
 * Создание кольца
 */
export function createCylinder(R = 2, r = 1, h = 1, segments = 12, phiStart = 0, phiLength = Math.PI / 2) {
    const geometry = cylinderLathe(R, r, h, segments, phiStart, phiLength);
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0x4488ff,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.receiveShadow = true;
    return mesh;
}
