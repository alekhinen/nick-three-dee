import { Canvas } from "@react-three/fiber";
import { Environment, KeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { DumpTruckScene, type DumpTruckHandle } from "./DumpTruckScene";
import { TruckCamera } from "./TruckCamera";
import { TruckController } from "./TruckController";

const cameraDefaultPosition = [-7, 6, 8] as const;
const TRUCK_GROUND_OFFSET = 0.89;

const keyMap = [
  { name: "forward", keys: ["KeyW"] },
  { name: "back", keys: ["KeyS"] },
];

export function World() {
  const truckRef = useRef<DumpTruckHandle>(null);
  return (
    <KeyboardControls map={keyMap}>
      <Canvas camera={{ position: cameraDefaultPosition }} shadows="variance">
        <color attach="background" args={["white"]} />
        <TruckCamera truckRef={truckRef} />
        <Environment preset="city" environmentIntensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.5}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-camera-near={0.1}
          shadow-camera-far={100}
          shadow-normalBias={0.05}
          shadow-radius={8}
          shadow-blurSamples={16}
        />
        <mesh receiveShadow rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1000, 1000]} />
          <shadowMaterial transparent opacity={0.35} />
        </mesh>
        <DumpTruckScene ref={truckRef} position={[0, TRUCK_GROUND_OFFSET, 0]} />
        <TruckController truckRef={truckRef} />
      </Canvas>
    </KeyboardControls>
  );
}
