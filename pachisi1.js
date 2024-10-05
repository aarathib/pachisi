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

// Create the main 15x15 white base grid
const gridSize = 15;
const sectionSize = 6;

// Define colors for the four sections (green, blue, red, yellow)
const baseColors = {
  green: 0x00ff00,
  blue: 0x0000ff,
  red: 0xff0000,
  yellow: 0xffff00, // Removed extra space here
};
const colors = ["green", "blue", "red", "yellow"];

const gridColors = Array(gridSize)
  .fill(null)
  .map(() => Array(gridSize).fill(0xffffff));

// Set up the cross-pattern paths
for (let i = 1; i < gridSize / 2; i++) {
  gridColors[7][i] = baseColors["blue"];
  gridColors[7][gridSize - 1 - i] = baseColors["red"];
  gridColors[i][7] = baseColors["yellow"];
  gridColors[gridSize - 1 - i][7] = baseColors["green"];
}

gridColors[6][1] = baseColors["blue"];
gridColors[13][6] = baseColors["green"];
gridColors[8][13] = baseColors["red"];
gridColors[1][8] = baseColors["yellow"];

//  Generate the board using individual squares
let cellSize = 1;
let x = -7,
  z = -7;
for (let row = 0; row < gridSize; row++) {
  x = -7;
  for (let col = 0; col < gridSize; col++) {
    const cellGeometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const cellMaterial = new THREE.MeshBasicMaterial({
      color: gridColors[row][col],
      side: THREE.DoubleSide,
    });
    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.rotation.x = -Math.PI / 2; // Rotate to lie flat on the x-z plane
    cell.position.set(x, 0, z);
    scene.add(cell);
    addOutline(cell, cellGeometry);
    x++;
  }
  z++;
}

const addMidTriangle = () => {
  const centerSquareSize = 3;

  const createTriangle = (base, center, color) => {
    const shape = new THREE.Shape();

    // Define the vertices of the triangle
    shape.moveTo(center.x, center.y); // Center of the square
    shape.lineTo(base[0].x, base[0].y); // First corner of the base
    shape.lineTo(base[1].x, base[1].y); // Second corner of the base
    shape.lineTo(center.x, center.y); // Back to the center

    // Create geometry from the shape
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    });

    // Create and return the mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Ensure it lies flat on the x-z plane
    return mesh;
  };

  // Create and position each triangle within the central square
  const halfSize = centerSquareSize / 2;
  const center = { x: 0, y: 0 };

  // Define the base vertices for each triangle relative to the center position
  const bases = [
    [
      { x: -halfSize, y: halfSize },
      { x: halfSize, y: halfSize },
    ],
    [
      { x: halfSize, y: halfSize },
      { x: halfSize, y: -halfSize },
    ],
    [
      { x: halfSize, y: -halfSize },
      { x: -halfSize, y: -halfSize },
    ],
    [
      { x: -halfSize, y: -halfSize },
      { x: -halfSize, y: halfSize },
    ],
  ];

  // Create each triangle and add them to the scene
  const triangle1 = createTriangle(bases[0], center, baseColors[colors[3]]);
  triangle1.position.set(0, 0.05, 0); // Centered at (0, 0)
  scene.add(triangle1);
  addOutline(triangle1, triangle1.geometry);

  const triangle2 = createTriangle(bases[1], center, baseColors[colors[2]]);
  triangle2.position.set(0, 0.05, 0); // Centered at (0, 0)
  scene.add(triangle2);
  addOutline(triangle1, triangle2.geometry);

  const triangle3 = createTriangle(bases[2], center, baseColors[colors[0]]);
  triangle3.position.set(0, 0.05, 0); // Centered at (0, 0)
  scene.add(triangle3);
  addOutline(triangle1, triangle3.geometry);

  const triangle4 = createTriangle(bases[3], center, baseColors[colors[1]]);
  triangle4.position.set(0, 0.05, 0); // Centered at (0, 0)
  scene.add(triangle4);
  addOutline(triangle1, triangle4.geometry);
};

//  Create four sections positioned within the grid's 3x3 central area
for (let i = 0; i < 4; i++) {
  // Create the main colored square sections
  const sectionGeometry = new THREE.PlaneGeometry(sectionSize, sectionSize);
  const sectionMaterial = new THREE.MeshBasicMaterial({
    color: baseColors[colors[i]],
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
      color: baseColors[colors[i]],
      side: THREE.DoubleSide,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

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

addMidTriangle();

// Set the camera to have a top-down view of the entire grid and board setup
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
