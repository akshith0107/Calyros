import { useEffect, useRef, useState } from 'react';

const NUTRITION_LABELS = [
  'Protein', 'Fiber', 'Omega-3', 'Iron',
  'Calcium', 'Magnesium', 'Vitamin B12'
];

export default function DNAParticleSystem({ className = '' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isVisible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let nodes = [];
    let ambientParticles = [];
    let animationFrameId;
    let rotationAngle = 0;
    
    // Config
    const isMobile = window.innerWidth < 768;
    const BASE_PAIRS = isMobile ? 40 : 80;
    const AMBIENT_COUNT = isMobile ? 100 : 200;
    const ROTATION_SPEED = 0.003;
    const HELIX_RADIUS = isMobile ? 100 : 180;
    const HELIX_HEIGHT = isMobile ? 800 : 1400;
    
    // Mouse state
    let mouse = { x: -1000, y: -1000 };
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      isHovering = true;
    };
    
    const handleMouseLeave = () => {
      isHovering = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible.current = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    function resize() {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initSystem();
    }

    class Node {
      constructor(baseX, baseY, baseZ, isLabelNode) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.baseZ = baseZ;
        
        this.size = Math.random() * 1.5 + 1.5; // Slightly larger for main structure
        this.baseOpacity = Math.random() * 0.4 + 0.6; // High opacity
        
        this.vx = 0;
        this.vy = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.label = null;
        if (isLabelNode && NUTRITION_LABELS.length > 0) {
          this.label = NUTRITION_LABELS[Math.floor(Math.random() * NUTRITION_LABELS.length)];
        }
      }

      update(angle) {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        const rotX = this.baseX * cosA - this.baseZ * sinA;
        const rotZ = this.baseX * sinA + this.baseZ * cosA;
        
        const floatY = Math.sin(Date.now() * 0.001 + this.baseX) * 10;

        const fov = 800;
        const viewerZ = 400;
        const scale = fov / (fov + rotZ + viewerZ);
        
        this.screenX = width / 2 + rotX * scale + this.offsetX;
        this.screenY = height / 2 + (this.baseY + floatY) * scale + this.offsetY;
        this.screenScale = scale;
        
        this.opacity = this.baseOpacity * scale * (rotZ > 0 ? 0.3 : 1);

        if (isHovering) {
          const dx = this.screenX - mouse.x;
          const dy = this.screenY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;
          
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            this.vx += (dx / dist) * force * 1.5;
            this.vy += (dy / dist) * force * 1.5;
            this.opacity = Math.min(1, this.opacity + force * 0.5);
          }
        }

        this.offsetX += this.vx;
        this.offsetY += this.vy;
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.offsetX += (0 - this.offsetX) * 0.1;
        this.offsetY += (0 - this.offsetY) * 0.1;
      }

      draw(ctx) {
        if (this.opacity < 0.05) return;
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, this.size * this.screenScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();

        if (this.label && this.screenScale > 0.8) {
          ctx.font = '11px Inter, sans-serif';
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.fillText(this.label, this.screenX + 10, this.screenY + 4);
        }
      }
    }

    class AmbientParticle {
      constructor() {
        this.baseX = (Math.random() - 0.5) * HELIX_RADIUS * 4;
        this.baseY = (Math.random() - 0.5) * HELIX_HEIGHT * 1.2;
        this.baseZ = (Math.random() - 0.5) * HELIX_RADIUS * 4;
        
        this.size = Math.random() * 1.5 + 0.5;
        this.baseOpacity = Math.random() * 0.3 + 0.1;
        this.speedY = (Math.random() - 0.5) * 0.5;
      }

      update(angle) {
        this.baseY += this.speedY;
        if (this.baseY > HELIX_HEIGHT / 2) this.baseY = -HELIX_HEIGHT / 2;
        if (this.baseY < -HELIX_HEIGHT / 2) this.baseY = HELIX_HEIGHT / 2;

        const cosA = Math.cos(angle * 0.5); // Rotate slower
        const sinA = Math.sin(angle * 0.5);
        
        const rotX = this.baseX * cosA - this.baseZ * sinA;
        const rotZ = this.baseX * sinA + this.baseZ * cosA;
        
        const fov = 800;
        const viewerZ = 400;
        const scale = fov / (fov + rotZ + viewerZ);
        
        this.screenX = width / 2 + rotX * scale;
        this.screenY = height / 2 + this.baseY * scale;
        this.screenScale = scale;
        this.opacity = this.baseOpacity * scale * (rotZ > 0 ? 0.3 : 1);
      }

      draw(ctx) {
        if (this.opacity < 0.05) return;
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, this.size * this.screenScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initSystem() {
      nodes = [];
      ambientParticles = [];
      
      // Build precise double helix
      for (let i = 0; i < BASE_PAIRS; i++) {
        const t = (i / BASE_PAIRS) * Math.PI * 6; // 3 full turns
        const y = (i / BASE_PAIRS) * HELIX_HEIGHT - (HELIX_HEIGHT / 2);
        
        // Strand 1
        const x1 = Math.cos(t) * HELIX_RADIUS;
        const z1 = Math.sin(t) * HELIX_RADIUS;
        const isLabel1 = Math.random() > 0.85;
        nodes.push(new Node(x1, y, z1, isLabel1));
        
        // Strand 2
        const x2 = Math.cos(t + Math.PI) * HELIX_RADIUS;
        const z2 = Math.sin(t + Math.PI) * HELIX_RADIUS;
        const isLabel2 = Math.random() > 0.85;
        nodes.push(new Node(x2, y, z2, isLabel2));
      }

      // Add ambient floating particles
      for (let i = 0; i < AMBIENT_COUNT; i++) {
        ambientParticles.push(new AmbientParticle());
      }
    }

    function drawSystem() {
      // 1. Draw Rungs (Base pairs connecting strand 1 and 2)
      for (let i = 0; i < BASE_PAIRS; i++) {
        const n1 = nodes[i * 2];
        const n2 = nodes[i * 2 + 1];
        
        if (n1.opacity < 0.05 || n2.opacity < 0.05) continue;

        ctx.beginPath();
        const gradient = ctx.createLinearGradient(n1.screenX, n1.screenY, n2.screenX, n2.screenY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${n1.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${Math.min(n1.opacity, n2.opacity) * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${n2.opacity * 0.8})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 * ((n1.screenScale + n2.screenScale) / 2);
        ctx.moveTo(n1.screenX, n1.screenY);
        ctx.lineTo(n2.screenX, n2.screenY);
        ctx.stroke();
      }

      // 2. Draw Backbone (connecting strand particles vertically)
      for (let i = 0; i < BASE_PAIRS - 1; i++) {
        // Strand 1 backbone
        const s1a = nodes[i * 2];
        const s1b = nodes[(i + 1) * 2];
        if (s1a.opacity > 0.05 && s1b.opacity > 0.05) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(s1a.opacity, s1b.opacity)})`;
          ctx.lineWidth = 1.5 * ((s1a.screenScale + s1b.screenScale) / 2);
          ctx.moveTo(s1a.screenX, s1a.screenY);
          ctx.lineTo(s1b.screenX, s1b.screenY);
          ctx.stroke();
        }

        // Strand 2 backbone
        const s2a = nodes[i * 2 + 1];
        const s2b = nodes[(i + 1) * 2 + 1];
        if (s2a.opacity > 0.05 && s2b.opacity > 0.05) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(s2a.opacity, s2b.opacity)})`;
          ctx.lineWidth = 1.5 * ((s2a.screenScale + s2b.screenScale) / 2);
          ctx.moveTo(s2a.screenX, s2a.screenY);
          ctx.lineTo(s2b.screenX, s2b.screenY);
          ctx.stroke();
        }
      }

      // 3. Draw Ambient Network (faint connections between ambient particles)
      for (let i = 0; i < ambientParticles.length; i++) {
        const p1 = ambientParticles[i];
        if (p1.opacity < 0.1) continue;

        for (let j = i + 1; j < Math.min(i + 10, ambientParticles.length); j++) {
          const p2 = ambientParticles[j];
          if (p2.opacity < 0.1) continue;

          const dx = p1.screenX - p2.screenX;
          const dy = p1.screenY - p2.screenY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 8000) { // approx 90px
            const dist = Math.sqrt(distSq);
            const opacity = (1 - (dist / 90)) * 0.1 * Math.min(p1.opacity, p2.opacity);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }
        }
      }
      
      // 4. Draw all nodes and particles
      for (let i = 0; i < nodes.length; i++) nodes[i].draw(ctx);
      for (let i = 0; i < ambientParticles.length; i++) ambientParticles[i].draw(ctx);
    }


    function optimizedLoop() {
        if (isVisible.current) {
            ctx.clearRect(0, 0, width, height);
            rotationAngle += ROTATION_SPEED;
            for (let i = 0; i < nodes.length; i++) nodes[i].update(rotationAngle);
            for (let i = 0; i < ambientParticles.length; i++) ambientParticles[i].update(rotationAngle);
            drawSystem();
        }
        animationFrameId = requestAnimationFrame(optimizedLoop);
    }

    window.addEventListener('resize', resize);
    resize();
    optimizedLoop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 pointer-events-none ${className}`} style={{ width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      />
    </div>
  );
}
