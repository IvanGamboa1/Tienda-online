import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const BASE_PRICE = 50000;
const SIZE_PRICE = { small: 5000, medium: 10000, large: 20000 };
const SIZE_LABEL = { small: 'Pequeño', medium: 'Mediano', large: 'Grande' };
const ZONE_LABEL = {
  front: 'Frente',
  back: 'Espalda',
  leftSleeve: 'Manga izquierda',
  rightSleeve: 'Manga derecha'
};
const COLOR_NAMES = { '#f2f0eb': 'Blanco', '#171717': 'Negro', '#b51f2b': 'Rojo' };
const designLayers = [];
let selectedZone = 'front';
let selectedTool = 'text';
let selectedLayerId = null;
let shirtColor = '#f2f0eb';
let layerCounter = 0;
let renderer;
let scene;
let camera;
let controls;
let shirtMaterials = [];
let previewTextures = {};
const zoneCanvases = {};
let designPanels = [];
const dirtyTextureZones = new Set();
let textureUpdateFrame = 0;
let raycaster;
let pointer;
let activeDesignDrag = null;

const canvasWrap = document.getElementById('shirtCanvasWrap');
const loading = document.getElementById('shirtLoading');
const layerList = document.getElementById('designerLayerList');
const message = document.getElementById('designerMessage');

function priceForDesigns() {
  return BASE_PRICE + designLayers.reduce((sum, design) => sum + SIZE_PRICE[design.size], 0);
}

function formatPrice(value) {
  return `$${value.toLocaleString('es-CO')}`;
}

function updatePrice() {
  const prints = priceForDesigns() - BASE_PRICE;
  document.getElementById('designerPrintTotal').textContent = `${formatPrice(prints)} COP`;
  document.getElementById('designerTotal').textContent = `${formatPrice(priceForDesigns())} COP`;
  document.getElementById('designerAddToCart').innerHTML =
    `<i class="bi bi-bag-plus-fill"></i> AGREGAR AL CARRITO · ${formatPrice(priceForDesigns())}`;
}

function zoneCanvasSize(zone) {
  return 1024;
}

function printScale(size, zone = null) {
  const scale = size === 'small' ? .19 : size === 'medium' ? .32 : .47;
  return zone === 'leftSleeve' || zone === 'rightSleeve' ? Math.min(.75, scale * 2) : scale;
}

function clampLayerPosition(layer) {
  const margin = printScale(layer.size, layer.zone) * 50 + 2;
  layer.x = Math.max(margin, Math.min(100 - margin, layer.x));
  layer.y = Math.max(margin, Math.min(100 - margin, layer.y));
}

function syncPositionRange(size, zone = selectedZone) {
  const margin = printScale(size, zone) * 50 + 2;
  const horizontal = document.getElementById('designerPositionX');
  horizontal.min = Math.ceil(margin);
  horizontal.max = Math.floor(100 - margin);
  const vertical = document.getElementById('designerPositionY');
  vertical.min = Math.ceil(margin);
  vertical.max = Math.floor(100 - margin);
}

