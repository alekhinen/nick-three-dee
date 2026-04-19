import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3, type DirectionalLight } from "three";
import { PLANET_RADIUS } from "../world/constants";

const SUN_DISTANCE = 30;
const ORBIT_PERIOD_S = 60;
const ORBIT_SPEED = (Math.PI * 2) / ORBIT_PERIOD_S;
const SHADOW_HALF = PLANET_RADIUS + 3;
const SHADOW_NEAR = SUN_DISTANCE - PLANET_RADIUS - 3;
const SHADOW_FAR = SUN_DISTANCE + PLANET_RADIUS + 3;

const ORBIT_AXIS = new Vector3(0.2, 1, 0).normalize();
const BASIS_1 = new Vector3(1, 0, 0)
  .addScaledVector(ORBIT_AXIS, -ORBIT_AXIS.x)
  .normalize();
const BASIS_2 = new Vector3().crossVectors(ORBIT_AXIS, BASIS_1).normalize();

export function SunLight() {
  const lightRef = useRef<DirectionalLight>(null);
  const angleRef = useRef(0);

  useFrame((_, dt) => {
    const light = lightRef.current;
    if (!light) {
      return;
    }
    angleRef.current += ORBIT_SPEED * dt;
    const a = angleRef.current;
    const c = Math.cos(a);
    const s = Math.sin(a);
    light.position.set(
      (BASIS_1.x * c + BASIS_2.x * s) * SUN_DISTANCE,
      (BASIS_1.y * c + BASIS_2.y * s) * SUN_DISTANCE,
      (BASIS_1.z * c + BASIS_2.z * s) * SUN_DISTANCE,
    );
    light.target.position.set(0, 0, 0);
    light.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      castShadow
      intensity={1.5}
      shadow-mapSize={[4096, 4096]}
      shadow-camera-left={-SHADOW_HALF}
      shadow-camera-right={SHADOW_HALF}
      shadow-camera-top={SHADOW_HALF}
      shadow-camera-bottom={-SHADOW_HALF}
      shadow-camera-near={SHADOW_NEAR}
      shadow-camera-far={SHADOW_FAR}
      shadow-normalBias={0.1}
      shadow-radius={8}
      shadow-blurSamples={16}
    />
  );
}
