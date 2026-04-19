import { useGLTF } from "@react-three/drei";

export function TreeThree(props) {
  const { nodes, materials } = useGLTF("/tree-3.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_02_vegetation_02_0.geometry}
        material={materials.vegetation_02}
        position={[-6, 4.7, -4]}
        scale={0.3}
      />
    </group>
  );
}

useGLTF.preload("/tree-3.glb");
