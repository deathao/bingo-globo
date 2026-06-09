import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Ramp from './Ramp';
import { sounds } from '../utils/sound';

type Props = {
  drawnBalls: number[];
};

const getBallColor = (num: number): string => {
  if (num <= 15) return '#3b82f6'; // B
  if (num <= 30) return '#22c55e'; // I
  if (num <= 45) return '#f59e0b'; // N
  if (num <= 60) return '#f97316'; // G
  return '#ef4444'; // O
};

// Physics state for a ball
class SimBall {
  public pos: THREE.Vector3;
  public vel: THREE.Vector3;
  public rot: THREE.Quaternion = new THREE.Quaternion();
  public rotVel: THREE.Vector3;
  public num: number;

  constructor(num: number, startPos: [number, number, number]) {
    this.num = num;
    this.pos = new THREE.Vector3(...startPos);
    this.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5
    );
    this.rotVel = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );
  }

  update(dt: number) {
    // Gravity
    this.vel.y -= 9.81 * dt;

    // Damping (air friction)
    this.vel.multiplyScalar(1 - 0.08 * dt);
    this.rotVel.multiplyScalar(1 - 0.3 * dt);

    // Update position
    this.pos.addScaledVector(this.vel, dt);

    // Update rotation
    const deltaRot = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        this.rotVel.x * dt,
        this.rotVel.y * dt,
        this.rotVel.z * dt
      )
    );
    this.rot.multiply(deltaRot);
  }
}

