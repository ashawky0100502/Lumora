import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Full-screen animated starfield / nebula background, ported 1:1 from the
 * original Lumora vanilla-JS build (same layer counts, colors, drift speeds).
 *
 * Exposes a couple of imperative knobs via `controlsRef` (galaxyDark,
 * starsFrozen) so the future cinematic login sequence can dim/freeze the
 * scene exactly like the original did, without re-creating the WebGL scene.
 */
export default function GalaxyBackground({ controlsRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020103, 0.00045);

    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 620;

    function makeStars(count, spread, size, colorHex, opacity) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const twinkle = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
        twinkle[i] = Math.random() * Math.PI * 2;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: colorHex,
        size,
        transparent: true,
        opacity,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pts = new THREE.Points(geo, mat);
      pts.userData.twinkle = twinkle;
      scene.add(pts);
      return pts;
    }

    const starsFar = makeStars(3600, 3200, 1.4, 0xffffff, 0.55);
    const starsMid = makeStars(2200, 2200, 2.0, 0xdfe8ff, 0.75);
    const starsNear = makeStars(900, 1400, 2.8, 0xfff3d6, 0.9);
    const allStarLayers = [starsFar, starsMid, starsNear];

    function makeNebula(x, y, z, scale, colorHex, opacity) {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, colorHex + 'ff');
      grad.addColorStop(0.4, colorHex + '55');
      grad.addColorStop(1, colorHex + '00');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      // Sprites are always billboarded at roughly the same on-screen size,
      // so mipmaps buy nothing here — turning them off keeps this texture
      // on the plainest possible GPU upload path (no mip-chain generation),
      // which also rules it out as a source of the WebGL2 texImage3D
      // warning some browsers log for mipmapped texture uploads.
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale, 1);
      scene.add(sprite);
      return sprite;
    }

    const nebulae = [
      makeNebula(-500, 120, -900, 1400, '#5a2f8f', 0.35),
      makeNebula(600, -200, -1200, 1700, '#1c3a8f', 0.28),
      makeNebula(0, 350, -700, 1100, '#7a3fae', 0.22),
      makeNebula(-300, -350, -1100, 1300, '#22285f', 0.3),
    ];

    const dustGeo = new THREE.BufferGeometry();
    const dustCount = 500;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 1600;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 900 - 200;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xd4af37, size: 2.2, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const shootingStars = [];
    function spawnShootingStar() {
      const geo = new THREE.BufferGeometry();
      const startX = (Math.random() - 0.5) * 1400;
      const startY = 500 + Math.random() * 200;
      const startZ = (Math.random() - 0.5) * 600 - 200;
      const points = [];
      for (let i = 0; i < 2; i++) points.push(new THREE.Vector3(startX, startY, startZ));
      geo.setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      shootingStars.push({
        line,
        life: 0,
        maxLife: 1.1 + Math.random() * 0.5,
        vel: new THREE.Vector3(-(260 + Math.random() * 180), -(180 + Math.random() * 140), 0),
        start: new THREE.Vector3(startX, startY, startZ),
      });
    }
    const shootingInterval = setInterval(() => {
      if (Math.random() < 0.65) spawnShootingStar();
    }, 3200);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const timer = new THREE.Timer();
    let rafId;

    function animateGalaxy(timestamp) {
      rafId = requestAnimationFrame(animateGalaxy);
      timer.update(timestamp);
      const dt = timer.getDelta();
      const t = timer.getElapsed();

      const galaxyDark = controlsRef?.current?.galaxyDark ?? 0;
      const starsFrozen = controlsRef?.current?.starsFrozen ?? false;

      camera.position.x += (mouse.x * 40 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 30 - camera.position.y) * 0.02;
      camera.rotation.z = Math.sin(t * 0.02) * 0.01;
      camera.lookAt(0, 0, 0);

      if (!starsFrozen) {
        scene.rotation.y += dt * 0.006;
        allStarLayers.forEach((layer, li) => {
          const tw = layer.userData.twinkle;
          for (let i = 0; i < tw.length; i++) {
            tw[i] += dt * (1 + li * 0.4);
          }
          layer.material.opacity = (0.55 + li * 0.15) * (1 - galaxyDark * 0.9);
        });
        dust.rotation.y += dt * 0.003;
        dust.position.y = Math.sin(t * 0.15) * 8;
        nebulae.forEach((n, i) => {
          n.material.rotation += dt * 0.01 * (i % 2 === 0 ? 1 : -1);
        });
      }

      scene.fog.density = 0.00045 + galaxyDark * 0.0016;

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life += dt;
        const p = s.line.geometry.attributes.position;
        const head = s.start.clone().add(s.vel.clone().multiplyScalar(s.life));
        const tail = head.clone().add(s.vel.clone().normalize().multiplyScalar(-60));
        p.setXYZ(0, tail.x, tail.y, tail.z);
        p.setXYZ(1, head.x, head.y, head.z);
        p.needsUpdate = true;
        s.line.material.opacity = Math.max(0, 1 - s.life / s.maxLife);
        if (s.life > s.maxLife) {
          scene.remove(s.line);
          shootingStars.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }
    animateGalaxy();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(shootingInterval);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [controlsRef]);

  return (
    <canvas
      ref={canvasRef}
      id="galaxy-canvas"
      className="fixed inset-0 z-0 block h-full w-full"
    />
  );
}
