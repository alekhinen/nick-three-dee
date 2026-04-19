import { useGLTF } from "@react-three/drei";
import type { Material, Mesh } from "three";

export function RoadBarrier(props) {
  const { nodes, materials } = useGLTF("/road-barrier.glb") as unknown as {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
  };

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_Common_0.geometry}
        material={materials.Common}
        scale={[0.1, 0.051, 0.051]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube002_Common_0.geometry}
        material={materials.Common}
        position={[0, 0.944, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={[0.112, 0.103, 0.066]}
      />
    </group>
  );
}

useGLTF.preload("/road-barrier.glb");
