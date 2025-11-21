import './style.css'

// --- Synapse Bridge Background (Redesign 3.0) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let nodes = [];

// Configuration
const PARTICLE_COUNT = 80;
const NODE_COUNT = 15;
const CONNECTION_DIST = 150;
const MOUSE_DIST = 250;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initNetwork();
}

class Entity {
  constructor(x, y, isNode = false) {
    this.x = x;
    this.y = y;
    this.isNode = isNode;
    // Nodes are stable, Particles float
    this.vx = isNode ? 0 : (Math.random() - 0.5) * 0.5;
    this.vy = isNode ? 0 : (Math.random() - 0.5) * 0.5;
    this.size = isNode ? 3 + Math.random() * 2 : 1.5;
    this.color = isNode ? 'rgba(56, 189, 248, 0.8)' : 'rgba(148, 163, 184, 0.5)'; // Azure vs Slate
  }

  update() {
    if (!this.isNode) {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse Interaction (Magnet)
      if (mouse.x != null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_DIST) {
          // Gentle pull towards mouse
          this.x += dx * 0.02;
          this.y += dy * 0.02;
        }
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function initNetwork() {
  particles = [];
  nodes = [];

  // Create Stable Nodes (The "Professionals")
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push(new Entity(
      Math.random() * width,
      Math.random() * height,
      true
    ));
  }

  // Create Floating Particles (The "Students")
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Entity(
      Math.random() * width,
      Math.random() * height,
      false
    ));
  }
}

function animateNetwork() {
  ctx.clearRect(0, 0, width, height);

  const allEntities = [...nodes, ...particles];

  // Update & Draw Entities
  allEntities.forEach(e => {
    e.update();
    e.draw();
  });

  // Draw Connections (The "Bridges")
  for (let i = 0; i < allEntities.length; i++) {
    for (let j = i + 1; j < allEntities.length; j++) {
      const e1 = allEntities[i];
      const e2 = allEntities[j];

      const dx = e1.x - e2.x;
      const dy = e1.y - e2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        // Opacity based on distance
        const alpha = 1 - (dist / CONNECTION_DIST);

        // Color logic: Node-Node connections are stronger
        if (e1.isNode && e2.isNode) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.8})`; // Azure
          ctx.lineWidth = 1;
        } else if (e1.isNode || e2.isNode) {
          ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 0.5})`; // Indigo mix
          ctx.lineWidth = 0.8;
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.3})`; // Slate
          ctx.lineWidth = 0.5;
        }

        ctx.moveTo(e1.x, e1.y);
        ctx.lineTo(e2.x, e2.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateNetwork);
}

// Interactions
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('resize', () => {
  resize();
});

// Init
resize();
animateNetwork();


// --- Countdown Timer (Preserved) ---
// Set event date to Dec 15, 2025
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
updateTimer(); // Initial call

// --- Smooth Scroll (Preserved) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// --- Scroll Reveal Animations (Preserved) ---
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
  observer.observe(el);
});
