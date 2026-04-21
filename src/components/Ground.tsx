import { CuboidCollider, RigidBody } from "@react-three/rapier";

const SIZE = 200;

export function Ground() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[SIZE / 2, 0.1, SIZE / 2]} position={[0, -0.1, 0]} />
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[SIZE, SIZE]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>
    </RigidBody>
  );
}
