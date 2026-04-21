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
    const body = truckRef.current?.body;
    const light = lightRef.current;
    if (!body || !light) {
      return;
    }
    const pos = body.translation();
    light.position.x = pos.x + OFFSET_X;
    light.position.y = pos.y + OFFSET_Y;
    light.position.z = pos.z + OFFSET_Z;
    light.target.position.set(pos.x, pos.y, pos.z);
    light.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      castShadow
      intensity={1.5}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-25}
      shadow-camera-right={25}
      shadow-camera-top={25}
      shadow-camera-bottom={-25}
      shadow-camera-near={0.1}
      shadow-camera-far={60}
      shadow-normalBias={0.05}
      shadow-radius={8}
      shadow-blurSamples={16}
    />
  );
}
