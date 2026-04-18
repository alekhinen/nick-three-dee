import { Canvas } from "@react-three/fiber";
import { KeyboardControls, Stage } from "@react-three/drei";
import { useRef } from "react";
import { DumpTruckScene, type DumpTruckHandle } from "./DumpTruckScene";
import { TruckController } from "./TruckController";
import { WorldCamera } from "./WorldCamera";

const cameraDefaultPosition = [-7, 6, 8] as const;

const keyMap = [
  { name: "forward", keys: ["KeyW"] },
  { name: "back", keys: ["KeyS"] },
];

export function World() {
  const truckRef = useRef<DumpTruckHandle>(null);
  return (
    <KeyboardControls map={keyMap}>
      <Canvas camera={{ position: cameraDefaultPosition }} shadows>
        <WorldCamera />
        <Stage
          adjustCamera={false}
          intensity={0.5}
          shadows="contact"
          environment="city"
        >
          <DumpTruckScene ref={truckRef} />
        </Stage>
        <TruckController truckRef={truckRef} />
      </Canvas>
    </KeyboardControls>
  );
}