// Visual globe and simulation coordinator
const GlobeSimulation = ({ drawnBalls, textures }: { drawnBalls: number[]; textures: THREE.CanvasTexture[] }) => {
  const cageRef = useRef<THREE.Group>(null);
  const ballRefs = useRef<(THREE.Mesh | null)[]>([]);
  const center = useMemo(() => new THREE.Vector3(0, 0.5, 0), []);
  const cageRadius = 5.4;
  const ballRadius = 0.38;
  const cageAngle = useRef(0);

  // Generate unique initial positions distributed inside the sphere cage
  const simBalls = useMemo(() => {
    const list: SimBall[] = [];
    const count = 75;
    let tries = 0;
    while (list.length < count && tries < 2000) {
      const radius = cageRadius * 0.55;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = Math.random() * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = 0.5 + r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const tooClose = list.some((b) => b.pos.distanceTo(new THREE.Vector3(x, y, z)) < 0.85);
      if (!tooClose) {
        list.push(new SimBall(list.length + 1, [x, y, z]));
      }
      tries++;
    }
    // Fill remaining if constraints were too tight
    while (list.length < count) {
      list.push(new SimBall(list.length + 1, [0, 0.5, 0]));
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    // Cap delta to prevent massive jumps on lag spikes or tab switching
    const dt = Math.min(delta, 0.03);

    // Rotate cage around X-axis
    cageAngle.current += 1.2 * dt;
    if (cageRef.current) {
      cageRef.current.rotation.x = cageAngle.current;
    }

    // Physics step
    simBalls.forEach((ball) => {
      if (drawnBalls.includes(ball.num)) return;
      
      ball.update(dt);

      // 1. Boundary collision (Sphere Cage)
      const distToCenter = ball.pos.distanceTo(center);
      const limit = cageRadius - ballRadius;
      if (distToCenter > limit) {
        const normal = ball.pos.clone().sub(center).normalize();
        
        // Push back inside sphere
        ball.pos.copy(center).addScaledVector(normal, limit);

        // Reflect velocity off sphere wall
        const dot = ball.vel.dot(normal);
        if (dot > 0) {
          const restitution = 0.65;
          ball.vel.addScaledVector(normal, -dot * (1 + restitution));

          // Tangential drag / friction from spinning cage (spins around X-axis)
          const r_vec = ball.pos.clone().sub(center);
          const w = 1.6; // rotation rate
          const v_cage = new THREE.Vector3(0, -w * r_vec.z, w * r_vec.y);
          
          // Blend cage movement velocity into ball tangential movement
          const tangent = ball.vel.clone().sub(normal.clone().multiplyScalar(ball.vel.dot(normal)));
          tangent.lerp(v_cage, 0.12);
          ball.vel.copy(normal.clone().multiplyScalar(ball.vel.dot(normal))).add(tangent);

          // Add a bit of random upward/lateral bounce
          ball.vel.x += (Math.random() - 0.5) * 1.5;
          ball.vel.y += Math.random() * 1.2; // push up
          ball.vel.z += (Math.random() - 0.5) * 1.5;

          // Spin the ball on wall contact
          ball.rotVel.x += (Math.random() - 0.5) * 10;
          ball.rotVel.y += (Math.random() - 0.5) * 10;

          // Sound trigger
          if (dot > 1.2) {
            sounds.playBallCollision(Math.min(dot / 8, 0.7));
          }
        }
      }
    });

    // 2. Ball-to-ball collisions
    let playSound = false;
    let maxIntensity = 0;
    const count = simBalls.length;
    const diameter = ballRadius * 2;

    for (let i = 0; i < count; i++) {
      const bi = simBalls[i];
      if (drawnBalls.includes(bi.num)) continue;

      for (let j = i + 1; j < count; j++) {
        const bj = simBalls[j];
        if (drawnBalls.includes(bj.num)) continue;

        const dist = bi.pos.distanceTo(bj.pos);
        if (dist < diameter) {
          const overlap = diameter - dist;
          const normal = bi.pos.clone().sub(bj.pos).normalize();

          // Push apart
          bi.pos.addScaledVector(normal, overlap * 0.5);
          bj.pos.addScaledVector(normal, -overlap * 0.5);

          // Relative velocity
          const relVel = bi.vel.clone().sub(bj.vel);
          const vn = relVel.dot(normal);

          if (vn < 0) {
            const restitution = 0.55;
            const impulse = vn * (1 + restitution) * 0.5;
            bi.vel.addScaledVector(normal, -impulse);
            bj.vel.addScaledVector(normal, impulse);

            // Ball rotation exchange
            bi.rotVel.addScaledVector(bj.rotVel, 0.1);
            bj.rotVel.addScaledVector(bi.rotVel, 0.1);

            // Log collision intensity
            if (Math.abs(vn) > 1.0) {
              playSound = true;
              maxIntensity = Math.max(maxIntensity, Math.min(Math.abs(vn) / 6, 0.5));
            }
          }
        }
      }
    }

    // Play a collision click sound throttled to avoid audio overload
    if (playSound && Math.random() < 0.22) {
      sounds.playBallCollision(maxIntensity);
    }

    // Update visual mesh positions directly
    simBalls.forEach((ball, idx) => {
      const mesh = ballRefs.current[idx];
      if (mesh) {
        if (drawnBalls.includes(ball.num)) {
          mesh.visible = false;
        } else {
          mesh.visible = true;
          mesh.position.copy(ball.pos);
          mesh.quaternion.copy(ball.rot);
        }
      }
    });
  });

  return (
    <>
      {/* 3D Rotating Cage */}
      <group ref={cageRef} position={[0, 0.5, 0]}>
        {/* Golden wireframe sphere cage */}
        <mesh>
          <sphereGeometry args={[5.4, 28, 28]} />
          <meshStandardMaterial 
            wireframe 
            color="#d97706" 
            roughness={0.15} 
            metalness={0.9} 
            transparent 
            opacity={0.65} 
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[5.38, 8, 8]} />
          <meshStandardMaterial 
            wireframe 
            color="#f59e0b" 
            roughness={0.1} 
            metalness={0.95} 
            transparent 
            opacity={0.25} 
          />
        </mesh>
      </group>

      {/* Render the 75 individual ball meshes */}
      {simBalls.map((ball, idx) => (
        <mesh
          key={ball.num}
          ref={(el) => {
            ballRefs.current[idx] = el;
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[ballRadius, 16, 16]} />
          <meshStandardMaterial map={textures[idx]} roughness={0.15} metalness={0.1} />
        </mesh>
      ))}
    </>
  );
};

// Premium Cage Metallic Stand & Support Elements
const CageStand = () => {
  return (
    <group position={[0, -5, 0]}>
      {/* Base Plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[6.8, 7.2, 0.5, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[6.3, 6.7, 0.2, 32]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Left Pillar Support */}
      <mesh position={[-5.8, 5.2, 0]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.35, 0.55, 10, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right Pillar Support */}
      <mesh position={[5.8, 5.2, 0]} rotation={[0, 0, -0.04]}>
        <cylinderGeometry args={[0.35, 0.55, 10, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Center axles */}
      <mesh position={[0, 10.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 12, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
};

const GloboFisico = ({ drawnBalls }: Props) => {
  // Generate 75 canvas-based ball textures once to optimize render performance
  const textures = useMemo(() => {
    return Array.from({ length: 75 }, (_, i) => {
      const number = i + 1;
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // Gradient matching ball column color
      const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, getBallColor(number));
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.fill();

      // White circle for label
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number.toString(), size / 2, size / 2);

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 420 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 1.5, 15], fov: 48 }} shadows>
          <ambientLight intensity={0.8} />
          <directionalLight 
            position={[5, 15, 6]} 
            intensity={1.3} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-8, 6, -8]} intensity={0.5} />
          
          <GlobeSimulation drawnBalls={drawnBalls} textures={textures} />
          
          <CageStand />
          {drawnBalls.length > 0 && <Ramp number={drawnBalls[0]} />}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GloboFisico;
