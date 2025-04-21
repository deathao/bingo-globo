import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  number: number;
};

const Ramp = ({ number }: Props) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<[number, number, number] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (number > 0) {
      setPosition([0, -4, 4]); // Posição inicial no topo da rampa
      setVisible(true);
    }
  }, [number]);

  useFrame(() => {
    if (!ballRef.current || !position || !visible) return;

    const [x, y, z] = position;
    const newZ = z - 0.05;
    const newY = y - 0.02;

    if (newZ <= -1) {
      setVisible(false);
      setPosition(null);
    } else {
      setPosition([x, newY, newZ]);
    }
  });

  const texture = (() => {
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
  })();

  return (
    <>
      {/* Bolinha animada descendo a rampa */}
      {visible && position && (
        <mesh ref={ballRef} position={position}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}

      {/* Rampa fixa sempre visível */}
      <mesh position={[0, -6, 2]} rotation={[-Math.PI / 8, 0, 0]}>
        <boxGeometry args={[2, 0.2, 5]} />
        <meshStandardMaterial color="#999" />
      </mesh>
    </>
  );
};

export default Ramp;