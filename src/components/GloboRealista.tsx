import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, usePlane, useSphere } from '@react-three/cannon';
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
    restitution: 0.1,
    friction: 0.6,
    linearDamping: 0.9,
    angularDamping: 0.9,
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

// 🛡️ Gaiola perfeita (tamanho do globo)
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

// 🧠 Distribuição 3D esférica real
const BallsInside = ({ drawnBalls }: { drawnBalls: number[] }) => {
  return (
    <>
      {Array.from({ length: 75 }, (_, i) => {
        const number = i + 1;
        const shouldRender = !drawnBalls.includes(number);

        // Geração de ponto aleatório dentro da esfera (raio 5.5)
        let x, y, z;
        do {
          x = (Math.random() * 2 - 1) * 5.5;
          y = (Math.random() * 2 - 1) * 5.5;
          z = (Math.random() * 2 - 1) * 5.5;
        } while (x * x + y * y + z * z > 30); // garantir dentro da esfera

        return (
          <Ball
            key={number}
            number={number}
            position={[x, y, z]}
            shouldRender={shouldRender}
          />
        );
      })}
    </>
  );
};

const RotatingGlobe = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) {
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

const GloboRealista = ({ drawnBalls }: Props) => {
  return (
    <div style={{ width: '100%', maxWidth: 600, height: 500 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
          <ambientLight />
          <Physics gravity={[0, -9.81, 0]}>
            <Floor />
            <CagePlanes />
            <BallsInside drawnBalls={drawnBalls} />
          </Physics>
          <RotatingGlobe />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GloboRealista;