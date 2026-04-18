import { Canvas } from "@react-three/fiber";
import { DumpTruckScene } from "./DumpTruckScene";
import { Stage } from "@react-three/drei";
import { WorldCamera } from "./WorldCamera";

const cameraDefaultPosition = [-7, 6, 8] as const;

export function World() {
  return (
    <Canvas camera={{ position: cameraDefaultPosition }} shadows>
      <WorldCamera />
      <Stage
        adjustCamera={false}
        intensity={0.5}
        shadows="contact"
        environment="city"
      >
        <DumpTruckScene />
      </Stage>
    </Canvas>
  );
}
