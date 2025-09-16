"use client";
import React, { useEffect, useRef, useState } from 'react';

const NetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

 useEffect(() => {
    setIsClient(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !canvas) {
      console.error("Failed to get canvas context");
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 100);

    const points: { x: number; y: number; speedX: number; speedY: number; }[] = [];
    const numPoints = 50;

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

function drawLines() {
  if (!ctx) return;

  if (canvas) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);

for (let i = 0; i < numPoints; i++) {
    for (let j = i + 1; j < numPoints; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - distance / 120) + ')';
        ctx.lineWidth = 2;
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
}

function updatePoints() {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }

      for (let i = 0; i < numPoints; i++) {
        points[i].x += points[i].speedX;
        points[i].y += points[i].speedY;
        if (points[i].x < 0 || points[i].x > width) {
          points[i].speedX *= -1;
        }
        if (points[i].y < 0 || points[i].y > height) {
          points[i].speedY *= -1;
        }
      }
    }

function animate() {
      updatePoints();
      drawLines();
      requestAnimationFrame(animate);
    }

    animate();

window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
      points.length = 0;
      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
        });
      }
    });

  }, []);

  return isClient ? (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100%',
        height: '100vh',
        border: '1px solid red',
      }}
    />
  ) : null;
};

export default NetworkBackground;
