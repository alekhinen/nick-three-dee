import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import type { ComponentProps } from "react";
import type { Material, Mesh } from "three";

export function TreeTwo(props: ComponentProps<typeof RigidBody>) {
  const { nodes, materials } = useGLTF("/tree-2.glb") as unknown as {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
  };
  return (
    <RigidBody type="fixed" colliders="hull" {...props}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_05_vegetation_05_0.geometry}
        material={materials.vegetation_05}
        position={[9, 5.2, -7]}
        scale={0.3}
      />
    </RigidBody>
  );
}

useGLTF.preload("/tree-2.glb");
