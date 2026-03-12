/* ===========================
   APEX GYM — Premium JS
   GSAP + Three.js + Vanilla
   =========================== */

'use strict';

// ─── REGISTER GSAP PLUGINS ───────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── CUSTOM CURSOR ───────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.05 });
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(follower, { x: followerX, y: followerY });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();
})();

// ─── NAV SCROLL ──────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
})();

// ─── THREE.JS — 3D DUMBBELL ──────────────────────────────
(function initThree() {
  const canvas = document.getElementById('threeCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  // ── Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambient);

  const redLight = new THREE.PointLight(0xe63b2e, 8, 20);
  redLight.position.set(-3, 2, 4);
  scene.add(redLight);

  const fillLight = new THREE.PointLight(0xff7050, 4, 15);
  fillLight.position.set(4, -1, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 5, -5);
  scene.add(rimLight);

  // ── Materials
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    metalness: 0.9,
    roughness: 0.3,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xe63b2e,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xe63b2e,
    emissiveIntensity: 0.15,
  });

  // ── Dumbbell group
  const dumbbell = new THREE.Group();

  // Bar (cylinder along X)
  const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 24);
  const bar = new THREE.Mesh(barGeo, metalMat);
  bar.rotation.z = Math.PI / 2;
  bar.castShadow = true;
  dumbbell.add(bar);

  // Knurling rings on bar
  for (let i = -3; i <= 3; i++) {
    if (Math.abs(i) > 2) continue;
    const ringGeo = new THREE.TorusGeometry(0.095, 0.012, 8, 24);
    const ring = new THREE.Mesh(ringGeo, accentMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = i * 0.22;
    dumbbell.add(ring);
  }

  // Weight plates function
  function addPlateSet(xPos) {
    const group = new THREE.Group();

    // Outer large plate
    const plate1Geo = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 32);
    const plate1 = new THREE.Mesh(plate1Geo, plateMat);
    plate1.rotation.z = Math.PI / 2;
    plate1.position.x = xPos;
    plate1.castShadow = true;
    group.add(plate1);

    // Middle plate
    const plate2Geo = new THREE.CylinderGeometry(0.68, 0.68, 0.22, 32);
    const plate2 = new THREE.Mesh(plate2Geo, metalMat);
    plate2.rotation.z = Math.PI / 2;
    plate2.position.x = xPos + (xPos > 0 ? 0.2 : -0.2);
    group.add(plate2);

    // Inner collar
    const collarGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 24);
    const collar = new THREE.Mesh(collarGeo, accentMat);
    collar.rotation.z = Math.PI / 2;
    collar.position.x = xPos + (xPos > 0 ? 0.38 : -0.38);
    group.add(collar);

    // Plate cutout details (decorative cylinders)
    for (let a = 0; a < 5; a++) {
      const angle = (a / 5) * Math.PI * 2;
      const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12);
      const hole = new THREE.Mesh(holeGeo, accentMat);
      hole.rotation.z = Math.PI / 2;
      hole.position.set(
        xPos,
        Math.sin(angle) * 0.55,
        Math.cos(angle) * 0.55
      );
      group.add(hole);
    }
    dumbbell.add(group);
  }

  addPlateSet(-1.5);
  addPlateSet(1.5);

  // End caps
  [-1.7, 1.7].forEach(x => {
    const capGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.12, 16);
    const cap = new THREE.Mesh(capGeo, accentMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = x;
    dumbbell.add(cap);
  });

  dumbbell.rotation.x = 0.25;
  dumbbell.rotation.y = 0.4;
  scene.add(dumbbell);

  // ── Floating particles
  const particleGeo = new THREE.BufferGeometry();
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 16;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xe63b2e, size: 0.025,
    transparent: true, opacity: 0.5,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Mouse parallax
  let targetRY = 0, targetRX = 0;
  let currentRY = 0, currentRX = 0;
  document.addEventListener('mousemove', e => {
    targetRY = ((e.clientX / window.innerWidth) - 0.5) * 0.6;
    targetRX = ((e.clientY / window.innerHeight) - 0.5) * 0.3;
  });

  // ── Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Render loop
  let frame = 0;
  const heroEl = document.getElementById('hero');

  function animate() {
    requestAnimationFrame(animate);
    frame += 0.008;

    // Only animate when hero is roughly visible
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    if (heroBottom < -100) return;

    // Smooth mouse follow
    currentRY += (targetRY - currentRY) * 0.04;
    currentRX += (targetRX - currentRX) * 0.04;

    dumbbell.rotation.y = 0.4 + frame * 0.4 + currentRY;
    dumbbell.rotation.x = 0.25 + currentRX;

    // Red light pulse
    redLight.intensity = 6 + Math.sin(frame * 1.5) * 2;
    fillLight.position.x = Math.sin(frame * 0.5) * 4;

    particles.rotation.y = frame * 0.05;
    particles.rotation.x = frame * 0.02;

    renderer.render(scene, camera);
  }
  animate();
})();

