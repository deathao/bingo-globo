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

type Props = {
  drawnBalls: number[];
};

const generateSpherePoints = (
  count: number,
  radius: number,
  minDist: number
): [number, number, number][] => {
  const points: [number, number, number][] = [];
  let tries = 0;
  while (points.length < count && tries < count * 100) {
    const point: [number, number, number] = [
      (Math.random() * 2 - 1) * radius * 0.6,
      (Math.random() * 2 - 1) * radius * 0.6,
      (Math.random() * 2 - 1) * radius * 0.6,
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
    ctx.fillStyle = '#c92a2a';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), size / 2, size / 2);
    return new THREE.CanvasTexture(canvas);
  }, [number]);

  if (hidden) return null;

  return (
    <RigidBody
      colliders={false}
      position={initialPosition}
      restitution={0.4}
      friction={0.4}
      linearDamping={1.5}
      angularDamping={1.5}
      canSleep
    >
      <BallCollider args={[0.4]} />
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </RigidBody>
  );
};

const BallsInside = ({ drawnBalls }: { drawnBalls: number[] }) => {
  const positions = useMemo(() => generateSpherePoints(75, 5, 1.0), []);
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

// 🌐 Globo visual girando com Three.js
const RotatingGlobeVisual = () => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[7, 32, 32]} />
      <meshBasicMaterial wireframe color="#007bff" />
    </mesh>
  );
};

// 🎯 Gaiola invisível que gira fisicamente com as bolas
const RotatingCageBody = () => {
  const cageRef = useRef<RigidBodyApi>(null);
  const angle = useRef(0);
  const frame = useRef(0);

  useFrame(() => {
    frame.current++;
    if (cageRef.current && frame.current >= 2) {
      angle.current += 0.01;
      const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, angle.current)
      );
      cageRef.current.setNextKinematicRotation(rotation);
      cageRef.current.setNextKinematicTranslation({ x: 0, y: 0, z: 0 });
    }
  });

  return (
    <RigidBody
      ref={cageRef}
      type="kinematicPositionBased"
      position={[0, 0, 0]}
      gravityScale={0}
      enabledTranslations={[false, false, false]}
      enabledRotations={[false, false, false]}
      colliders={false}
    >
      {/* Colisores invisíveis, menores que o globo */}
      <CuboidCollider args={[5.8, 0.2, 5.8]} position={[0, 6, 0]} />
      <CuboidCollider args={[5.8, 0.2, 5.8]} position={[0, -6, 0]} />
      <CuboidCollider args={[0.2, 6, 5.8]} position={[5.8, 0, 0]} />
      <CuboidCollider args={[0.2, 6, 5.8]} position={[-5.8, 0, 0]} />
      <CuboidCollider args={[5.8, 6, 0.2]} position={[0, 0, 5.8]} />
      <CuboidCollider args={[5.8, 6, 0.2]} position={[0, 0, -5.8]} />
    </RigidBody>
  );
};

const GloboRapier = ({ drawnBalls }: Props) => {
  return (
    <div style={{ width: '100%', maxWidth: 600, height: 500 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
          <ambientLight />
          <Physics gravity={[0, -9.81, 0]}>
            <BallsInside drawnBalls={drawnBalls} />
            <RotatingCageBody />
          </Physics>
          <RotatingGlobeVisual />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GloboRapier;