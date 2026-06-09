import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  number: number;
};

const getBallColor = (num: number): string => {
  if (num <= 15) return '#3b82f6'; // B
  if (num <= 30) return '#22c55e'; // I
  if (num <= 45) return '#f59e0b'; // N
  if (num <= 60) return '#f97316'; // G
  return '#ef4444'; // O
};

const Ramp = ({ number }: Props) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<[number, number, number] | null>(null);
  const [visible, setVisible] = useState(false);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (number > 0) {
      setPosition([0, -2, 6]); // Slide start
      setVisible(true);

      // Create texture in a state managed lifecycle to handle clean disposal
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      const grad = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, getBallColor(number));
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.fill();

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
      setTexture(tex);

      return () => {
        tex.dispose();
      };
    }
  }, [number]);

  useFrame(() => {
    if (!ballRef.current || !position || !visible) return;

    const [x, y, z] = position;
    const newZ = z - 0.08;
    const newY = y - 0.03;

    // Spin the ball as it rolls
    ballRef.current.rotation.x -= 0.1;

    if (newZ <= 0) {
      setVisible(false);
      setPosition(null);
    } else {
      setPosition([x, newY, newZ]);
    }
  });

  return (
    <>
      {/* Animated ball rolling down the slide */}
      {visible && position && texture && (
        <mesh ref={ballRef} position={position}>
          <sphereGeometry args={[0.38, 32, 32]} />
          {/* meshBasicMaterial guarantees visibility without lighting dependencies */}
          <meshBasicMaterial map={texture} />
        </mesh>
      )}

      {/* Frosted Slide */}
      <mesh position={[0, -3.8, 3.2]} rotation={[-Math.PI / 8, 0, 0]}>
        <boxGeometry args={[1.5, 0.15, 7]} />
        <meshBasicMaterial 
          color="#475569" 
          transparent 
          opacity={0.7} 
        />
      </mesh>
    </>
  );
};

export default Ramp;