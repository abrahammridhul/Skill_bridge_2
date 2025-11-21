import './style.css'

// --- Advanced Circuit Board Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
let traces = [];
let pulses = [];
let ripples = [];

// Configuration
const GRID_SIZE = 40;
const NODE_RADIUS = 4;
const TRACE_COLOR = 'rgba(0, 243, 255, 0.15)'; // Faint cyan
const ACTIVE_TRACE_COLOR = 'rgba(0, 243, 255, 0.8)'; // Bright cyan
const COMPONENT_COLOR = '#0a0e17'; // Dark background for chips
const TEXT_COLOR = 'rgba(0, 243, 255, 0.7)';

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initCircuit();
}

class Node {
  constructor(x, y, label, type = 'point') {
    this.x = x;
    this.y = y;
    this.label = label;
    this.type = type; // 'point', 'chip', 'resistor'
    this.connections = [];
  }

  draw() {
    if (this.type === 'chip') {
      ctx.fillStyle = COMPONENT_COLOR;
      ctx.strokeStyle = ACTIVE_TRACE_COLOR;
      ctx.lineWidth = 1;
      ctx.fillRect(this.x - 15, this.y - 10, 30, 20);
      ctx.strokeRect(this.x - 15, this.y - 10, 30, 20);

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '10px monospace';
      ctx.fillText(this.label, this.x - 10, this.y + 4);
    } else if (this.type === 'resistor') {
      ctx.beginPath();
      ctx.moveTo(this.x - 10, this.y);
      ctx.lineTo(this.x - 5, this.y - 5);
      ctx.lineTo(this.x + 5, this.y + 5);
      ctx.lineTo(this.x + 10, this.y);
      ctx.strokeStyle = ACTIVE_TRACE_COLOR;
      ctx.stroke();

      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '10px monospace';
      ctx.fillText(this.label, this.x - 8, this.y - 8);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = ACTIVE_TRACE_COLOR;
      ctx.fill();
    }
  }
}

class Trace {
  constructor(startNode, endNode) {
    this.start = startNode;
    this.end = endNode;
    this.path = this.calculatePath();
    this.length = this.calculateLength();
  }

  calculatePath() {
    // Simple orthogonal routing
    const path = [];
    path.push({ x: this.start.x, y: this.start.y });

    // Randomly choose to go X first or Y first for variety
    if (Math.random() > 0.5) {
      path.push({ x: this.end.x, y: this.start.y });
    } else {
      path.push({ x: this.start.x, y: this.end.y });
    }

    path.push({ x: this.end.x, y: this.end.y });
    return path;
  }

  calculateLength() {
    let len = 0;
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];
      len += Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    }
    return len;
  }

  draw(glow = false) {
    ctx.beginPath();
    ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      ctx.lineTo(this.path[i].x, this.path[i].y);
    }

    ctx.strokeStyle = glow ? ACTIVE_TRACE_COLOR : TRACE_COLOR;
    ctx.lineWidth = glow ? 2 : 1;
    if (glow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = ACTIVE_TRACE_COLOR;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  }
}

