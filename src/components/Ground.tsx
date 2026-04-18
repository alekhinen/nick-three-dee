import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Mesh } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";

const SIZE = 20;

export function Ground({
  truckRef,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    const root = truckRef.current?.root;
    const mesh = meshRef.current;
    if (!root || !mesh) {
      return;
    }
    mesh.position.x = root.position.x;
    mesh.position.z = root.position.z;
  });

  return (
    <mesh ref={meshRef} receiveShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[SIZE, SIZE]} />
      <shadowMaterial transparent opacity={0.35} />
    </mesh>
  );
}
