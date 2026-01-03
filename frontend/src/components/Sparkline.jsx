import { useEffect, useRef } from 'react';
import './Sparkline.css';

/**
 * Mini line chart showing recent trend data
 * Perfect for speed, RPM, temperature history
 */
export default function Sparkline({
  data = [],
  width = 80,
  height = 30,
  color = '#00d9ff',
  strokeWidth = 2,
  showArea = true
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Scale canvas for retina displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Create path
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height
    }));

    // Draw area fill
    if (showArea) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, `${color}05`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

  }, [data, width, height, color, strokeWidth, showArea]);

  return (
    <canvas
      ref={canvasRef}
      className="sparkline"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}
