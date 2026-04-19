import { useGLTF } from "@react-three/drei";

export function TreeTwo(props) {
  const { nodes, materials } = useGLTF("/tree-2.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.vegetation_05_vegetation_05_0.geometry}
        material={materials.vegetation_05}
        position={[9, 5.2, -7]}
        scale={0.3}
      />
    </group>
  );
}

useGLTF.preload("/tree-2.glb");
