import { useGLTF } from "@react-three/drei";
import type { ComponentProps } from "react";
import type { Material, Mesh } from "three";

export function TreeOne(props: ComponentProps<"group">) {
  const { nodes, materials } = useGLTF("/tree-1.glb") as unknown as {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
  };
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_01_vegetation_01_0.geometry}
        material={materials.vegetation_01}
        position={[8, 6.3, 5]}
        scale={1}
      />
    </group>
  );
}

useGLTF.preload("/tree-1.glb");
