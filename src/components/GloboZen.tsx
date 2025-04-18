import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, usePlane, useSphere, useBox } from '@react-three/cannon';
import * as THREE from 'three';

type Props = {
  drawnBalls: number[];
};

const Ball = ({
  number,
  position,
  shouldRender,
}: {
  number: number;
  position: [number, number, number];
  shouldRender: boolean;
}) => {
  const [ref, api] = useSphere(() => ({
    mass: 0.5,
    position,
    args: [0.4],
    restitution: 0.2,
    friction: 0.5,
    linearDamping: 0.95,
    angularDamping: 0.95,
    sleepTimeLimit: 1,
  }));

  useEffect(() => {
    if (!shouldRender && ref.current) {
      api.position.set(999, 999, 999);
    }
  }, [shouldRender]);

  const texture = React.useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), size / 2, size / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [number]);

  if (!shouldRender) return null;

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

const Floor = () => {
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -7.5, 0],
  }));
  return null;
};

const CagePlanes = () => {
  const r = 7;
  usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -r, 0] }));
  usePlane(() => ({ rotation: [Math.PI / 2, 0, 0], position: [0, r, 0] }));
  usePlane(() => ({ rotation: [0, Math.PI / 2, 0], position: [r, 0, 0] }));
  usePlane(() => ({ rotation: [0, -Math.PI / 2, 0], position: [-r, 0, 0] }));
  usePlane(() => ({ rotation: [0, 0, 0], position: [0, 0, r] }));
  usePlane(() => ({ rotation: [0, Math.PI, 0], position: [0, 0, -r] }));
  return null;
};

// Distribui pontos aleatoriamente dentro de uma esfera
const getRandomPointInSphere = (radius: number): [number, number, number] => {
  let x, y, z;
  do {
    x = (Math.random() * 2 - 1) * radius;
    y = (Math.random() * 2 - 1) * radius;
    z = (Math.random() * 2 - 1) * radius;
  } while (x * x + y * y + z * z > radius * radius);
  return [x, y, z];
};

const BallsInside = ({ drawnBalls }: { drawnBalls: number[] }) => {
  return (
    <>
      {Array.from({ length: 75 }, (_, i) => {
        const number = i + 1;
        const shouldRender = !drawnBalls.includes(number);
        const position = getRandomPointInSphere(5.5);
        return (
          <Ball
            key={number}
            number={number}
            position={position}
            shouldRender={shouldRender}
          />
        );
      })}
    </>
  );
};

const RotatingGlobe = ({ startRotation }: { startRotation: boolean }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (startRotation && ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial wireframe color="#007bff" />
      </mesh>
    </group>
  );
};

const GloboZen = ({ drawnBalls }: Props) => {
  const [start, setStart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStart(true);
    }, 1000); // inicia rotação e física após 1s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 600, height: 500 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
          <ambientLight />
          <Physics gravity={start ? [0, -9.81, 0] : [0, 0, 0]}>
            <Floor />
            <CagePlanes />
            <BallsInside drawnBalls={drawnBalls} />
          </Physics>
          <RotatingGlobe startRotation={start} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GloboZen;