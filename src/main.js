import './style.css'

// ============================================
// INTERACTIVE PARTICLE BACKGROUND
// ============================================
const canvas = document.getElementById('interactive-bg');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
let mouse = { x: null, y: null, radius: 150 };
let animationId;

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  draw() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }

  update() {
    // Mouse interaction
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }

    // Gentle drift
    this.x += this.vx;
    this.y += this.vy;

    // Boundary check
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
}

function initParticles() {
  if (!canvas || !ctx) return;

  particles = [];
  const numberOfParticles = Math.floor((canvas.width * canvas.height) / 9000);

  for (let i = 0; i < numberOfParticles; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
}

function connectParticles() {
  if (!ctx) return;

  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        let opacity = 1 - (distance / 100);
        ctx.strokeStyle = `rgba(167, 139, 250, ${opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0C0B2E');
  gradient.addColorStop(0.5, '#1a0b2e');
  gradient.addColorStop(1, '#0C0B2E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  connectParticles();
  animationId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
}

if (canvas) {
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  animate();
  console.log('🎨 Interactive background initialized!');
}

// ============================================
// COUNTDOWN TIMER
// ============================================
const eventDate = new Date('2025-12-15T09:00:00');

function updateTimer() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance < 0) {
    document.getElementById("countdown-container").innerHTML = "EVENT STARTED";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = String(days).padStart(2, '0');
  document.getElementById("hours").innerText = String(hours).padStart(2, '0');
  document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
  document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
}

setInterval(updateTimer, 1000);
updateTimer();

// --- Smooth Scroll & Reveal (Preserved) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// ============================================
// MATTER.JS PHYSICS BALLS IN FOOTER
// ============================================
function initPhysicsBalls() {
  if (window.physicsInitialized) return;
  window.physicsInitialized = true;

  const physicsCanvas = document.getElementById('physics-canvas');
  if (!physicsCanvas || typeof Matter === 'undefined') {
    console.log('⚠️ Physics canvas or Matter.js not available');
    return;
  }

  const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

  const engine = Engine.create({
    gravity: { x: 0, y: 1 }
  });
  const world = engine.world;

  const contactSection = physicsCanvas.parentElement;
  // Use the section's dimensions, not the window's
  const width = contactSection.clientWidth;
  const height = contactSection.clientHeight;

  console.log(`📏 Physics Canvas Size: ${width}x${height}`);

  if (width === 0 || height === 0) {
    console.warn('⚠️ Contact section has 0 dimensions! Retrying in 500ms...');
    setTimeout(initPhysicsBalls, 500);
    return;
  }

  // Set canvas size explicitly to match container
  physicsCanvas.width = width;
  physicsCanvas.height = height;

  const render = Render.create({
    canvas: physicsCanvas,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent'
    }
  });

  // Create walls
  const wallThickness = 50;
  const walls = [
    Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true, render: { visible: false } }), // Bottom
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, render: { visible: false } }), // Left
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true, render: { visible: false } }) // Right
  ];

  World.add(world, walls);

  // Create balls
  const balls = [];
  const ballColor = '#a78bfa';
  const numberOfBalls = 40;

  for (let i = 0; i < numberOfBalls; i++) {
    const radius = Math.random() * 20 + 15;
    const x = Math.random() * (width - 100) + 50;
    const y = Math.random() * -1000 - 200; // Start higher

    balls.push(Bodies.circle(x, y, radius, {
      restitution: 0.95, // Super bouncy
      friction: 0.001,
      frictionAir: 0.005,
      density: 0.002,
      render: {
        fillStyle: ballColor,
        strokeStyle: 'rgba(255, 255, 255, 0.5)',
        lineWidth: 2
      }
    }));
  }

  World.add(world, balls);

  // Add mouse control
  const mouse = Mouse.create(physicsCanvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

  render.mouse = mouse;
  World.add(world, mouseConstraint);

  // Run the engine and renderer
  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // Keep balls alive (gentle float/turbulence)
  setInterval(() => {
    balls.forEach(ball => {
      if (ball.position.y > height - 100) {
        // If at bottom, give a small kick up sometimes
        if (Math.random() > 0.9) {
          Matter.Body.applyForce(ball, ball.position, { x: (Math.random() - 0.5) * 0.05, y: -0.05 });
        }
      }
    });
  }, 1000);

  // Handle resize
  window.addEventListener('resize', () => {
    const newWidth = contactSection.clientWidth;
    const newHeight = contactSection.clientHeight;

    physicsCanvas.width = newWidth;
    physicsCanvas.height = newHeight;
    render.canvas.width = newWidth;
    render.canvas.height = newHeight;
  });

  console.log('⚽ Physics balls initialized!');
}

// ============================================
// WAIT FOR DOM AND LIBRARIES TO LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(initAnimations, 100);
});

function initAnimations() {
  console.log('🎬 Initializing animations...');
  console.log('✅ GSAP available:', typeof gsap !== 'undefined');

  // ============================================
  // GSAP ANIMATIONS
  // ============================================
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    console.log('✅ GSAP ScrollTrigger registered');

    // Configure ScrollTrigger to use the custom scroll container
    ScrollTrigger.defaults({
      scroller: ".slides-container"
    });

    // ============================================
    // 1) HOVER SCRAMBLE TEXT ANIMATION
    // ============================================
    const isDesktop = window.innerWidth > 991;

    if (isDesktop) {
      document.querySelectorAll('.scramble-hover').forEach(el => {
        const originalText = el.textContent;

        el.addEventListener('mouseenter', () => {
          scrambleText(el, originalText, 600);
        });
      });
      console.log('✅ Scramble hover on', document.querySelectorAll('.scramble-hover').length, 'elements');
    }

    // ============================================
    // 2) SCROLL-TRIGGERED TEXT REVEAL
    // ============================================
    document.querySelectorAll('.scramble-title').forEach(el => {
      const originalText = el.textContent;

      // Initially hide
      gsap.set(el, { opacity: 0, y: 20 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          // Fade in with slide up
          gsap.to(el, {
            duration: 0.6,
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            onComplete: () => {
              scrambleText(el, originalText, 800);
            }
          });
        }
      });
    });
    console.log('✅ Scramble title on', document.querySelectorAll('.scramble-title').length, 'elements');

    // ============================================
    // 3) FADE-IN ANIMATIONS FOR CARDS
    // ============================================
    document.querySelectorAll('.feature-card, .card, .speaker-card').forEach((el, index) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        duration: 0.8,
        opacity: 0,
        y: 30,
        delay: index * 0.1,
        ease: 'power2.out'
      });
    });
    console.log('✅ Card animations initialized');

    // ============================================
    // 4) GENERIC SCROLL REVEAL (Replaces old logic)
    // ============================================
    gsap.utils.toArray('.scroll-reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // ============================================
    // 5) PHYSICS BALLS TRIGGER
    // ============================================
    ScrollTrigger.create({
      trigger: "#contact",
      start: "top 80%",
      onEnter: () => {
        console.log("Triggering physics balls init");
        initPhysicsBalls();
      },
      once: true
    });

    // Fallback: Force init if not triggered (e.g. short screen or scroll issue)
    setTimeout(() => {
      if (!window.physicsInitialized) {
        console.log("⚠️ Fallback triggering physics balls");
        initPhysicsBalls();
      }
    }, 2000);

    console.log('🎉 All animations ready!');
  } else {
    console.error('❌ GSAP not loaded!');
  }
}


