import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { DirectionalLight } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";

const OFFSET_X = 10;
const OFFSET_Y = 20;
const OFFSET_Z = 10;

export function SunLight({
  truckRef,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
}) {
  const lightRef = useRef<DirectionalLight>(null);

  useFrame(() => {
    const root = truckRef.current?.root;
    const light = lightRef.current;
    if (!root || !light) {
      return;
    }
    light.position.x = root.position.x + OFFSET_X;
    light.position.y = root.position.y + OFFSET_Y;
    light.position.z = root.position.z + OFFSET_Z;
    light.target.position.copy(root.position);
    light.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      castShadow
      intensity={1.5}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-8}
      shadow-camera-right={8}
      shadow-camera-top={8}
      shadow-camera-bottom={-8}
      shadow-camera-near={0.1}
      shadow-camera-far={60}
      shadow-normalBias={0.05}
      shadow-radius={8}
      shadow-blurSamples={16}
    />
  );
}