// ─── HERO ENTRANCE ANIMATION ─────────────────────────────
(function initHeroAnim() {
  const tl = gsap.timeline({ delay: 0.2 });

  // Eyebrow
  tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })

  // Title lines
  .fromTo('.hero-title .line', {
    y: 80, opacity: 0, skewY: 4
  }, {
    y: 0, opacity: 1, skewY: 0,
    duration: 0.9, stagger: 0.12,
    ease: 'power4.out'
  }, '-=0.3')

  // Sub
  .to('#heroSub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')

  // Actions
  .to('#heroActions', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')

  // Scroll hint
  .to('#heroScroll', { opacity: 1, duration: 0.5 }, '-=0.2')

  // Stats bar
  .to('#heroStatsBar', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3');
})();

// ─── SCROLL REVEALS ──────────────────────────────────────
(function initScrollReveals() {
  // Generic reveal-up
  gsap.utils.toArray('.reveal-up').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.85,
      ease: 'power3.out', delay,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      }
    });
  });

  // Reveal left
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  // Reveal right
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });
})();

// ─── PARALLAX BAND ───────────────────────────────────────
(function initParallax() {
  const bg = document.getElementById('parallaxBg');
  if (!bg) return;
  gsap.to(bg, {
    y: 120,
    ease: 'none',
    scrollTrigger: {
      trigger: '.stats-band',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
})();

// ─── COUNTER ANIMATION ───────────────────────────────────
(function initCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const isLarge = target > 999;
    const displayFn = v => isLarge
      ? (v >= 1000 ? (v / 1000).toFixed(1) + 'K+' : v)
      : v + (target === 98 ? '' : '');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = displayFn(Math.round(this.targets()[0].val));
          },
          onComplete: () => {
            el.textContent = displayFn(target);
          }
        });
      }
    });
  });
})();

// ─── PROGRAM CARDS TILT ──────────────────────────────────
(function initTilt() {
  document.querySelectorAll('.program-card, .trainer-card, .pricing-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      gsap.to(card, {
        rotateY: dx * 6,
        rotateX: -dy * 6,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
        overwrite: true,
      });
    });
  });
})();

// ─── HORIZONTAL MARQUEE FOR STATS BAR ────────────────────
(function initHoverEffects() {
  // Nav link underline slide
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.fromTo(link, { color: '#888680' }, { color: '#f0ede8', duration: 0.25 });
    });
  });

  // Section tag hover
  document.querySelectorAll('.section-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      gsap.to(tag, { background: 'rgba(230,59,46,0.15)', duration: 0.3 });
    });
    tag.addEventListener('mouseleave', () => {
      gsap.to(tag, { background: 'transparent', duration: 0.3 });
    });
  });
})();

// ─── SMOOTH SCROLL ───────────────────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();

// ─── PRICING CARD HIGHLIGHT PULSE ────────────────────────
(function initPricingPulse() {
  const featured = document.querySelector('.pricing-featured');
  if (!featured) return;
  ScrollTrigger.create({
    trigger: featured,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo(featured,
        { boxShadow: '0 0 0 0 rgba(230,59,46,0)' },
        { boxShadow: '0 0 60px rgba(230,59,46,0.25), 0 0 0 1px rgba(230,59,46,0.3)', duration: 1.2, ease: 'power2.out' }
      );
    }
  });
})();

// ─── FOOTER REVEAL ───────────────────────────────────────
gsap.from('.footer-inner > *', {
  opacity: 0, y: 30, stagger: 0.15, duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true }
});