function drawLayer(ctx, design, width, height) {
  const centerX = width * design.x / 100;
  const centerY = height * design.y / 100;
  const scale = printScale(design.size, design.zone);
  const maxWidth = width * scale;
  const maxHeight = height * scale;

  ctx.save();
  ctx.translate(centerX, centerY);
  if (design.zone === 'leftSleeve') ctx.scale(-1, 1);
  if (design.type === 'image' && design.imageElement && (design.imageElement.complete ?? true)) {
    const image = design.imageElement;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
    ctx.drawImage(image, -image.width * ratio / 2, -image.height * ratio / 2, image.width * ratio, image.height * ratio);
  } else {
    const fontSize = Math.round(maxWidth * (design.type === 'sticker' ? .8 : .7));
    ctx.fillStyle = design.color || '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontFamily = design.fontFamily || 'Montserrat';
    ctx.font = `900 ${fontSize}px "${fontFamily}", Arial, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,.2)';
    ctx.shadowBlur = 4;
    ctx.fillText(design.text, 0, 0, maxWidth);
  }
  ctx.restore();
}

function getZoneCanvas(zone) {
  const size = zoneCanvasSize(zone);
  let canvas = zoneCanvases[zone];
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    zoneCanvases[zone] = canvas;
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  designLayers.filter(layer => layer.zone === zone).forEach(layer => drawLayer(context, layer, size, size));
  return canvas;
}

function rebuildTextures(zoneToUpdate = null) {
  const zones = zoneToUpdate ? [zoneToUpdate] : Object.keys(previewTextures);
  zones.forEach(zone => dirtyTextureZones.add(zone));
  if (textureUpdateFrame) return;
  textureUpdateFrame = requestAnimationFrame(() => {
    textureUpdateFrame = 0;
    dirtyTextureZones.forEach(zone => {
      if (!previewTextures[zone]?.length) return;
      const canvas = getZoneCanvas(zone);
      previewTextures[zone].forEach(texture => {
        texture.image = canvas;
        texture.needsUpdate = true;
      });
    });
    dirtyTextureZones.clear();
    if (renderer && scene && camera) renderer.render(scene, camera);
  });
}

function createPanel(zone, width, height, position, rotationY = 0) {
  let texture = previewTextures[zone]?.[0];
  if (!texture) {
    texture = new THREE.CanvasTexture(getZoneCanvas(zone));
    texture.colorSpace = THREE.SRGBColorSpace;
    previewTextures[zone] = [];
  }
  if (!previewTextures[zone].includes(texture)) previewTextures[zone].push(texture);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: .01,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: .98,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2
  });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.position.set(...position);
  panel.rotation.y = rotationY;
  panel.renderOrder = 2;
  panel.userData.zone = zone;
  designPanels.push(panel);
  return panel;
}

function smoothFrontDetails(geometry) {
  const positions = geometry.attributes.position;
  const indices = geometry.index.array;
  const neighbors = Array.from({ length: positions.count }, () => new Set());
  for (let offset = 0; offset < indices.length; offset += 3) {
    const triangle = [indices[offset], indices[offset + 1], indices[offset + 2]];
    for (let edge = 0; edge < 3; edge += 1) {
      const current = triangle[edge];
      const next = triangle[(edge + 1) % 3];
      neighbors[current].add(next);
      neighbors[next].add(current);
    }
  }

  // Join normal neighborhoods split at duplicated mesh vertices.
  const verticesByPosition = new Map();
  for (let index = 0; index < positions.count; index += 1) {
    const key = [
      Math.round(positions.getX(index) * 100000),
      Math.round(positions.getY(index) * 100000),
      Math.round(positions.getZ(index) * 100000)
    ].join(',');
    const group = verticesByPosition.get(key) || [];
    group.push(index);
    verticesByPosition.set(key, group);
  }
  verticesByPosition.forEach(group => {
    if (group.length < 2) return;
    const adjacent = new Set();
    group.forEach(index => neighbors[index].forEach(neighbor => adjacent.add(neighbor)));
    group.forEach(index => adjacent.forEach(neighbor => {
      if (neighbor !== index) neighbors[index].add(neighbor);
    }));
  });

  const weights = new Float32Array(positions.count);
  const smoothstep = (edge0, edge1, value) => {
    const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    if (x < .035) continue;

    const logoRadius = Math.sqrt(((y - .32) / .1) ** 2 + ((z - .13) / .17) ** 2);
    const logoWeight = 1 - smoothstep(.65, 1.45, logoRadius);
    const shoulderPath = Math.abs(z);
    const shoulderY = .46 - shoulderPath * .3;
    const shoulderWidth = Math.abs(y - shoulderY);
    const shoulderWeight = shoulderPath > .055 && shoulderPath < .38
      ? 1 - smoothstep(.035, .078, shoulderWidth)
      : 0;
    weights[index] = Math.max(logoWeight, shoulderWeight);
  }

  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  const values = new Float32Array(normals.array);
  for (let iteration = 0; iteration < 54; iteration += 1) {
    const nextValues = new Float32Array(values);
    for (let index = 0; index < positions.count; index += 1) {
      if (!weights[index]) continue;
      const x = positions.getX(index);
      const total = [0, 0, 0];
      let count = 0;
      neighbors[index].forEach(neighbor => {
        const neighborX = positions.getX(neighbor);
        if (Math.sign(neighborX) !== Math.sign(x) || Math.abs(neighborX) < .035) return;
        total[0] += values[neighbor * 3];
        total[1] += values[neighbor * 3 + 1];
        total[2] += values[neighbor * 3 + 2];
        count += 1;
      });
      if (count) {
        const weight = weights[index] * .68;
        nextValues[index * 3] = values[index * 3] * (1 - weight) + total[0] / count * weight;
        nextValues[index * 3 + 1] = values[index * 3 + 1] * (1 - weight) + total[1] / count * weight;
        nextValues[index * 3 + 2] = values[index * 3 + 2] * (1 - weight) + total[2] / count * weight;
      }
    }
    values.set(nextValues);
  }
  for (let index = 0; index < positions.count; index += 1) {
    if (!weights[index]) continue;
    const offset = index * 3;
    const normal = new THREE.Vector3(values[offset], values[offset + 1], values[offset + 2]).normalize();
    values[offset] = normal.x;
    values[offset + 1] = normal.y;
    values[offset + 2] = normal.z;
  }
  normals.array.set(values);
  normals.needsUpdate = true;
}

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
  camera.position.set(5.4, .2, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  canvasWrap.prepend(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.target.set(0, -.02, 0);
  controls.minDistance = 3.5;
  controls.maxDistance = 7;
  controls.maxPolarAngle = Math.PI * .83;
  controls.addEventListener('change', () => renderer.render(scene, camera));
  setupDesignDragging();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x383838, 1.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(4, 4, 5);
  scene.add(keyLight);

  const frontGroup = new THREE.Group();
  const backGroup = new THREE.Group();
  scene.add(frontGroup, backGroup);
  loadShirtModel(frontGroup, backGroup);
  resizeRenderer();
  window.addEventListener('resize', resizeRenderer);
}

function setPointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
}

function findDesignAtPointer(event) {
  setPointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects(designPanels, false);
  for (const intersection of intersections) {
    const zone = intersection.object.userData.zone;
    const x = intersection.uv.x * 100;
    const y = (1 - intersection.uv.y) * 100;
    const layers = designLayers.filter(layer => layer.zone === zone);
    let nearest = null;
    let nearestDistance = Infinity;
    layers.forEach(layer => {
      const distance = Math.hypot(x - layer.x, y - layer.y);
      const sizeScale = printScale(layer.size, layer.zone);
      const hitRadius = sizeScale * 50;
      if (distance <= hitRadius && distance < nearestDistance) {
        nearest = layer;
        nearestDistance = distance;
      }
    });
    if (nearest) return { layer: nearest, panel: intersection.object, x, y, uv: intersection.uv };
  }
  return null;
}

function setupDesignDragging() {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'grab';

  canvas.addEventListener('pointerdown', event => {
    const hit = findDesignAtPointer(event);
    if (!hit) return;
    activeDesignDrag = {
      pointerId: event.pointerId,
      layer: hit.layer,
      panel: hit.panel,
      offsetX: hit.layer.x - hit.x,
      offsetY: hit.layer.y - hit.y
    };
    selectedLayerId = hit.layer.id;
    selectedZone = hit.layer.zone;
    controls.enabled = false;
    document.getElementById('designerSize').value = hit.layer.size;
    syncPositionRange(hit.layer.size);
    canvas.classList.add('is-dragging-design');
    canvas.setPointerCapture(event.pointerId);
    document.getElementById('designerPositionX').value = hit.layer.x;
    document.getElementById('designerPositionY').value = hit.layer.y;
    document.querySelectorAll('.designer-zone').forEach(button => {
      button.classList.toggle('selected', button.dataset.zone === selectedZone);
    });
    renderLayerList();
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  window.addEventListener('pointermove', event => {
    if (!activeDesignDrag || event.pointerId !== activeDesignDrag.pointerId) return;
    setPointerFromEvent(event);
    raycaster.setFromCamera(pointer, camera);
    const [intersection] = raycaster.intersectObject(activeDesignDrag.panel, false);
    if (!intersection) return;
    const layer = activeDesignDrag.layer;
    const x = intersection.uv.x * 100;
    const y = (1 - intersection.uv.y) * 100;
    layer.x = x + activeDesignDrag.offsetX;
    layer.y = y + activeDesignDrag.offsetY;
    clampLayerPosition(layer);
    document.getElementById('designerPositionX').value = layer.x;
    document.getElementById('designerPositionY').value = layer.y;
    rebuildTextures(layer.zone);
    event.preventDefault();
  }, { passive: false });

  const finishDrag = event => {
    if (!activeDesignDrag || event.pointerId !== activeDesignDrag.pointerId) return;
    activeDesignDrag = null;
    controls.enabled = true;
    canvas.classList.remove('is-dragging-design');
    canvas.style.cursor = 'grab';
  };
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);
}

function loadShirtModel(frontGroup, backGroup) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load('./models/k1ko-shirt.glb', gltf => {
    const shirt = gltf.scene;
    shirt.rotation.y = 0;
    const originalBounds = new THREE.Box3().setFromObject(shirt);
    const originalSize = originalBounds.getSize(new THREE.Vector3());
    shirt.scale.setScalar(2 / originalSize.y);
    shirt.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(shirt);
    const size = bounds.getSize(new THREE.Vector3());
    const shirtCenterY = -(bounds.min.y + bounds.max.y) / 2;
    shirt.position.y += shirtCenterY;

    shirt.traverse(object => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      smoothFrontDetails(object.geometry);
      const shirtMaterialsForMesh = materials.map(() => {
        const plainMaterial = new THREE.MeshLambertMaterial({
          color: shirtColor,
          side: THREE.DoubleSide
        });
        return plainMaterial;
      });
      object.material = Array.isArray(object.material) ? shirtMaterialsForMesh : shirtMaterialsForMesh[0];
      shirtMaterials.push(...shirtMaterialsForMesh);
      object.castShadow = true;
      object.receiveShadow = true;
    });
    scene.add(shirt);
    const width = size.z;
    const height = size.y;
    const frontX = bounds.max.x + .008;
    const backX = bounds.min.x - .008;
    frontGroup.add(createPanel('front', width * .72, height * .92, [frontX, shirtCenterY, 0], Math.PI / 2));
    const sleeveY = shirtCenterY + height * .25;
    const sleeveSideZ = width * .49 + .008;
    frontGroup.add(createPanel('leftSleeve', width * .18, height * .16, [-.05, sleeveY, -sleeveSideZ]));
    frontGroup.add(createPanel('rightSleeve', width * .18, height * .16, [-.05, sleeveY, sleeveSideZ]));
    backGroup.add(createPanel('back', width * .72, height * .92, [backX, shirtCenterY, 0], -Math.PI / 2));
    setView('front');
    loading.hidden = true;
    resizeRenderer();
    renderer.render(scene, camera);
    dracoLoader.dispose();
  }, undefined, error => {
    console.error('No se pudo cargar el modelo de camiseta:', error);
    loading.textContent = 'No se pudo cargar la camiseta 3D. Actualiza la página e inténtalo de nuevo.';
    document.getElementById('designerAddToCart').disabled = true;
    dracoLoader.dispose();
  });
}

function resizeRenderer() {
  if (!renderer) return;
  const width = canvasWrap.clientWidth;
  const height = canvasWrap.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function setView(view) {
  const views = {
    front: [5.4, .2, 0],
    back: [-5.4, .2, 0],
    left: [0, .2, -5.4],
    right: [0, .2, 5.4]
  };
  controls.reset();
  camera.position.set(...views[view]);
  controls.target.set(0, -.02, 0);
  controls.update();
  const viewLabels = { front: 'FRONTAL', back: 'TRASERA', left: 'LADO IZQUIERDO', right: 'LADO DERECHO' };
  document.getElementById('designerViewLabel').textContent = `VISTA ${viewLabels[view]}`;
  document.querySelectorAll('.designer-view-btn').forEach(button => button.classList.toggle('selected', button.dataset.view === view));
}

function renderLayerList() {
  layerList.replaceChildren();
  designLayers.forEach(layer => {
    const row = document.createElement('div');
    row.className = 'designer-layer';
    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = `designer-layer-select${layer.id === selectedLayerId ? ' selected' : ''}`;
    const fontLabel = layer.type === 'text' && layer.fontFamily ? ` · ${layer.fontFamily}` : '';
    selectButton.textContent = `${ZONE_LABEL[layer.zone]} · ${layer.type === 'image' ? 'Imagen' : layer.text} · ${SIZE_LABEL[layer.size]}${fontLabel}`;
    selectButton.addEventListener('click', () => {
      selectedLayerId = layer.id;
      selectedZone = layer.zone;
      document.getElementById('designerSize').value = layer.size;
      syncPositionRange(layer.size);
      document.getElementById('designerPositionX').value = layer.x;
      document.getElementById('designerPositionY').value = layer.y;
      if (layer.type === 'text') document.getElementById('designerFontFamily').value = layer.fontFamily || 'Montserrat';
      document.querySelectorAll('.designer-zone').forEach(button => button.classList.toggle('selected', button.dataset.zone === selectedZone));
      renderLayerList();
    });
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'designer-layer-remove';
    removeButton.setAttribute('aria-label', 'Eliminar diseño');
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      const index = designLayers.findIndex(item => item.id === layer.id);
      if (index >= 0) designLayers.splice(index, 1);
      if (selectedLayerId === layer.id) selectedLayerId = null;
      rebuildTextures(layer.zone);
      renderLayerList();
      updatePrice();
    });
    row.append(selectButton, removeButton);
    layerList.append(row);
  });
}

function addLayer(type, values) {
  if (designLayers.length >= 8) {
    message.textContent = 'Puedes agregar hasta 8 impresiones por camiseta.';
    return;
  }
  message.textContent = '';
  const size = document.getElementById('designerSize').value;
  const layer = {
    id: ++layerCounter,
    type,
    zone: selectedZone,
    size,
    sizeLabel: SIZE_LABEL[size],
    x: Number(document.getElementById('designerPositionX').value),
    y: Number(document.getElementById('designerPositionY').value),
    fontFamily: type === 'text' ? (values.fontFamily || document.getElementById('designerFontFamily').value) : null,
    ...values
  };
  clampLayerPosition(layer);
  syncPositionRange(layer.size);
  document.getElementById('designerPositionX').value = layer.x;
  document.getElementById('designerPositionY').value = layer.y;
  designLayers.push(layer);
  selectedLayerId = layer.id;
  rebuildTextures(layer.zone);
  renderLayerList();
  updatePrice();
}

function updateSelectedPosition() {
  const layer = designLayers.find(item => item.id === selectedLayerId);
  if (!layer) return;
  layer.x = Number(document.getElementById('designerPositionX').value);
  layer.y = Number(document.getElementById('designerPositionY').value);
  clampLayerPosition(layer);
  document.getElementById('designerPositionX').value = layer.x;
  document.getElementById('designerPositionY').value = layer.y;
  rebuildTextures(layer.zone);
}

function previewImage(file) {
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    message.textContent = 'Elige una imagen PNG, JPG o WEBP.';
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    message.textContent = 'La imagen debe pesar máximo 3 MB.';
    return;
  }
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 2048 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    addLayer('image', { image: canvas.toDataURL('image/webp', .92), imageElement: image });
    URL.revokeObjectURL(objectUrl);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    message.textContent = 'No se pudo leer la imagen. Intenta con otro archivo.';
  };
  image.src = objectUrl;
}

function exportPreview() {
  renderer.render(scene, camera);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  context.fillStyle = '#171717';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const side = Math.min(renderer.domElement.width, renderer.domElement.height);
  context.drawImage(
    renderer.domElement,
    (renderer.domElement.width - side) / 2,
    (renderer.domElement.height - side) / 2,
    side,
    side,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas.toDataURL('image/jpeg', .84);
}

function addToCart() {
  message.textContent = '';
  if (designLayers.length === 0) {
    message.textContent = 'Agrega por lo menos un diseño antes de continuar.';
    return;
  }
  const size = document.querySelector('.modal-size-btn.selected')?.textContent || 'M';
  const designs = designLayers.map(({ id, type, zone, size: printSize, sizeLabel, x, y, text, color, image, fontFamily }) => ({
    id, type, zone, size: printSize, sizeLabel, x, y, text, color, image, fontFamily
  }));
  window.addCustomShirtToCart({
    price: priceForDesigns(),
    color: shirtColor,
    size,
    designs,
    preview: exportPreview()
  });
}

document.querySelectorAll('.designer-zone').forEach(button => {
  button.addEventListener('click', () => {
    selectedZone = button.dataset.zone;
    selectedLayerId = null;
    syncPositionRange(document.getElementById('designerSize').value);
    document.querySelectorAll('.designer-zone').forEach(zone => zone.classList.toggle('selected', zone === button));
    renderLayerList();
  });
});

document.querySelectorAll('.designer-color').forEach(button => {
  button.addEventListener('click', () => {
    shirtColor = button.dataset.color;
    shirtMaterials.forEach(material => material.color.set(shirtColor));
    document.querySelectorAll('.designer-color').forEach(color => color.classList.toggle('selected', color === button));
    renderer.render(scene, camera);
  });
});

document.querySelectorAll('.designer-view-btn').forEach(button => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

document.querySelectorAll('.designer-tool').forEach(button => {
  button.addEventListener('click', () => {
    selectedTool = button.dataset.tool;
    document.querySelectorAll('.designer-tool').forEach(tool => tool.classList.toggle('selected', tool === button));
    document.getElementById('designerTextPanel').hidden = selectedTool !== 'text';
    document.getElementById('designerUploadPanel').hidden = selectedTool !== 'upload';
    document.getElementById('designerStickerPanel').hidden = selectedTool !== 'sticker';
    message.textContent = '';
  });
});

document.getElementById('designerAddText').addEventListener('click', () => {
  const text = document.getElementById('designerText').value.trim();
  if (!text) {
    message.textContent = 'Escribe el texto que quieres imprimir.';
    return;
  }
  addLayer('text', {
    text,
    color: document.getElementById('designerTextColor').value,
    fontFamily: document.getElementById('designerFontFamily').value
  });
});

document.getElementById('designerFontFamily').addEventListener('change', event => {
  const layer = designLayers.find(item => item.id === selectedLayerId);
  if (!layer || layer.type !== 'text') return;
  layer.fontFamily = event.target.value;
  rebuildTextures(layer.zone);
  renderLayerList();
});

document.getElementById('designerImage').addEventListener('change', event => {
  previewImage(event.target.files?.[0]);
  event.target.value = '';
});

document.querySelectorAll('.designer-sticker').forEach(button => {
  button.addEventListener('click', () => addLayer('sticker', { text: button.dataset.sticker, color: '#fbbf24' }));
});

document.getElementById('designerPositionX').addEventListener('input', updateSelectedPosition);
document.getElementById('designerPositionY').addEventListener('input', updateSelectedPosition);
document.getElementById('designerSize').addEventListener('change', event => {
  const layer = designLayers.find(item => item.id === selectedLayerId);
  syncPositionRange(event.target.value);
  if (!layer) return;
  layer.size = event.target.value;
  layer.sizeLabel = SIZE_LABEL[layer.size];
  clampLayerPosition(layer);
  document.getElementById('designerPositionX').value = layer.x;
  document.getElementById('designerPositionY').value = layer.y;
  rebuildTextures(layer.zone);
  renderLayerList();
  updatePrice();
});
document.getElementById('designerAddToCart').addEventListener('click', addToCart);
document.querySelectorAll('.modal-size-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.modal-size-btn').forEach(size => size.classList.toggle('selected', size === button));
  });
});

try {
  syncPositionRange(document.getElementById('designerSize').value);
  initScene();
  updatePrice();
} catch (error) {
  console.error('No se pudo iniciar el diseñador 3D:', error);
  loading.textContent = 'No se pudo cargar el modelo 3D. Actualiza la página e inténtalo de nuevo.';
  document.getElementById('designerAddToCart').disabled = true;
}
