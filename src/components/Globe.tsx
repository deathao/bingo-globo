import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import * as THREE from 'three';

type GlobeProps = {
  remainingBalls: number[];
};

export type GlobeRef = {
  drawBall: (number: number) => void;
};

const Globe = forwardRef<GlobeRef, GlobeProps>(({ remainingBalls }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const ballsMapRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const sceneRef = useRef<THREE.Scene>();
  const globeGroupRef = useRef<THREE.Group>();

  useImperativeHandle(ref, () => ({
    drawBall(number) {
      const mesh = ballsMapRef.current.get(number);
      if (mesh && globeGroupRef.current) {
        globeGroupRef.current.remove(mesh);
        ballsMapRef.current.delete(number);
      }
    },
  }));

  const createNumberTexture = (number: number): THREE.CanvasTexture => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ff4d4d';
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 8, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = '#fff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(number.toString(), size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Grupo que gira: contém wireframe + bolas
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Wireframe da esfera (globo)
    const sphereGeometry = new THREE.SphereGeometry(15, 32, 32);
    const wireframe = new THREE.WireframeGeometry(sphereGeometry);
    const line = new THREE.LineSegments(
      wireframe,
      new THREE.LineBasicMaterial({ color: 0x007bff })
    );
    globeGroup.add(line);

    // Criar bolas com textura
    const ballGeometry = new THREE.SphereGeometry(0.8, 32, 32);

    for (let i = 1; i <= 75; i++) {
      const texture = createNumberTexture(i);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const ball = new THREE.Mesh(ballGeometry, material);

      // posição esférica (raio fixo + latitude/longitude)
      const radius = 14.2;
      const phi = Math.acos(2 * Math.random() - 1); // latitude
      const theta = 2 * Math.PI * Math.random(); // longitude

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      ball.position.set(x, y, z);
      ballsMapRef.current.set(i, ball);
      globeGroup.add(ball);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      globeGroup.rotation.x += 0.01; // rotação vertical (tipo globo real)
      globeGroup.rotation.y += 0.002; // leve rotação lateral também (mais bonito)
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '500px',
        backgroundColor: '#eef2f5',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
});

export default Globe;