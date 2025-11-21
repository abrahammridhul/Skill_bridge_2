import './style.css'

// --- Silk Ribbon Bridge Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let ribbons = [];
let time = 0;
let pulseActive = false;
let pulseProgress = 0;

// Configuration
const RIBBON_COUNT = 15;
const BASE_Y = 0.6; // Vertical position (0.0 - 1.0)
const BRIDGE_HEIGHT = 0.25; // How high the bridge arches
const SPEED = 0.005;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initRibbons();
}

class Ribbon {
  constructor(index) {
    this.index = index;
    this.offset = Math.random() * Math.PI * 2;
    this.speed = SPEED + Math.random() * 0.002;
    this.amplitude = 20 + Math.random() * 30;
    this.frequency = 0.002 + Math.random() * 0.003;
    this.color = index % 2 === 0 ? '#00f3ff' : '#9d00ff'; // Cyan or Purple
    this.thickness = 1 + Math.random() * 2;
  }

  draw(t) {
    ctx.beginPath();

    // Start from left
    for (let x = 0; x <= width; x += 5) {
      // Normalized X (0.0 to 1.0)
      const nx = x / width;

      // Bridge Arch Calculation (Parabola-ish)
      // Peak at center (nx = 0.5), zero at edges
      const bridgeArch = Math.sin(nx * Math.PI) * height * BRIDGE_HEIGHT;

      // Base Sine Wave Flow
      const wave = Math.sin(x * this.frequency + t * this.speed + this.offset) * this.amplitude;

      // Turbulence from Mouse
      let turbulence = 0;
      if (mouse.x != null) {
        const dx = x - mouse.x;
        // Y distance is approximate since we haven't calculated y yet, 
        // but we can use the base y position
        const dy = (height * BASE_Y - bridgeArch) - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          turbulence = Math.sin(dx * 0.05 + t * 0.1) * (200 - dist) * 0.2;
        }
      }

      // Final Y Position
      // Base Position - Bridge Arch + Wave + Turbulence
      const y = (height * BASE_Y) - bridgeArch + wave + turbulence;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Pulse Effect (Click)
    let lineWidth = this.thickness;
    let alpha = 0.3; // Base opacity

    if (pulseActive) {
      // Pulse travels across the screen
      // pulseProgress goes from 0 to width + padding
      // We check if current ribbon part is near the pulse wave
      // This is a simplification; for a true wave traveling along the line we'd need per-segment logic
      // Instead, let's make the whole ribbon glow when the pulse passes "through" the ribbon index

      // Alternative: Pulse travels horizontally
      // We can't easily change line width per segment in one path.
      // So we'll just brighten the whole ribbon based on time, or use a global glow

      // Let's make the pulse a global brightness boost that fades out
      const pulseStrength = Math.max(0, 1 - Math.abs(pulseProgress - 0.5) * 2); // 0 -> 1 -> 0
      alpha += pulseStrength * 0.6;
      lineWidth += pulseStrength * 2;
    }

    ctx.strokeStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;

    // Add glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    ctx.stroke();

    // Reset
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function initRibbons() {
  ribbons = [];
  for (let i = 0; i < RIBBON_COUNT; i++) {
    ribbons.push(new Ribbon(i));
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Update Time
  time += 1;

  // Update Pulse
  if (pulseActive) {
    pulseProgress += 0.01;
    if (pulseProgress > 1) {
      pulseActive = false;
      pulseProgress = 0;
    }
  }

  // Draw Ribbons
  ribbons.forEach(ribbon => ribbon.draw(time));

  requestAnimationFrame(animate);
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

window.addEventListener('click', () => {
  pulseActive = true;
  pulseProgress = 0;
});

window.addEventListener('resize', () => {
  resize();
});

// Init
resize();
animate();


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
