import './style.css'

// --- Fluid Nebula Background (Redesign 4.0) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let blobs = [];

// Configuration
const BLOB_COUNT = 6;
const COLORS = ['#ff2d55', '#00f2ea', '#7000ff', '#1a0b2e']; // Coral, Cyan, Purple, Dark

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initBlobs();
}

class Blob {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = 200 + Math.random() * 300;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.002 + Math.random() * 0.003;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.speed;

    // Bounce off edges (softly)
    if (this.x < -this.radius) this.vx = Math.abs(this.vx);
    if (this.x > width + this.radius) this.vx = -Math.abs(this.vx);
    if (this.y < -this.radius) this.vy = Math.abs(this.vy);
    if (this.y > height + this.radius) this.vy = -Math.abs(this.vy);

    // Mouse Interaction (Push)
    if (mouse.x != null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 300) {
        this.x += dx * 0.01;
        this.y += dy * 0.01;
      }
    }
  }

  draw() {
    // We'll draw these as large radial gradients
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(26, 11, 46, 0)'); // Fade to bg color

    ctx.globalCompositeOperation = 'screen'; // Blend mode for vibrant overlap
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; // Reset
  }
}

function initBlobs() {
  blobs = [];
  for (let i = 0; i < BLOB_COUNT; i++) {
    blobs.push(new Blob());
  }
}

function animateBlobs() {
  ctx.clearRect(0, 0, width, height);

  // Draw a base dark layer
  ctx.fillStyle = '#1a0b2e';
  ctx.fillRect(0, 0, width, height);

  blobs.forEach(blob => {
    blob.update();
    blob.draw();
  });

  requestAnimationFrame(animateBlobs);
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
animateBlobs();


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
