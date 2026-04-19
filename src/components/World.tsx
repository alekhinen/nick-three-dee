import { Canvas } from "@react-three/fiber";
import { Environment, KeyboardControls } from "@react-three/drei";
import { useRef } from "react";
import { DumpTruckScene, type DumpTruckHandle } from "./DumpTruckScene";
import { Ground } from "./Ground";
import { MobileControls } from "./MobileControls";
import { SunLight } from "./SunLight";
import { TruckCamera } from "./TruckCamera";
import { TruckController } from "./TruckController";
import { useMobileInputRef } from "./mobileInput";

const cameraDefaultPosition = [0, 18, 14] as const;

const keyMap = [
  { name: "forward", keys: ["KeyW"] },
  { name: "back", keys: ["KeyS"] },
  { name: "left", keys: ["KeyA"] },
  { name: "right", keys: ["KeyD"] },
];

export function World() {
  const truckRef = useRef<DumpTruckHandle>(null);
  const mobileInputRef = useMobileInputRef();
  return (
    <KeyboardControls map={keyMap}>
      <Canvas camera={{ position: cameraDefaultPosition }} shadows="variance">
        <color attach="background" args={["#ffffff"]} />
        <DumpTruckScene ref={truckRef} />
        <TruckController truckRef={truckRef} mobileInputRef={mobileInputRef} />
        <TruckCamera truckRef={truckRef} mobileInputRef={mobileInputRef} />
        <SunLight />
        <Ground />
        <Environment preset="city" environmentIntensity={0.5} />
        {import.meta.env.DEV && <axesHelper args={[5]} />}
      </Canvas>
      <MobileControls inputRef={mobileInputRef} />
    </KeyboardControls>
  );
}
