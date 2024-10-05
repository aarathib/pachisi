import * as THREE from "three";

const scene = new THREE.Scene();

// Set up the camera to have a clear top-down view of the grid and colored sections
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

// 1. Create the main 15x15 white base grid
const gridSize = 15;
const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
const gridMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff, // White base
  side: THREE.DoubleSide,
});
const grid = new THREE.Mesh(gridGeometry, gridMaterial);
grid.rotation.x = -Math.PI / 2; // Rotate to lie flat on the x-z plane
scene.add(grid);

// 2. Add a black grid overlay using THREE.GridHelper
const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x000000, 0x000000); // Black grid lines
gridHelper.position.y = 0.01; // Elevate slightly above the base grid to avoid z-fighting
scene.add(gridHelper);

// Define colors for the four sections (green, blue, red, yellow)
const colors = [0x00ff00, 0x0000ff, 0xff0000, 0xffff00];
const sectionSize = 6;

// 3. Create four sections positioned within the grid's 3x3 central area
for (let i = 0; i < 4; i++) {
  // Create the main colored square sections
  const sectionGeometry = new THREE.PlaneGeometry(sectionSize, sectionSize);
  const sectionMaterial = new THREE.MeshBasicMaterial({
    color: colors[i],
    side: THREE.DoubleSide,
  });
  const section = new THREE.Mesh(sectionGeometry, sectionMaterial);

  // Correctly position each section in its respective corner within the grid
  let size = sectionSize / 2;
  section.position.x = i < 2 ? -(size + 1.5) : size + 1.5; // Left or right
  section.position.z = i % 2 === 0 ? size + 1.5 : -(size + 1.5); // Top or bottom
  section.position.y = 0.05; // Raise slightly above the grid surface to avoid z-fighting
  section.rotation.x = -Math.PI / 2; // Rotate to lie flat on x-z plane
  scene.add(section);
  addOutline(section, sectionGeometry);

  // Create a smaller white square above each quadrant
  const smallSquareSize = sectionSize - 2; // Slightly smaller square
  const smallSquareGeometry = new THREE.PlaneGeometry(
    smallSquareSize,
    smallSquareSize
  );
  const smallSquareMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // White square
    side: THREE.DoubleSide,
  });
  const smallSquare = new THREE.Mesh(smallSquareGeometry, smallSquareMaterial);

  // Position the small square exactly at the same center as the colored section
  smallSquare.position.set(section.position.x, 0.1, section.position.z); // Same center position, slightly raised

  // Rotate to align with the base section
  smallSquare.rotation.x = -Math.PI / 2;
  scene.add(smallSquare);
  addOutline(smallSquare, smallSquareGeometry);

  for (let j = 0; j < 4; j++) {
    const dotGeometry = new THREE.PlaneGeometry(1, 1);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: colors[i],
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    // dot.position.set(section.position.x, 0.07, section.position.z); // Lift slightly above the board

    let offset = 0.75;
    dot.position.x =
      j < 2 ? section.position.x - offset : section.position.x + offset;
    dot.position.z =
      j % 2 === 0 ? section.position.z + offset : section.position.z - offset;
    dot.position.y = 0.2;
    dot.rotation.x = -Math.PI / 2; // Align with the board
    scene.add(dot);

    addOutline(dot, dotGeometry);
  }
}

// 4. Set the camera to have a top-down view of the entire grid and board setup
camera.position.set(0, 10, 0); // Higher top-down position to view the full board
camera.lookAt(0, 0, 0); // Look at the center of the grid

function animate() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Adjust the scene size dynamically on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
