import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { ComponentProps } from "react";
import type { Material, Mesh } from "three";

export function TreeOne(props: ComponentProps<typeof RigidBody>) {
  const { nodes, materials } = useGLTF("/tree-1.glb") as unknown as {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
  };
  return (
    <RigidBody type="fixed" colliders="hull" {...props}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_01_vegetation_01_0.geometry}
        material={materials.vegetation_01}
        position={[8, 6.3, 5]}
        scale={1}
      />
    </RigidBody>
  );
}

useGLTF.preload("/tree-1.glb");
