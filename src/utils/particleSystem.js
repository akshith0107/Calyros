/**
 * Particle Grid System — GPU-accelerated particle physics
 * Creates a grid of tiny particles with magnetic cursor repulsion.
 */

const PARTICLE_SPACING = 24;
const PARTICLE_SIZE = 1.2;
const INTERACTION_RADIUS = 110;
const SPRING_STIFFNESS = 0.02;
const DAMPING = 0.90;
const MAX_DISPLACEMENT = 10;

export class Particle {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.opacity = 0.12 + Math.random() * 0.18;
  }

  update(mouseX, mouseY, hasInteraction) {
    if (hasInteraction) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distSq = dx * dx + dy * dy;
      const radius = INTERACTION_RADIUS;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const force = (radius - dist) / radius;
        const angle = Math.atan2(dy, dx);
        const pushX = Math.cos(angle) * force * 0.7;
        const pushY = Math.sin(angle) * force * 0.7;
        this.vx += pushX;
        this.vy += pushY;
      }
    }

    // Spring return
    const dx = this.originX - this.x;
    const dy = this.originY - this.y;
    this.vx += dx * SPRING_STIFFNESS;
    this.vy += dy * SPRING_STIFFNESS;

    // Damping
    this.vx *= DAMPING;
    this.vy *= DAMPING;

    // Clamp displacement
    this.x += this.vx;
    this.y += this.vy;

    const dispX = this.x - this.originX;
    const dispY = this.y - this.originY;
    if (Math.abs(dispX) > MAX_DISPLACEMENT) {
      this.x = this.originX + Math.sign(dispX) * MAX_DISPLACEMENT;
      this.vx *= 0.5;
    }
    if (Math.abs(dispY) > MAX_DISPLACEMENT) {
      this.y = this.originY + Math.sign(dispY) * MAX_DISPLACEMENT;
      this.vy *= 0.5;
    }
  }
}

export function createParticles(width, height) {
  const particles = [];
  const cols = Math.ceil(width / PARTICLE_SPACING) + 1;
  const rows = Math.ceil(height / PARTICLE_SPACING) + 1;
  const offsetX = (width - (cols - 1) * PARTICLE_SPACING) / 2;
  const offsetY = (height - (rows - 1) * PARTICLE_SPACING) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * PARTICLE_SPACING;
      const y = offsetY + row * PARTICLE_SPACING;
      particles.push(new Particle(x, y));
    }
  }

  return particles;
}

export function renderParticles(ctx, particles, mouseX, mouseY, hasInteraction, dpr) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Cursor glow
  if (hasInteraction && mouseX !== null && mouseY !== null) {
    const glowRadius = INTERACTION_RADIUS * 1.2;
    const gradient = ctx.createRadialGradient(
      mouseX * dpr, mouseY * dpr, 0,
      mouseX * dpr, mouseY * dpr, glowRadius * dpr
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.015)'); // slightly increased
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.008)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      (mouseX - glowRadius) * dpr,
      (mouseY - glowRadius) * dpr,
      glowRadius * 2 * dpr,
      glowRadius * 2 * dpr
    );
  }

  // Draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update(mouseX, mouseY, hasInteraction);

    ctx.beginPath();
    ctx.arc(p.x * dpr, p.y * dpr, PARTICLE_SIZE * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
    ctx.fill();
  }
}
