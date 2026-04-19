import { PLANET_RADIUS } from "../world/constants";

export function Ground() {
  return (
    <mesh receiveShadow castShadow>
      <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
      <meshStandardMaterial color="#ffffff" roughness={0.9} />
    </mesh>
  );
}
