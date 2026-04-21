import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { ComponentProps } from "react";
import type { Material, Mesh } from "three";

export function TreeThree(props: ComponentProps<typeof RigidBody>) {
  const { nodes, materials } = useGLTF("/tree-3.glb") as unknown as {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
  };
  return (
    <RigidBody type="fixed" colliders="hull" {...props}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_02_vegetation_02_0.geometry}
        material={materials.vegetation_02}
        position={[-6, 4.7, -4]}
        scale={0.3}
      />
    </RigidBody>
  );
}

useGLTF.preload("/tree-3.glb");
