import './style.css'

// --- Interactive Galaxy Background (Redesign 5.0) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let planets = [];
let meteors = [];

// Configuration
const STAR_COUNT = 200;
const PLANET_COUNT = 8;
const COLORS = ['#FF1ED1', '#2A135A', '#00f3ff', '#ffffff']; // Pink, Purple, Cyan, White

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initGalaxy();
}

class Star {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2;
    this.alpha = Math.random();
    this.blinkSpeed = 0.005 + Math.random() * 0.01;
  }

  update() {
    this.alpha += this.blinkSpeed;
    if (this.alpha > 1 || this.alpha < 0) this.blinkSpeed *= -1;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.alpha)})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Planet {
  constructor() {
    this.radius = 15 + Math.random() * 30;
    this.x = Math.random() * (width - this.radius * 2) + this.radius;
    this.y = Math.random() * (height - this.radius * 2) + this.radius;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.mass = this.radius;
    this.color = COLORS[Math.floor(Math.random() * (COLORS.length - 1))]; // Exclude white
    this.glow = 10 + Math.random() * 20;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Wall Collisions
    if (this.x - this.radius < 0 || this.x + this.radius > width) this.vx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > height) this.vy *= -1;

    // Mouse Interaction (Repulsion)
    if (mouse.x != null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }
    }
  }

  draw() {
    ctx.shadowBlur = this.glow;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset
  }
}

class Meteor {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = -100;
    this.length = 50 + Math.random() * 100;
    this.speed = 10 + Math.random() * 10;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // Mostly diagonal down-right
    this.active = false;
    this.timer = Math.random() * 200; // Random delay
  }

  update() {
    if (this.timer > 0) {
      this.timer--;
      return;
    }

    this.active = true;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (this.y > height + 100 || this.x > width + 100) {
      this.reset();
    }
  }

  draw() {
    if (!this.active) return;

    const gradient = ctx.createLinearGradient(this.x, this.y, this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
    gradient.addColorStop(0, '#FF1ED1'); // Neon Pink Head
    gradient.addColorStop(1, 'rgba(255, 30, 209, 0)'); // Transparent Tail

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
    ctx.stroke();
  }
}

// Collision Detection (Elastic)
function resolveCollisions() {
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < p1.radius + p2.radius) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = p1.vx * cos + p1.vy * sin;
        const vy1 = p1.vy * cos - p1.vx * sin;
        const vx2 = p2.vx * cos + p2.vy * sin;
        const vy2 = p2.vy * cos - p2.vx * sin;

        // Elastic collision formula
        const vx1Final = ((p1.mass - p2.mass) * vx1 + 2 * p2.mass * vx2) / (p1.mass + p2.mass);
        const vx2Final = ((p2.mass - p1.mass) * vx2 + 2 * p1.mass * vx1) / (p1.mass + p2.mass);

        // Update velocities (rotate back)
        p1.vx = vx1Final * cos - vy1 * sin;
        p1.vy = vy1 * cos + vx1Final * sin;
        p2.vx = vx2Final * cos - vy2 * sin;
        p2.vy = vy2 * cos + vx2Final * sin;

        // Separate planets to prevent sticking
        const overlap = (p1.radius + p2.radius - dist) / 2;
        p1.x -= overlap * cos;
        p1.y -= overlap * sin;
        p2.x += overlap * cos;
        p2.y += overlap * sin;
      }
    }
  }
}

function initGalaxy() {
  stars = [];
  planets = [];
  meteors = [];

  for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
  for (let i = 0; i < PLANET_COUNT; i++) planets.push(new Planet());
  for (let i = 0; i < 3; i++) meteors.push(new Meteor()); // 3 active meteors max
}

function animateGalaxy() {
  // Draw Background
  ctx.fillStyle = '#0C0B2E';
  ctx.fillRect(0, 0, width, height);

  // Draw Stars
  stars.forEach(star => {
    star.update();
    star.draw();
  });

  // Update & Draw Meteors
  meteors.forEach(meteor => {
    meteor.update();
    meteor.draw();
  });

  // Update & Draw Planets
  planets.forEach(planet => {
    planet.update();
    planet.draw();
  });

  resolveCollisions();

  requestAnimationFrame(animateGalaxy);
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
animateGalaxy();


// --- Countdown Timer (Preserved) ---
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

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
  observer.observe(el);
});
