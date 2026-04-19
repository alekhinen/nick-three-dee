const SIZE = 200;

export function Ground() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[SIZE, SIZE]} />
      <shadowMaterial transparent opacity={0.35} />
    </mesh>
  );
}
