import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const addOutline = (object, geometry) => {
  const outlineGeometry = new THREE.EdgesGeometry(geometry); // Create edges from the mesh geometry
  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black outline
  const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);

  // Match the position and rotation of the original mesh
  outline.position.copy(object.position);
  outline.rotation.copy(object.rotation);

  // Add the outline to the scene
  scene.add(outline);
};

const colors = [0x00ff00, 0x0000ff, 0xff0000, 0xffff00]; // green, blue, red, yellow
const sectionSize = 5;
for (let i = 0; i < 4; i++) {
  const sectionGeometry = new THREE.PlaneGeometry(sectionSize, sectionSize);
  const sectionMaterial = new THREE.MeshBasicMaterial({
    color: colors[i],
    side: THREE.DoubleSide,
  });
  const section = new THREE.Mesh(sectionGeometry, sectionMaterial);

  // Position each section in its respective corner
  const sectionCenter = sectionSize / 2;
  section.position.x = i < 2 ? -(sectionCenter + 1.5) : sectionCenter + 1.5;
  section.position.z = i % 2 === 0 ? sectionCenter + 1.5 : -(sectionCenter + 1.5);
  section.rotation.x = Math.PI / 2; // Align the sections with the board
  scene.add(section);

  // Create a smaller white square above each quadrant
  const smallSquareSize = sectionSize * 0.8; // Slightly smaller square
  const smallSquareGeometry = new THREE.PlaneGeometry(
    smallSquareSize,
    smallSquareSize
  );
  const smallSquareMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // White square
    side: THREE.DoubleSide,
  });
  const smallSquare = new THREE.Mesh(smallSquareGeometry, smallSquareMaterial);

  // Position the small square slightly above the colored section
  smallSquare.position.set(section.position.x, 0.02, section.position.z); // Raise y slightly

  // Rotate to align with the base section
  smallSquare.rotation.x = Math.PI / 2;
  scene.add(smallSquare);

  // Create a black outline for the small square
  // const outlineGeometry = new THREE.EdgesGeometry(smallSquareGeometry); // Create edges for the small square
  // const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black outline
  // const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);

  // // Match the position and rotation of the white square
  // outline.position.copy(smallSquare.position);
  // outline.rotation.copy(smallSquare.rotation);
  // scene.add(outline);

  addOutline(smallSquare, smallSquareGeometry);

  for (let j = 0; j < 4; j++) {
    const dotGeometry = new THREE.CircleGeometry(0.2, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: colors[i] });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.set(section.position.x, 0.07, section.position.z); // Lift slightly above the board

    dot.position.x =
      j < 2 ? section.position.x - 0.5 : section.position.x + 0.5;
    dot.position.z =
      j % 2 === 0 ? section.position.z + 0.5 : section.position.z - 0.5;
    dot.position.y = 0.07;
    dot.rotation.x = -Math.PI / 2; // Align with the board
    scene.add(dot);

    addOutline(dot, dotGeometry);
  }
}

// camera.position.z = 5;

camera.position.set(0, 10, 0);
camera.lookAt(0, 0, 0);

function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
