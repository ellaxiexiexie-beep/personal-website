/* ============================================
   3D MIRROR SHATTER — Three.js × Cyberpunk
   Global CDN build (works with file://)
   ============================================ */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────
  const PHOTO_PATH = '../assets/images/ella-night.jpg';
  const GRID_COLS = 10;
  const GRID_ROWS = 14;
  const MIRROR_HEIGHT_RATIO = 0.68;
  const TOTAL_DURATION = 5.5;

  const T_INTRO_END    = 0.8;
  const T_SHATTER_END  = 1.3;
  const T_DRIFT_END    = 3.2;
  const T_ASSEMBLE_END = 4.2;
  const T_LOCK_END     = 4.8;
  const T_FADE_END     = TOTAL_DURATION;

  // ─── DOM ────────────────────────────────
  var container = document.getElementById('threeOverlay');
  var mainContent = document.getElementById('mainContent');
  var skipHint = document.getElementById('skipHint');
  var particleLayer = document.getElementById('particleLayer');

  // ─── SCENE SETUP ────────────────────────
  var scene = new THREE.Scene();
  scene.background = new THREE.Color('#050510');
  scene.fog = new THREE.FogExp2('#050510', 0.00015);

  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // ─── POST-PROCESSING ────────────────────
  var composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  var bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(1, 1), 1.2, 0.5, 0.3
  );
  bloomPass.threshold = 0.45;
  bloomPass.strength = 1.3;
  bloomPass.radius = 0.6;
  composer.addPass(bloomPass);

  // ─── LIGHTING ───────────────────────────
  scene.add(new THREE.AmbientLight('#1a1a3a', 1.2));

  var keyLight = new THREE.PointLight('#00d4ff', 8, 15);
  keyLight.position.set(-3, 2.5, 5);
  scene.add(keyLight);

  var fillLight = new THREE.PointLight('#ff2d75', 4, 12);
  fillLight.position.set(3, -1.5, 3);
  scene.add(fillLight);

  var rimLight = new THREE.PointLight('#8b5cf6', 5, 10);
  rimLight.position.set(0, -3, -2);
  scene.add(rimLight);

  // ─── GRID FLOOR ─────────────────────────
  function createGridFloor() {
    var group = new THREE.Group();
    var size = 30, step = 0.8;
    var verts = [];
    for (var i = -size; i <= size; i += step) {
      verts.push(i, -6, -size, i, -6, size);
      verts.push(-size, -6, i, size, -6, i);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    var mat = new THREE.LineBasicMaterial({
      color: '#00d4ff', transparent: true, opacity: 0.08, depthWrite: false
    });
    group.add(new THREE.LineSegments(geo, mat));

    var hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-20, -6, -5), new THREE.Vector3(20, -6, -5)
    ]);
    var hMat = new THREE.LineBasicMaterial({
      color: '#00d4ff', transparent: true, opacity: 0.3, depthWrite: false
    });
    group.add(new THREE.Line(hGeo, hMat));
    return group;
  }
  scene.add(createGridFloor());

  // ─── CITY SKYLINE ───────────────────────
  function createSkyline() {
    var group = new THREE.Group();
    for (var i = 0; i < 30; i++) {
      var w = 0.3 + Math.random() * 1.2;
      var h = 1 + Math.random() * 8;
      var geo = new THREE.BoxGeometry(w, h, 0.5);
      var mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.58, 0.8, 0.03 + Math.random() * 0.08),
        transparent: true, opacity: 0.7, depthWrite: false
      });
      var box = new THREE.Mesh(geo, mat);
      box.position.set((Math.random() - 0.5) * 24, -6 + h / 2, -7 - Math.random() * 6);
      group.add(box);
    }
    return group;
  }
  scene.add(createSkyline());

  // ─── DUST PARTICLES ─────────────────────
  function createDust() {
    var count = 200;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = -1 - Math.random() * 8;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
      color: '#00d4ff', size: 0.03, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }
  var dust = createDust();
  scene.add(dust);

  // ─── VOLUME BEAM ────────────────────────
  var beamGeo = new THREE.CylinderGeometry(0.15, 2.5, 12, 16, 1, true);
  var beamMat = new THREE.MeshBasicMaterial({
    color: '#00d4ff', transparent: true, opacity: 0.03,
    side: THREE.DoubleSide, depthWrite: false
  });
  var volumeBeam = new THREE.Mesh(beamGeo, beamMat);
  volumeBeam.position.set(-4, 5, 3);
  volumeBeam.rotation.z = -0.6;
  volumeBeam.rotation.x = 0.4;
  scene.add(volumeBeam);

  // ─── SHOCKWAVE ──────────────────────────
  var shockwaveGeo = new THREE.TorusGeometry(1, 0.02, 16, 80);
  var shockwaveMat = new THREE.MeshBasicMaterial({
    color: '#00e5ff', transparent: true, opacity: 0, depthWrite: false
  });
  var shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  shockwave.visible = false;
  scene.add(shockwave);

  // ─── MIRROR & FRAGMENTS ─────────────────
  var mirrorPlane = null;
  var fragments = [];
  var fragmentGroup = new THREE.Group();
  scene.add(fragmentGroup);

  var planeW = 3.4, planeH = 5.1;
  var photoTexture = null;

  function createMirrorMaterial() {
    return new THREE.MeshStandardMaterial({
      map: photoTexture,
      roughness: 0.22, metalness: 0.85, envMapIntensity: 0.6,
      side: THREE.DoubleSide
    });
  }

  function createEdgeMaterial() {
    return new THREE.LineBasicMaterial({
      color: '#00e5ff', transparent: true, opacity: 0.5
    });
  }

  function createIntactMirror() {
    var geo = new THREE.PlaneGeometry(planeW, planeH, GRID_COLS, GRID_ROWS);
    mirrorPlane = new THREE.Mesh(geo, createMirrorMaterial());
    scene.add(mirrorPlane);
  }

  function vertexUV(vx, vy) {
    return { u: (vx + planeW / 2) / planeW, v: (vy + planeH / 2) / planeH };
  }

  function generateFragments() {
    var cellW = planeW / GRID_COLS, cellH = planeH / GRID_ROWS;
    var jitterAmt = Math.min(cellW, cellH) * 0.28;

    var pts = [];
    for (var r = 0; r <= GRID_ROWS; r++) {
      pts[r] = [];
      for (var c = 0; c <= GRID_COLS; c++) {
        var edgeR = (r === 0 || r === GRID_ROWS);
        var edgeC = (c === 0 || c === GRID_COLS);
        var jx = edgeC ? 0 : (Math.random() - 0.5) * jitterAmt * 2;
        var jy = edgeR ? 0 : (Math.random() - 0.5) * jitterAmt * 2;
        pts[r][c] = {
          x: c * cellW - planeW / 2 + jx,
          y: -(r * cellH - planeH / 2 + jy)
        };
      }
    }

    for (var r = 0; r < GRID_ROWS; r++) {
      for (var c = 0; c < GRID_COLS; c++) {
        var a = pts[r][c], b = pts[r][c + 1];
        var cc = pts[r + 1][c + 1], d = pts[r + 1][c];
        createFragment([a, b, cc]);
        createFragment([a, cc, d]);
      }
    }
  }

  function createFragment(triVerts) {
    var verts = new Float32Array(9), uvs = new Float32Array(6);
    for (var i = 0; i < 3; i++) {
      verts[i * 3]     = triVerts[i].x;
      verts[i * 3 + 1] = triVerts[i].y;
      verts[i * 3 + 2] = 0;
      var uv = vertexUV(triVerts[i].x, triVerts[i].y);
      uvs[i * 2]     = uv.u;
      uvs[i * 2 + 1] = 1 - uv.v;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.computeVertexNormals();

    var mesh = new THREE.Mesh(geo, createMirrorMaterial());

    var edgeGeo = new THREE.EdgesGeometry(geo);
    var edgeLine = new THREE.LineSegments(edgeGeo, createEdgeMaterial());
    mesh.add(edgeLine);

    var cx = (triVerts[0].x + triVerts[1].x + triVerts[2].x) / 3;
    var cy = (triVerts[0].y + triVerts[1].y + triVerts[2].y) / 3;
    var dist = Math.sqrt(cx * cx + cy * cy);
    var angle = Math.atan2(cy, cx);
    var speed = 2.5 + (dist / 4) * 5 + Math.random() * 3;

    fragments.push({
      mesh: mesh,
      edgeLine: edgeLine,
      originPos: new THREE.Vector3(0, 0, 0),
      originRot: new THREE.Euler(0, 0, 0),
      velocity: new THREE.Vector3(
        Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4
      ),
      angularVel: new THREE.Vector3(
        (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6
      ),
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.3 + Math.random() * 0.7,
      driftAmp: 0.1 + Math.random() * 0.4
    });

    fragmentGroup.add(mesh);
  }

  // ─── ANIMATION ──────────────────────────
  var animStartTime = 0, animSkipped = false, skipProgress = 0;

  function getAnimTime() {
    return (performance.now() - animStartTime) / 1000;
  }

  function easeOutCubic(t)   { return 1 - Math.pow(1 - t, 3); }
  function easeOutElastic(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
  }
  function easeOutBack(t) {
    var c1 = 1.70158;
    return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function animate(timestamp) {
    requestAnimationFrame(animate);

    if (!animStartTime) animStartTime = timestamp;
    var t = getAnimTime();

    if (animSkipped) {
      skipProgress = Math.min(1, skipProgress + 0.05);
      t = T_DRIFT_END + (T_ASSEMBLE_END - T_DRIFT_END) * easeOutBack(skipProgress);
      if (skipProgress >= 1) t = T_FADE_END;
    }

    // Update fragments
    for (var i = 0; i < fragments.length; i++) {
      var f = fragments[i];
      if (t < T_INTRO_END) {
        f.mesh.visible = false;
        f.mesh.position.set(0, 0, 0);
        f.mesh.rotation.set(0, 0, 0);
      } else if (t < T_SHATTER_END) {
        f.mesh.visible = true;
        if (mirrorPlane && mirrorPlane.visible) mirrorPlane.visible = false;
        var ep = easeOutCubic((t - T_INTRO_END) / (T_SHATTER_END - T_INTRO_END));
        f.mesh.position.copy(f.velocity.clone().multiplyScalar(ep * 1.5));
        f.mesh.rotation.set(f.angularVel.x * ep, f.angularVel.y * ep, f.angularVel.z * ep);
      } else if (t < T_DRIFT_END) {
        var dProg = (t - T_SHATTER_END) / (T_DRIFT_END - T_SHATTER_END);
        var base = f.velocity.clone().multiplyScalar(1.5);
        var dx = Math.sin(t * f.driftSpeed + f.driftPhase) * f.driftAmp;
        var dy = Math.cos(t * f.driftSpeed * 1.3 + f.driftPhase) * f.driftAmp * 0.7;
        f.mesh.position.set(base.x + dx, base.y + dy, base.z);
        f.mesh.rotation.set(
          f.angularVel.x * (1 - dProg * 0.7),
          f.angularVel.y * (1 - dProg * 0.7),
          f.angularVel.z * (1 - dProg * 0.7)
        );
      } else if (t < T_ASSEMBLE_END) {
        var aProg = Math.min(1, (t - T_DRIFT_END) / (T_ASSEMBLE_END - T_DRIFT_END));
        var ap = easeOutElastic(Math.min(1, aProg * 1.15));
        f.mesh.position.lerp(f.originPos, ap);
        f.mesh.rotation.x = THREE.MathUtils.lerp(f.mesh.rotation.x, 0, ap);
        f.mesh.rotation.y = THREE.MathUtils.lerp(f.mesh.rotation.y, 0, ap);
        f.mesh.rotation.z = THREE.MathUtils.lerp(f.mesh.rotation.z, 0, ap);
      } else {
        f.mesh.position.copy(f.originPos);
        f.mesh.rotation.set(0, 0, 0);
        if (t > T_LOCK_END) {
          f.edgeLine.material.opacity = 0.5 * (1 - Math.min(1, (t - T_LOCK_END) / (T_FADE_END - T_LOCK_END)));
        }
      }
    }

    // Camera
    var camTarget = new THREE.Vector3(0, 0, 8);
    var camLookAt = new THREE.Vector3(0, 0, 0);

    if (t < T_INTRO_END) {
      var p = t / T_INTRO_END;
      camTarget.set(5 * (1 - p), 0, 8 - 1.5 * p);
    } else if (t < T_SHATTER_END) {
      var shake = (T_SHATTER_END - t) / (T_SHATTER_END - T_INTRO_END);
      camTarget.set((Math.random() - 0.5) * 0.3 * shake, (Math.random() - 0.5) * 0.3 * shake, 6.5);
    } else if (t < T_ASSEMBLE_END) {
      var ap2 = (t - T_SHATTER_END) / (T_ASSEMBLE_END - T_SHATTER_END);
      camTarget.set(Math.sin(ap2 * 1.5) * 1.2, Math.cos(ap2 * 0.8) * 0.4, 6.5 + ap2 * 0.5);
      camLookAt.set(0, 0, 0);
    } else {
      var lp = Math.min(1, (t - T_ASSEMBLE_END) / (T_LOCK_END - T_ASSEMBLE_END));
      camTarget.set(0, 0, 6.5 + lp * 2.5);
    }

    camera.position.lerp(camTarget, 0.05);
    camera.lookAt(camLookAt);

    // Shockwave
    if (t >= T_ASSEMBLE_END && t < T_LOCK_END) {
      var sp = (t - T_ASSEMBLE_END) / (T_LOCK_END - T_ASSEMBLE_END);
      shockwave.visible = true;
      var s = 1 + sp * 4;
      shockwave.scale.set(s, s, s);
      shockwave.material.opacity = Math.max(0, 0.6 * (1 - sp));
      shockwave.position.z = 0.05;
    } else if (t >= T_LOCK_END) {
      shockwave.visible = false;
      shockwave.material.opacity = 0;
    }

    dust.rotation.y += 0.0003;
    dust.rotation.x += 0.0001;

    composer.render();

    // Transition to content
    if (t >= T_FADE_END) {
      container.classList.add('fade-out');
      mainContent.classList.add('visible');
      skipHint.classList.add('hidden');
      if (t > T_FADE_END + 1.0) {
        container.style.display = 'none';
      }
    }
  }

  // ─── SKIP ───────────────────────────────
  function skipAnimation() {
    if (animSkipped) return;
    animSkipped = true;
    skipHint.classList.add('hidden');
    if (mirrorPlane) mirrorPlane.visible = false;
    for (var i = 0; i < fragments.length; i++) { fragments[i].mesh.visible = true; }
  }
  container.addEventListener('click', skipAnimation);
  skipHint.addEventListener('click', function (e) { e.stopPropagation(); skipAnimation(); });

  // ─── RESIZE ─────────────────────────────
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ─── CSS PARTICLES ──────────────────────
  function spawnCSSParticles() {
    for (var i = 0; i < 20; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 16) + 's';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
      particleLayer.appendChild(p);
    }
  }

  // ─── SCROLL REVEALS ─────────────────────
  function setupScrollReveals() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    var els = document.querySelectorAll('.reveal');
    for (var i = 0; i < els.length; i++) observer.observe(els[i]);
  }

  // ─── LOAD PHOTO & START ─────────────────
  function computePlaneSize(imgW, imgH) {
    var visibleH = 2 * 7 * Math.tan(THREE.MathUtils.degToRad(27.5));
    var targetH = visibleH * MIRROR_HEIGHT_RATIO;
    var aspect = imgW / imgH;
    planeH = targetH;
    planeW = targetH * aspect;
    var viewW = window.innerWidth, viewH = window.innerHeight;
    var visibleW = visibleH * (viewW / viewH);
    if (planeW > visibleW * 0.8) { planeW = visibleW * 0.8; planeH = planeW / aspect; }
  }

  function fallbackTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 768;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0a0a2e'); grad.addColorStop(0.5, '#1a0a3e'); grad.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0,212,255,0.3)'; ctx.lineWidth = 1;
    for (var i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    photoTexture = new THREE.CanvasTexture(canvas);
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    computePlaneSize(canvas.width, canvas.height);
    startScene();
  }

  function startScene() {
    createIntactMirror();
    generateFragments();
    for (var i = 0; i < fragments.length; i++) { fragments[i].mesh.visible = false; }
    spawnCSSParticles();
    setupScrollReveals();
    requestAnimationFrame(animate);
  }

  // Try loading photo; fallback to generated texture
  try {
    var loader = new THREE.TextureLoader();
    loader.load(
      PHOTO_PATH,
      function (texture) {
        photoTexture = texture;
        photoTexture.colorSpace = THREE.SRGBColorSpace;
        computePlaneSize(texture.image.width, texture.image.height);
        startScene();
      },
      undefined,
      function () { fallbackTexture(); }
    );
  } catch (e) {
    fallbackTexture();
  }

})();
