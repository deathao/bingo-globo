import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  RigidBodyApi,
} from '@react-three/rapier';
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

const generateSpherePoints = (
  count: number,
  radius: number,
  minDist: number
): [number, number, number][] => {
  const points: [number, number, number][] = [];
  let tries = 0;
  while (points.length < count && tries < count * 120) {
    const point: [number, number, number] = [
      (Math.random() * 2 - 1) * radius * 0.55,
      (Math.random() * 2 - 1) * radius * 0.55,
      (Math.random() * 2 - 1) * radius * 0.55,
    ];
    const tooClose = points.some(
      (p) =>
        Math.sqrt(
          (p[0] - point[0]) ** 2 +
          (p[1] - point[1]) ** 2 +
          (p[2] - point[2]) ** 2
        ) < minDist
    );
    if (!tooClose) {
      points.push(point);
    }
    tries++;
  }
  return points;
};

const Ball = ({
  number,
  initialPosition,
  hidden,
}: {
  number: number;
  initialPosition: [number, number, number];
  hidden: boolean;
}) => {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Gradient Background
    const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, getBallColor(number));
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // White circle for number
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Number text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Outfit, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), size / 2, size / 2);
    return new THREE.CanvasTexture(canvas);
  }, [number]);

  const handleCollision = (e: any) => {
    // Determine intensity based on relative velocity
    const velocity = e.rigidbody ? e.rigidbody.linearVelocity() : { x: 0, y: 0, z: 0 };
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
    const intensity = Math.min(speed / 8, 1);
    if (intensity > 0.1) {
      sounds.playBallCollision(intensity);
    }
  };

  if (hidden) return null;

  return (
    <RigidBody
      colliders={false}
      position={initialPosition}
      restitution={0.65}
      friction={0.2}
      linearDamping={0.4}
      angularDamping={0.4}
      canSleep={false}
      onCollisionEnter={handleCollision}
    >
      <BallCollider args={[0.38]} />
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial map={texture} roughness={0.1} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
};

const BallsInside = ({ drawnBalls }: { drawnBalls: number[] }) => {
  const positions = useMemo(() => generateSpherePoints(75, 5.2, 0.95), []);
  return (
    <>
      {positions.map((pos, index) => {
        const number = index + 1;
        const hidden = drawnBalls.includes(number);
        return (
          <Ball
            key={number}
            number={number}
            initialPosition={pos}
            hidden={hidden}
          />
        );
      })}
    </>
  );
};

const RotatingGlobeVisual = () => {
  const globeRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.015;
      globeRef.current.rotation.x += 0.003;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Outer Wireframe Cage */}
      <mesh>
        <sphereGeometry args={[5.8, 24, 24]} />
        <meshStandardMaterial 
          wireframe 
          color="#d97706" 
          roughness={0.2} 
          metalness={0.9} 
          transparent 
          opacity={0.7}
        />
      </mesh>
      {/* Inner supports */}
      <mesh>
        <sphereGeometry args={[5.78, 8, 8]} />
        <meshStandardMaterial 
          wireframe 
          color="#f59e0b" 
          roughness={0.1} 
          metalness={0.95} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
};

const RotatingCageBody = () => {
  const cageRef = useRef<RigidBodyApi>(null);
  const angle = useRef(0);

  useFrame(() => {
    if (cageRef.current) {
      angle.current += 0.015;
      const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, angle.current, 0.05)
      );
      cageRef.current.setNextKinematicRotation(rotation);
      cageRef.current.setNextKinematicTranslation({ x: 0, y: 0.5, z: 0 });
    }
  });

  // Kinetic invisible physical bounds rotating with visual cage
  return (
    <RigidBody
      ref={cageRef}
      type="kinematicPositionBased"
      position={[0, 0.5, 0]}
      gravityScale={0}
      colliders={false}
    >
      <CuboidCollider args={[4.8, 0.1, 4.8]} position={[0, 4.8, 0]} />
      <CuboidCollider args={[4.8, 0.1, 4.8]} position={[0, -4.8, 0]} />
      <CuboidCollider args={[0.1, 4.8, 4.8]} position={[4.8, 0, 0]} />
      <CuboidCollider args={[0.1, 4.8, 4.8]} position={[-4.8, 0, 0]} />
      <CuboidCollider args={[4.8, 4.8, 0.1]} position={[0, 0, 4.8]} />
      <CuboidCollider args={[4.8, 4.8, 0.1]} position={[0, 0, -4.8]} />
    </RigidBody>
  );
};

// Premium Cage Metallic Stand & Support Elements
const CageStand = () => {
  return (
    <group position={[0, -5, 0]}>
      {/* Base Plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[7, 7.5, 0.5, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[6.5, 7, 0.2, 32]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Left Pillar Support */}
      <mesh position={[-6.2, 5.2, 0]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.4, 0.6, 10, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right Pillar Support */}
      <mesh position={[6.2, 5.2, 0]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.4, 0.6, 10, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Center axles */}
      <mesh position={[0, 10.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 13, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
};

const GloboRapier = ({ drawnBalls }: Props) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 420 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 2, 17], fov: 45 }} shadows>
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[5, 15, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-8, 5, -8]} intensity={0.5} />
          
          <Physics gravity={[0, -9.8, 0]}>
            <BallsInside drawnBalls={drawnBalls} />
            <RotatingCageBody />
          </Physics>

          <group position={[0, 0.5, 0]}>
            <RotatingGlobeVisual />
          </group>
          
          <CageStand />
          {drawnBalls.length > 0 && <Ramp number={drawnBalls[0]} />}
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GloboRapier;