class Pulse {
  constructor(trace) {
    this.trace = trace;
    this.progress = 0;
    this.speed = 2 + Math.random() * 2;
    this.active = true;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= this.trace.length) {
      this.active = false;
    }
  }

  draw() {
    // Calculate current position based on progress
    let currentDist = 0;
    let pos = { x: 0, y: 0 };

    for (let i = 0; i < this.trace.path.length - 1; i++) {
      const p1 = this.trace.path[i];
      const p2 = this.trace.path[i + 1];
      const segLen = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

      if (this.progress >= currentDist && this.progress <= currentDist + segLen) {
        const t = (this.progress - currentDist) / segLen;
        pos.x = p1.x + (p2.x - p1.x) * t;
        pos.y = p1.y + (p2.y - p1.y) * t;
        break;
      }
      currentDist += segLen;
    }

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initCircuit() {
  nodes = [];
  traces = [];
  pulses = [];

  // Create "Bridge" shape nodes
  const bridgeCenterY = height * 0.6;
  const bridgeCurve = height * 0.2;

  // Left side
  nodes.push(new Node(width * 0.1, bridgeCenterY, 'IN', 'point'));
  nodes.push(new Node(width * 0.2, bridgeCenterY - bridgeCurve * 0.5, 'R1', 'resistor'));
  nodes.push(new Node(width * 0.3, bridgeCenterY - bridgeCurve, 'U1', 'chip')); // Core Workshop

  // Center
  nodes.push(new Node(width * 0.5, bridgeCenterY - bridgeCurve * 1.2, 'Q1', 'chip')); // AI & ML

  // Right side
  nodes.push(new Node(width * 0.7, bridgeCenterY - bridgeCurve, 'U2', 'chip')); // Mentorship
  nodes.push(new Node(width * 0.8, bridgeCenterY - bridgeCurve * 0.5, 'C1', 'resistor')); // Communication
  nodes.push(new Node(width * 0.9, bridgeCenterY, 'OUT', 'point'));

  // Random background nodes for complexity
  for (let i = 0; i < 15; i++) {
    nodes.push(new Node(
      Math.random() * width,
      Math.random() * height,
      `N${i}`,
      Math.random() > 0.8 ? 'chip' : 'point'
    ));
  }

  // Create connections (Traces)
  // Connect bridge nodes sequentially
  for (let i = 0; i < 6; i++) {
    traces.push(new Trace(nodes[i], nodes[i + 1]));
  }

  // Connect random nodes to nearest neighbors
  nodes.forEach(node => {
    // Find 2 nearest neighbors
    const neighbors = nodes
      .filter(n => n !== node)
      .sort((a, b) => {
        const d1 = Math.hypot(a.x - node.x, a.y - node.y);
        const d2 = Math.hypot(b.x - node.x, b.y - node.y);
        return d1 - d2;
      })
      .slice(0, 2);

    neighbors.forEach(neighbor => {
      // Avoid duplicate traces
      if (!traces.some(t => (t.start === node && t.end === neighbor) || (t.start === neighbor && t.end === node))) {
        traces.push(new Trace(node, neighbor));
      }
    });
  });
}

function animateCircuit() {
  ctx.clearRect(0, 0, width, height);

  // Draw Traces
  traces.forEach(trace => {
    // Check mouse proximity for glow
    let glow = false;
    if (mouse.x) {
      // Simple check: is mouse near start or end node?
      const d1 = Math.hypot(trace.start.x - mouse.x, trace.start.y - mouse.y);
      const d2 = Math.hypot(trace.end.x - mouse.x, trace.end.y - mouse.y);
      if (d1 < 150 || d2 < 150) glow = true;
    }
    trace.draw(glow);
  });

  // Draw Nodes
  nodes.forEach(node => node.draw());

  // Manage Pulses
  if (Math.random() < 0.05) { // Spawn new pulse chance
    const randomTrace = traces[Math.floor(Math.random() * traces.length)];
    pulses.push(new Pulse(randomTrace));
  }

  pulses.forEach((pulse, index) => {
    pulse.update();
    pulse.draw();
    if (!pulse.active) pulses.splice(index, 1);
  });

  // Manage Ripples (Click effect)
  ripples.forEach((ripple, index) => {
    ripple.radius += 5;
    ripple.alpha -= 0.02;

    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 243, 255, ${ripple.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (ripple.alpha <= 0) ripples.splice(index, 1);
  });

  requestAnimationFrame(animateCircuit);
}

// Interactions
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('click', (e) => {
  ripples.push({
    x: e.x,
    y: e.y,
    radius: 0,
    alpha: 1
  });
});

window.addEventListener('resize', () => {
  resize();
});

// Init
resize();
animateCircuit();


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
