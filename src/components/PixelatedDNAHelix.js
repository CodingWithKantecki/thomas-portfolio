'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Particle field component
function ParticleField({ scrollVelocity = 0 }) {
  const pointsRef = useRef();
  const { viewport } = useThree();
  const scrollOffsetRef = useRef(0);

  // Generate particle positions
  const particlesData = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const spread = 60;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random positions in 3D space
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.5;

      // Store original positions for wave animation
      originalPositions[i3] = positions[i3];
      originalPositions[i3 + 1] = positions[i3 + 1];
      originalPositions[i3 + 2] = positions[i3 + 2];

      // Random speeds for varied motion
      speeds[i] = Math.random() * 0.5 + 0.5;

      // Color gradient from cyan to purple
      const colorMix = Math.random();
      colors[i3] = colorMix * 0.0 + (1 - colorMix) * 1.0;     // R
      colors[i3 + 1] = colorMix * 0.85 + (1 - colorMix) * 0.0; // G
      colors[i3 + 2] = colorMix * 1.0 + (1 - colorMix) * 1.0;  // B
    }

    return { positions, originalPositions, colors, speeds, count };
  }, []);

  // Animation handler with scroll flow
  useFrame(({ mouse, clock }) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const time = clock.getElapsedTime();

    // Update scroll offset based on velocity - very subtle flow
    scrollOffsetRef.current += scrollVelocity * 0.05;

    for (let i = 0; i < particlesData.count; i++) {
      const i3 = i * 3;

      const originalX = particlesData.originalPositions[i3];
      const originalY = particlesData.originalPositions[i3 + 1];
      const originalZ = particlesData.originalPositions[i3 + 2];

      // Wave motion - very subtle and smooth
      const waveX = Math.sin(time * particlesData.speeds[i] * 0.2 + originalY * 0.03) * 0.25;
      const waveY = Math.cos(time * particlesData.speeds[i] * 0.2 + originalX * 0.03) * 0.25;
      const waveZ = Math.sin(time * particlesData.speeds[i] * 0.15) * 0.15;

      // Scroll flow effect - particles flow up/down based on scroll
      const scrollFlow = scrollOffsetRef.current;
      const flowY = scrollFlow * particlesData.speeds[i];

      // Wrap particles around vertically
      let wrappedFlowY = flowY % 100;
      if (wrappedFlowY > 50) wrappedFlowY -= 100;
      if (wrappedFlowY < -50) wrappedFlowY += 100;

      // Mouse interaction - smooth and noticeable
      const mouseX = mouse.x * viewport.width / 2;
      const mouseY = mouse.y * viewport.height / 2;
      const dx = mouseX - originalX;
      const dy = mouseY - originalY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 15;

      let mouseInfluenceX = 0;
      let mouseInfluenceY = 0;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist);
        const smoothForce = force * force;
        mouseInfluenceX = (dx / dist) * smoothForce * 1.5;
        mouseInfluenceY = (dy / dist) * smoothForce * 1.5;
      }

      // Apply all motions with smooth interpolation
      const targetX = originalX + waveX + mouseInfluenceX;
      const targetY = originalY + waveY + wrappedFlowY + mouseInfluenceY;
      const targetZ = originalZ + waveZ;

      // Lerp for smooth transitions
      positions[i3] = positions[i3] + (targetX - positions[i3]) * 0.1;
      positions[i3 + 1] = positions[i3 + 1] + (targetY - positions[i3 + 1]) * 0.1;
      positions[i3 + 2] = positions[i3 + 2] + (targetZ - positions[i3 + 2]) * 0.1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesData.count}
          array={particlesData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesData.count}
          array={particlesData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Scene component
function ParticleScene({ scrollVelocity }) {
  return (
    <>
      <ParticleField scrollVelocity={scrollVelocity} />
      <ambientLight intensity={0.5} />
    </>
  );
}

// Main component export
export default function PixelatedDNAHelix({ className = '', scrollVelocity = 0 }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ParticleScene scrollVelocity={scrollVelocity} />
      </Canvas>
    </div>
  );
}
