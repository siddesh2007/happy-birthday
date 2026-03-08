"use strict";

(function initBirthdayExperience() {
  const entryOverlay = document.getElementById("entry-overlay");
  const bgMusic = document.getElementById("bg-music");
  const musicTap = document.getElementById("music-tap");
  const openMessageBtn = document.getElementById("open-message");
  const surpriseBtn = document.getElementById("surprise-btn");
  const surpriseModal = document.getElementById("surprise-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const photoFrame = document.getElementById("photo-frame");
  const photoImg = document.getElementById("akka-photo");
  const sections = Array.from(document.querySelectorAll(".section"));
  const cards = Array.from(document.querySelectorAll(".reveal-card"));
  const grandSection = document.getElementById("grand");

  function tryPlayMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.34;

    const maybePromise = bgMusic.play();
    if (!maybePromise || typeof maybePromise.catch !== "function") return;

    maybePromise.catch(function () {
      if (musicTap) {
        musicTap.classList.remove("hidden");
      }
    });
  }

  function setupEntrySequence() {
    tryPlayMusic();

    window.setTimeout(function () {
      if (entryOverlay) {
        entryOverlay.classList.add("fade-out");
      }
    }, 3200);

    window.setTimeout(function () {
      if (entryOverlay) {
        entryOverlay.style.display = "none";
      }
    }, 4700);
  }

  function setupMusicGestureFallback() {
    if (!musicTap || !bgMusic) return;

    function resumeMusic() {
      bgMusic.play()
        .then(function () {
          musicTap.classList.add("hidden");
        })
        .catch(function () {
          // Keep button visible if playback still fails.
        });
    }

    musicTap.addEventListener("click", resumeMusic);

    document.addEventListener("pointerdown", function firstGestureResume() {
      if (bgMusic.paused) {
        resumeMusic();
      }
    }, { once: true });
  }

  function setupSmoothScrollActions() {
    if (!openMessageBtn) return;

    openMessageBtn.addEventListener("click", function () {
      const storySection = document.getElementById("story");
      if (storySection) {
        storySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function setupParallaxGlow() {
    let ticking = false;

    function applyParallax() {
      document.documentElement.style.setProperty("--scroll-parallax", String(window.scrollY) + "px");
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }, { passive: true });

    applyParallax();
  }

  function setupSectionReveal() {
    if (!("IntersectionObserver" in window)) {
      sections.forEach(function (section) {
        section.classList.add("in-view");
      });
      cards.forEach(function (card) {
        card.classList.add("is-visible");
      });
      return;
    }

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, {
      threshold: 0.22,
      rootMargin: "0px 0px -8% 0px"
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    cards.forEach(function (card, idx) {
      card.dataset.delayIndex = String(idx);
    });

    const cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const idx = Number(target.dataset.delayIndex || "0");

        window.setTimeout(function () {
          target.classList.add("is-visible");
        }, idx * 200);

        cardObserver.unobserve(target);
      });
    }, {
      threshold: 0.25,
      rootMargin: "0px 0px -10% 0px"
    });

    cards.forEach(function (card) {
      cardObserver.observe(card);
    });
  }

  function setupPhotoFrame() {
    if (!photoFrame || !photoImg) return;

    function showPhotoFallback() {
      photoFrame.classList.add("missing-photo");
    }

    function hidePhotoFallback() {
      photoFrame.classList.remove("missing-photo");
    }

    photoImg.addEventListener("error", showPhotoFallback);
    photoImg.addEventListener("load", hidePhotoFallback);

    if (photoImg.complete && photoImg.naturalWidth === 0) {
      showPhotoFallback();
    }

    const maxTilt = 10;

    photoFrame.addEventListener("mousemove", function (event) {
      const bounds = photoFrame.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      const rotateY = x * maxTilt;
      const rotateX = -y * maxTilt;

      photoFrame.style.transform = "rotateY(" + rotateY.toFixed(2) + "deg) rotateX(" + rotateX.toFixed(2) + "deg)";
    });

    photoFrame.addEventListener("mouseleave", function () {
      photoFrame.style.transform = "rotateY(0deg) rotateX(0deg)";
    });

    const miniHeartsContainer = photoFrame.querySelector(".mini-hearts");
    if (miniHeartsContainer) {
      for (let i = 0; i < 18; i += 1) {
        const heart = document.createElement("span");
        heart.className = "mini-heart";
        heart.innerHTML = "&#10084;";
        heart.style.left = String(4 + Math.random() * 92) + "%";
        heart.style.top = String(4 + Math.random() * 92) + "%";
        heart.style.setProperty("--drift", String(-18 + Math.random() * 36) + "px");
        heart.style.setProperty("--duration", String(2.6 + Math.random() * 2.8) + "s");
        heart.style.animationDelay = String(Math.random() * 3.5) + "s";
        miniHeartsContainer.appendChild(heart);
      }
    }
  }

  function setupBalloons() {
    const field = document.getElementById("balloon-field");
    if (!field) return;

    const shades = ["#ff94c6", "#f8d18f", "#cdb4ff", "#ffddec", "#fff3de"];

    for (let i = 0; i < 15; i += 1) {
      const balloon = document.createElement("div");
      balloon.className = "balloon";
      balloon.style.left = String(2 + Math.random() * 94) + "%";
      balloon.style.setProperty("--duration", String(16 + Math.random() * 13) + "s");
      balloon.style.setProperty("--delay", String(Math.random() * 12) + "s");
      balloon.style.setProperty("--balloon-color", shades[Math.floor(Math.random() * shades.length)]);
      field.appendChild(balloon);
    }
  }

  function setupSurpriseModal(fireworksEngine) {
    if (!surpriseBtn || !surpriseModal || !closeModalBtn) return;

    function openModal() {
      surpriseModal.classList.add("open");
      surpriseModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    function closeModal() {
      surpriseModal.classList.remove("open");
      surpriseModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    surpriseBtn.addEventListener("click", function () {
      for (let i = 0; i < 9; i += 1) {
        window.setTimeout(function () {
          fireworksEngine.burst(Math.random() * window.innerWidth, Math.random() * (window.innerHeight * 0.58), 85);
        }, i * 190);
      }

      runConfettiShower(2600);
      openModal();
    });

    closeModalBtn.addEventListener("click", closeModal);

    surpriseModal.addEventListener("click", function (event) {
      if (event.target === surpriseModal) {
        closeModal();
      }
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && surpriseModal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  function runConfettiShower(durationMs) {
    if (typeof window.confetti !== "function") return;

    const endTime = Date.now() + durationMs;
    const colors = ["#ff99c9", "#f7d590", "#ccb4ff", "#fff3e7"];

    (function frame() {
      const timeLeft = endTime - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = 16 + Math.floor((timeLeft / durationMs) * 24);

      window.confetti({
        particleCount: particleCount,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
        ticks: 120,
        gravity: 0.95,
        colors: colors,
        scalar: 0.95
      });

      window.confetti({
        particleCount: particleCount,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
        ticks: 120,
        gravity: 0.95,
        colors: colors,
        scalar: 0.95
      });

      window.requestAnimationFrame(frame);
    }());
  }

  function createFireworksEngine() {
    const canvas = document.getElementById("fireworks-canvas");
    if (!canvas) {
      return {
        burst: function () {},
        setAuto: function () {}
      };
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return {
        burst: function () {},
        setAuto: function () {}
      };
    }

    const particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let autoTimer = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = String(width) + "px";
      canvas.style.height = String(height) + "px";

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y, count) {
      const colors = ["#ff9eca", "#f6d18a", "#cab5ff", "#fff3e9"];
      const total = count || 70;

      for (let i = 0; i < total; i += 1) {
        const angle = (Math.PI * 2 * i) / total + Math.random() * 0.2;
        const speed = 1.7 + Math.random() * 4.2;

        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.01,
          radius: 1.3 + Math.random() * 2.8,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function tick() {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.99;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        context.beginPath();
        context.fillStyle = p.color;
        context.globalAlpha = p.life;
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      window.requestAnimationFrame(tick);
    }

    function setAuto(enable) {
      if (enable) {
        if (!autoTimer) {
          autoTimer = window.setInterval(function () {
            burst(
              Math.random() * width,
              Math.random() * (height * 0.48 + 60),
              76
            );
          }, 850);
        }
      } else if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    resize();
    tick();
    window.addEventListener("resize", resize);

    return { burst: burst, setAuto: setAuto };
  }

  function setupGrandCelebration(fireworksEngine) {
    if (!grandSection) return;

    let firstRevealDone = false;

    if (!("IntersectionObserver" in window)) {
      runConfettiShower(3200);
      fireworksEngine.setAuto(true);
      return;
    }

    const grandObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target !== grandSection) return;

        fireworksEngine.setAuto(entry.isIntersecting);

        if (entry.isIntersecting && !firstRevealDone) {
          firstRevealDone = true;
          runConfettiShower(4200);

          for (let i = 0; i < 7; i += 1) {
            window.setTimeout(function () {
              fireworksEngine.burst(
                Math.random() * window.innerWidth,
                Math.random() * (window.innerHeight * 0.5 + 30),
                90
              );
            }, i * 240);
          }
        }
      });
    }, { threshold: 0.36 });

    grandObserver.observe(grandSection);
  }

  function createHeartTextureCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const x = 64;
    const y = 60;
    const s = 24;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 186, 220, 0.96)";
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(255, 165, 212, 0.84)";

    ctx.beginPath();
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x - (2 * s), y - (0.1 * s), x - (1.8 * s), y - (2.1 * s), x, y - (0.86 * s));
    ctx.bezierCurveTo(x + (1.8 * s), y - (2.1 * s), x + (2 * s), y - (0.1 * s), x, y + s);
    ctx.fill();

    return canvas;
  }

  function initBackgroundScene() {
    if (typeof window.THREE === "undefined") return;

    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    const renderer = new window.THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.z = 18;

    const particleCount = 1400;
    const geometry = new window.THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [
      new window.THREE.Color("#ffadd8"),
      new window.THREE.Color("#f6d699"),
      new window.THREE.Color("#ccb8ff"),
      new window.THREE.Color("#fff8f0")
    ];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 44;
      positions[i3 + 1] = (Math.random() - 0.5) * 26;
      positions[i3 + 2] = (Math.random() - 0.5) * 35;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    geometry.setAttribute("position", new window.THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new window.THREE.BufferAttribute(colors, 3));

    const particles = new window.THREE.Points(
      geometry,
      new window.THREE.PointsMaterial({
        size: 0.11,
        transparent: true,
        opacity: 0.84,
        vertexColors: true,
        depthWrite: false,
        blending: window.THREE.AdditiveBlending
      })
    );

    scene.add(particles);

    const heartCanvas = createHeartTextureCanvas();
    const heartTexture = new window.THREE.CanvasTexture(heartCanvas);
    heartTexture.needsUpdate = true;

    const hearts = [];

    for (let i = 0; i < 36; i += 1) {
      const spriteMaterial = new window.THREE.SpriteMaterial({
        map: heartTexture,
        transparent: true,
        opacity: 0.52,
        depthWrite: false
      });

      const heart = new window.THREE.Sprite(spriteMaterial);
      heart.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 22
      );

      const size = 0.52 + Math.random() * 0.8;
      heart.scale.set(size, size, size);
      heart.userData = {
        speedY: 0.004 + Math.random() * 0.01,
        drift: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2
      };

      hearts.push(heart);
      scene.add(heart);
    }

    const pointer = { x: 0, y: 0 };

    window.addEventListener("pointermove", function (event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function onResize() {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    const clock = new window.THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();

      particles.rotation.y = t * 0.03;
      particles.rotation.x = Math.sin(t * 0.18) * 0.14;

      hearts.forEach(function (heart, idx) {
        heart.position.y += heart.userData.speedY;
        heart.position.x += Math.sin(t * 0.7 + heart.userData.phase) * heart.userData.drift;

        if (heart.position.y > 11) {
          heart.position.y = -11;
        }

        heart.material.opacity = 0.38 + 0.23 * (0.5 + 0.5 * Math.sin(t * 2 + idx));
      });

      camera.position.x += ((pointer.x * 1.35) - camera.position.x) * 0.02;
      camera.position.y += ((-pointer.y * 0.82) - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }

    window.addEventListener("resize", onResize);
    animate();
  }

  function initCakeScene() {
    if (typeof window.THREE === "undefined") return;

    const canvas = document.getElementById("cake-canvas");
    if (!canvas) return;

    const renderer = new window.THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2.6, 8.4);

    const ambient = new window.THREE.AmbientLight("#fff7ea", 0.9);
    const keyLight = new window.THREE.PointLight("#ffd39d", 2.2, 24, 2);
    keyLight.position.set(4, 6, 6);
    const fillLight = new window.THREE.PointLight("#ceb6ff", 1.5, 20, 2);
    fillLight.position.set(-4, 4, 6);
    const rimLight = new window.THREE.PointLight("#ff9bc5", 1.2, 18, 2);
    rimLight.position.set(0, 3, -7);

    scene.add(ambient, keyLight, fillLight, rimLight);

    const cakeGroup = new window.THREE.Group();

    const baseMaterial = new window.THREE.MeshStandardMaterial({
      color: "#fff3f9",
      roughness: 0.56,
      metalness: 0.03
    });

    const frostingMaterial = new window.THREE.MeshStandardMaterial({
      color: "#ffd9ec",
      roughness: 0.46,
      metalness: 0.05
    });

    const icingMaterial = new window.THREE.MeshStandardMaterial({
      color: "#efc9ff",
      roughness: 0.38,
      metalness: 0.1,
      emissive: "#7f3f91",
      emissiveIntensity: 0.07
    });

    const plate = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(3.2, 3.3, 0.2, 64),
      new window.THREE.MeshStandardMaterial({
        color: "#f7e7ff",
        roughness: 0.22,
        metalness: 0.34
      })
    );
    plate.position.y = -1;

    const tierOne = new window.THREE.Mesh(new window.THREE.CylinderGeometry(2.55, 2.72, 1.25, 64), baseMaterial);
    tierOne.position.y = -0.35;

    const tierTwo = new window.THREE.Mesh(new window.THREE.CylinderGeometry(1.9, 2.05, 1.04, 64), frostingMaterial);
    tierTwo.position.y = 0.89;

    const tierThree = new window.THREE.Mesh(new window.THREE.CylinderGeometry(1.34, 1.45, 0.86, 64), baseMaterial);
    tierThree.position.y = 1.82;

    const ringOne = new window.THREE.Mesh(new window.THREE.TorusGeometry(2.26, 0.11, 14, 68), icingMaterial);
    ringOne.position.y = 0.26;
    ringOne.rotation.x = Math.PI / 2;

    const ringTwo = new window.THREE.Mesh(new window.THREE.TorusGeometry(1.73, 0.08, 14, 68), icingMaterial);
    ringTwo.position.y = 1.35;
    ringTwo.rotation.x = Math.PI / 2;

    const ringThree = new window.THREE.Mesh(new window.THREE.TorusGeometry(1.19, 0.06, 14, 68), icingMaterial);
    ringThree.position.y = 2.21;
    ringThree.rotation.x = Math.PI / 2;

    cakeGroup.add(plate, tierOne, tierTwo, tierThree, ringOne, ringTwo, ringThree);

    const candleMaterial = new window.THREE.MeshStandardMaterial({
      color: "#fff4cf",
      roughness: 0.26,
      metalness: 0.12
    });

    const flameMaterial = new window.THREE.MeshStandardMaterial({
      color: "#ffd692",
      roughness: 0.14,
      emissive: "#ff9a2a",
      emissiveIntensity: 2.4
    });

    const flames = [];

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const radius = 0.86;

      const candle = new window.THREE.Mesh(new window.THREE.CylinderGeometry(0.065, 0.065, 0.56, 18), candleMaterial);
      candle.position.set(Math.cos(angle) * radius, 2.5, Math.sin(angle) * radius);

      const flame = new window.THREE.Mesh(new window.THREE.SphereGeometry(0.1, 16, 12), flameMaterial.clone());
      flame.position.set(Math.cos(angle) * radius, 2.88, Math.sin(angle) * radius);

      const glow = new window.THREE.PointLight("#ffc97a", 1.7, 4, 2);
      glow.position.copy(flame.position);

      cakeGroup.add(candle, flame, glow);
      flames.push({ flame: flame, glow: glow, phase: Math.random() * Math.PI * 2 });
    }

    scene.add(cakeGroup);

    function resizeCakeRenderer() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resizeCakeRenderer);
    resizeCakeRenderer();

    const clock = new window.THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();

      cakeGroup.rotation.y = t * 0.44;
      cakeGroup.rotation.x = Math.sin(t * 0.45) * 0.05;
      cakeGroup.position.y = Math.sin(t * 1.2) * 0.08;

      flames.forEach(function (item, idx) {
        const flicker = 0.84 + Math.sin((t * 6) + item.phase) * 0.13 + Math.sin((t * 11) + idx) * 0.05;
        item.flame.scale.setScalar(flicker);
        item.glow.intensity = 1.2 + flicker * 0.9;
      });

      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    }

    animate();
  }

  setupEntrySequence();
  setupMusicGestureFallback();
  setupSmoothScrollActions();
  setupParallaxGlow();
  setupSectionReveal();
  setupPhotoFrame();
  setupBalloons();

  const fireworksEngine = createFireworksEngine();
  setupGrandCelebration(fireworksEngine);
  setupSurpriseModal(fireworksEngine);

  initBackgroundScene();
  initCakeScene();
}());
