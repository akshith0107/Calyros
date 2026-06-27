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
    
    // Use high DPI canvas for crispness
    const dpr = window.devicePixelRatio || 1;
    
    let width, height;
    let nodes = [];
    let animationFrameId;
    let rotationAngle = 0;
    
    const isMobile = window.innerWidth < 768;
    const BASE_PAIRS = isMobile ? 25 : 45;
    const ROTATION_SPEED = 0.0015;
    const HELIX_RADIUS = isMobile ? 80 : 150;
    const HELIX_HEIGHT = isMobile ? 800 : 1400;
    
    let mouse = { x: -1000, y: -1000 };
    let isHovering = false;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
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
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initSystem();
    }

    class Node {
      constructor(baseX, baseY, baseZ, isLabelNode) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.baseZ = baseZ;
        
        this.size = 3.5; 
        
        this.vx = 0;
        this.vy = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.isPurple = Math.random() > 0.92;

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
        
        const floatY = Math.sin(Date.now() * 0.001 + this.baseX) * 15;

        const fov = 1000;
        const viewerZ = 500;
        const scale = fov / (fov + rotZ + viewerZ);
        
        this.screenX = (width / 2) + rotX * scale + this.offsetX;
        this.screenY = (height / 2) + (this.baseY + floatY) * scale + this.offsetY;
        this.screenScale = scale;
        
        // Crisp z-index sorting approximation
        this.zDepth = rotZ; 
        
        if (isHovering) {
          const dx = this.screenX * dpr - mouse.x;
          const dy = this.screenY * dpr - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150 * dpr;
          
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            this.vx += (dx / dist) * force * 1.5;
            this.vy += (dy / dist) * force * 1.5;
          }
        }

        this.offsetX += this.vx;
        this.offsetY += this.vy;
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.offsetX += (0 - this.offsetX) * 0.05;
        this.offsetY += (0 - this.offsetY) * 0.05;
      }

      draw(ctx) {
        const rad = this.size * this.screenScale;
        if (rad < 0.5) return;
        
        const alpha = this.zDepth > 0 ? 0.3 : 0.9;
        const rgb = this.isPurple ? '139, 92, 246' : '255, 255, 255';
        
        // Draw crisp outer ring
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb}, ${alpha + 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw inner crisp glass core
        ctx.beginPath();
        ctx.arc(this.screenX, this.screenY, rad * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${alpha - 0.1})`;
        ctx.fill();

        // Draw specular highlight (simulated 3D)
        ctx.beginPath();
        ctx.arc(this.screenX - rad * 0.3, this.screenY - rad * 0.3, rad * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
        ctx.fill();

        if (this.isPurple) {
          // Inner purple glow
          ctx.beginPath();
          ctx.arc(this.screenX, this.screenY, rad * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139, 92, 246, 0.15)`;
          ctx.fill();
        }

        if (this.label && this.screenScale > 1.1 && this.zDepth < 0 && !this.isPurple) {
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
          ctx.fillText(this.label, this.screenX + rad + 5, this.screenY + 3);
          
          // Little connecting line to label
          ctx.beginPath();
          ctx.moveTo(this.screenX + rad + 1, this.screenY);
          ctx.lineTo(this.screenX + rad + 4, this.screenY);
          ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function initSystem() {
      nodes = [];
      for (let i = 0; i < BASE_PAIRS; i++) {
        // Less turns, more stretched out for less congestion
        const t = (i / BASE_PAIRS) * Math.PI * 5.5; 
        const y = (i / BASE_PAIRS) * HELIX_HEIGHT - (HELIX_HEIGHT / 2);
        
        const x1 = Math.cos(t) * HELIX_RADIUS;
        const z1 = Math.sin(t) * HELIX_RADIUS;
        nodes.push(new Node(x1, y, z1, Math.random() > 0.85));
        
        const x2 = Math.cos(t + Math.PI) * HELIX_RADIUS;
        const z2 = Math.sin(t + Math.PI) * HELIX_RADIUS;
        nodes.push(new Node(x2, y, z2, Math.random() > 0.85));
      }
    }

    function drawSystem() {
      // Draw rungs
      for (let i = 0; i < BASE_PAIRS; i++) {
        const n1 = nodes[i * 2];
        const n2 = nodes[i * 2 + 1];
        
        const avgZ = (n1.zDepth + n2.zDepth) / 2;
        const alpha = avgZ > 0 ? 0.15 : 0.5;

        ctx.beginPath();
        ctx.moveTo(n1.screenX, n1.screenY);
        ctx.lineTo(n2.screenX, n2.screenY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2 * ((n1.screenScale + n2.screenScale) / 2);
        ctx.stroke();
      }

      // Draw backbone
      for (let i = 0; i < BASE_PAIRS - 1; i++) {
        const s1a = nodes[i * 2];
        const s1b = nodes[(i + 1) * 2];
        const a1 = (s1a.zDepth + s1b.zDepth) / 2 > 0 ? 0.2 : 0.6;
        
        ctx.beginPath();
        ctx.moveTo(s1a.screenX, s1a.screenY);
        ctx.lineTo(s1b.screenX, s1b.screenY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${a1})`;
        ctx.lineWidth = 2.5 * ((s1a.screenScale + s1b.screenScale) / 2);
        ctx.stroke();

        const s2a = nodes[i * 2 + 1];
        const s2b = nodes[(i + 1) * 2 + 1];
        const a2 = (s2a.zDepth + s2b.zDepth) / 2 > 0 ? 0.2 : 0.6;

        ctx.beginPath();
        ctx.moveTo(s2a.screenX, s2a.screenY);
        ctx.lineTo(s2b.screenX, s2b.screenY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${a2})`;
        ctx.lineWidth = 2.5 * ((s2a.screenScale + s2b.screenScale) / 2);
        ctx.stroke();
      }
      
      // Draw nodes (sorted by Z depth to ensure back nodes draw first)
      const sortedNodes = [...nodes].sort((a, b) => b.zDepth - a.zDepth);
      for (let i = 0; i < sortedNodes.length; i++) {
        sortedNodes[i].draw(ctx);
      }
    }

    function optimizedLoop() {
      if (isVisible.current) {
        ctx.clearRect(0, 0, width, height);
        rotationAngle += ROTATION_SPEED;
        // Tilt the canvas for the diagonal cross look
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(Math.PI / 8);
        ctx.translate(-width / 2, -height / 2);
        
        for (let i = 0; i < nodes.length; i++) nodes[i].update(rotationAngle);
        drawSystem();
        
        ctx.restore();
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
