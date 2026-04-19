import { CubeCamera, MeshDistortMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

type MetallicBlobProps = {
  position?: [number, number, number];
  radius?: number;
};

export function MetallicBlob({
  position = [0, 2, 4],
  radius = 1,
}: MetallicBlobProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <CubeCamera position={position} resolution={256} frames={Infinity}>
      {(texture) => (
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[radius, 64]} />
          <MeshDistortMaterial
            envMap={texture}
            color="#e6f5ef"
            metalness={1}
            roughness={0.1}
            distort={0.4}
            speed={2}
          />
        </mesh>
      )}
    </CubeCamera>
  );
}
