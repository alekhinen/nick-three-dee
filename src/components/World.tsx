import { Canvas } from "@react-three/fiber";
import { Environment, KeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { DumpTruckScene, type DumpTruckHandle } from "./DumpTruckScene";
import { Ground } from "./Ground";
import { SunLight } from "./SunLight";
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
        <DumpTruckScene ref={truckRef} position={[0, TRUCK_GROUND_OFFSET, 1]} />
        <TruckController truckRef={truckRef} />
        <TruckCamera truckRef={truckRef} />
        <SunLight truckRef={truckRef} />
        <Ground truckRef={truckRef} />
        <Environment preset="city" environmentIntensity={0.5} />
        <axesHelper args={[5, 5, 5]} />
      </Canvas>
    </KeyboardControls>
  );
}
