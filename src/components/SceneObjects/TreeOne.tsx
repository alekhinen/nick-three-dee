import { useGLTF } from "@react-three/drei";

export function TreeOne(props) {
  const { nodes, materials } = useGLTF("/tree-1.glb");
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
