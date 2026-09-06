import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface TempleController {
  dispose: () => void;
  rotate: (angle: number) => void;
  reset: () => void;
}

/** Original architectural study: layered gables, carved entry and a terraced plinth. */
export function mountTempleScene(host: HTMLElement, onUnavailable: () => void): TempleController {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  const scene = new THREE.Scene();
  const model = new THREE.Group();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  let controls: OrbitControls | undefined;
  let observer: ResizeObserver | undefined;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    controls?.dispose();
    renderer.domElement.removeEventListener('webglcontextlost', lost);
    geometries.forEach(geometry => {
      geometry.dispose();
    });
    materials.forEach(material => {
      material.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    onUnavailable();
  };

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.addEventListener('webglcontextlost', lost);
    host.append(renderer.domElement);
    scene.add(model);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x7d5796, 2.4));
    const sun = new THREE.DirectionalLight(0xffeed7, 3.4);
    sun.position.set(-3, 7, 6);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xd9c8ff, 2);
    rim.position.set(4, 3, -4);
    scene.add(rim);

    const material = (color: number, metalness = 0, roughness = 0.55) => {
      const result = new THREE.MeshStandardMaterial({ color, metalness, roughness });
      materials.add(result);
      return result;
    };
    const ivory = material(0xfff4de);
    const gold = material(0xe8b857, 0.55, 0.3);
    const purple = material(0x7424b8, 0.18, 0.4);
    const lilac = material(0xc9a5e9);
    const dark = material(0x37234d);
    const add = (geometry: THREE.BufferGeometry, surface: THREE.Material, x = 0, y = 0, z = 0) => {
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, surface);
      mesh.position.set(x, y, z);
      model.add(mesh);
      return mesh;
    };
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, surface = ivory) =>
      add(new THREE.BoxGeometry(w, h, d), surface, x, y, z);
    const line = (points: number[][], radius = 0.026, surface = gold) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
      add(new THREE.TubeGeometry(curve, 28, radius, 6, false), surface);
    };

    // Broad rectangular terraces and entrance steps keep the silhouette grounded.
    box(4.8, 0.16, 4.2, 0, 0.08, 0, lilac);
    box(4.5, 0.12, 3.95, 0, 0.22, 0, gold);
    box(4.3, 0.15, 3.75, 0, 0.35, 0);
    box(3.7, 0.16, 3.15, 0, 0.5, -0.13);
    for (let i = 0; i < 4; i++) box(1.4, 0.09, 0.3, 0, 0.18 + i * 0.085, 1.94 - i * 0.22);
    box(2.45, 1.35, 2.1, 0, 1.23, -0.25);
    box(2.1, 0.06, 0.05, 0, 0.66, 0.83, gold);

    // Colonnades, with gold capitals and bases, surround the central hall.
    for (const x of [-1.57, 1.57])
      for (const z of [-1.25, -0.45, 0.35, 1.13]) {
        add(new THREE.CylinderGeometry(0.065, 0.09, 1.32, 10), ivory, x, 1.22, z);
        box(0.22, 0.12, 0.22, x, 0.61, z, gold);
        box(0.2, 0.1, 0.2, x, 1.85, z, gold);
      }
    for (const x of [-0.82, 0.82]) {
      box(0.4, 0.65, 0.04, x, 1.23, 0.817, gold);
      box(0.29, 0.52, 0.045, x, 1.23, 0.848, dark);
      box(0.035, 0.52, 0.045, x, 1.23, 0.88, gold);
    }
    box(0.64, 0.99, 0.06, 0, 1.07, 0.85, dark);
    box(0.035, 0.94, 0.025, 0, 1.05, 0.9, gold);
    line(
      [
        [-0.43, 0.6, 0.93],
        [-0.43, 1.46, 0.93],
        [-0.24, 1.67, 0.93],
        [0, 1.94, 0.93],
        [0.24, 1.67, 0.93],
        [0.43, 1.46, 0.93],
        [0.43, 0.6, 0.93],
      ],
      0.045,
    );

    // Curved, steep roof slopes, receding along the hall rather than stacked pagoda floors.
    const roof = (halfWidth: number, eave: number, peak: number, front: number, back: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-halfWidth, eave);
      shape.quadraticCurveTo(-halfWidth * 0.4, eave + 0.32, 0, peak);
      shape.quadraticCurveTo(halfWidth * 0.4, eave + 0.32, halfWidth, eave);
      shape.lineTo(halfWidth, eave - 0.09);
      shape.quadraticCurveTo(halfWidth * 0.4, eave + 0.2, 0, peak - 0.12);
      shape.quadraticCurveTo(-halfWidth * 0.4, eave + 0.2, -halfWidth, eave - 0.09);
      shape.closePath();
      add(
        new THREE.ExtrudeGeometry(shape, { depth: front - back, bevelEnabled: false, curveSegments: 16 }),
        purple,
        0,
        0,
        back,
      );
      for (const z of [front + 0.015, back - 0.015]) {
        for (const side of [-1, 1]) {
          line(
            [
              [0, peak, z],
              [side * halfWidth * 0.45, eave + 0.63, z],
              [side * halfWidth, eave, z],
              [side * (halfWidth + 0.13), eave + 0.23, z],
            ],
            0.045,
          );
          // Small flame-like bargeboard details follow each sloping roof edge.
          for (let j = 1; j <= 4; j++) {
            const t = j / 5;
            const x = side * halfWidth * t;
            const y = eave + (peak - eave) * (1 - t) ** 1.5;
            line(
              [
                [x, y, z],
                [x + side * 0.09, y + 0.14, z],
                [x + side * 0.075, y + 0.27, z],
              ],
              0.018,
              ivory,
            );
          }
        }
        line(
          [
            [0, peak - 0.03, z],
            [0.035, peak + 0.18, z],
            [0, peak + 0.36, z],
          ],
          0.025,
        );
      }
      for (const side of [-1, 1])
        line(
          [
            [side * halfWidth, eave, back],
            [side * halfWidth, eave, front],
          ],
          0.035,
        );
      line(
        [
          [0, peak, back],
          [0, peak, front],
        ],
        0.028,
      );
    };
    roof(1.86, 1.91, 3.37, 1.4, 0.1);
    roof(1.67, 2.14, 3.65, 0.45, -0.65);
    roof(1.46, 2.39, 3.91, -0.36, -1.68);

    // Ivory front pediment with concentric gold carving and central floral ornament.
    const pediment = new THREE.Shape();
    pediment.moveTo(-1.56, 1.95);
    pediment.quadraticCurveTo(-0.55, 2.36, 0, 3.23);
    pediment.quadraticCurveTo(0.55, 2.36, 1.56, 1.95);
    pediment.closePath();
    add(new THREE.ExtrudeGeometry(pediment, { depth: 0.07, bevelEnabled: false }), ivory, 0, 0, 1.34);
    for (const scale of [1, 0.78]) {
      line(
        [
          [-1.38 * scale, 2.01, 1.43],
          [-0.66 * scale, 2.37 * scale + 2.01 * (1 - scale), 1.43],
          [0, 2.01 + 1.05 * scale, 1.43],
          [0.66 * scale, 2.37 * scale + 2.01 * (1 - scale), 1.43],
          [1.38 * scale, 2.01, 1.43],
        ],
        0.021,
      );
    }
    for (let i = 0; i < 8; i++) {
      const petal = add(
        new THREE.SphereGeometry(0.06, 8, 6),
        gold,
        Math.sin((i * Math.PI) / 4) * 0.13,
        2.36 + Math.cos((i * Math.PI) / 4) * 0.13,
        1.45,
      );
      petal.scale.set(0.6, 1.6, 0.4);
      petal.rotation.z = (-i * Math.PI) / 4;
    }
    // Low balustrades along the terrace.
    for (const side of [-1, 1]) {
      for (let i = 0; i < 8; i++) box(0.055, 0.28, 0.055, side * 2, 0.56, -1.55 + i * 0.43);
      box(0.09, 0.06, 3.12, side * 2, 0.73, -0.04, gold);
    }

    const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 50);
    const initial = new THREE.Vector3(5.5, 4.2, 8);
    camera.position.copy(initial);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.85, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.rotateSpeed = 0.65;
    renderer.domElement.style.touchAction = 'pan-y';
    const render = () => {
      if (!disposed) renderer.render(scene, camera);
    };
    controls.addEventListener('change', render);
    controls.update();
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height || disposed) return;
      const aspect = width / height;
      const span = Math.max(2.5, 3.1 / aspect);
      camera.left = -span * aspect;
      camera.right = span * aspect;
      camera.top = span;
      camera.bottom = -span;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return {
      dispose,
      rotate: angle => {
        model.rotation.y += angle;
        render();
      },
      reset: () => {
        model.rotation.y = 0;
        camera.position.copy(initial);
        controls?.update();
        render();
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
