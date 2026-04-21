import { Canvas } from "@react-three/fiber";
import { Environment, KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";
import { DumpTruckScene, type DumpTruckHandle } from "./DumpTruckScene";
import { Ground } from "./Ground";
import { MobileControls } from "./MobileControls";
import { SunLight } from "./SunLight";
import { TruckCamera } from "./TruckCamera";
import { TruckController } from "./TruckController";
import { useMobileInputRef } from "./mobileInput";
import { RoadBarrier } from "./SceneObjects/RoadBarrier";
import { TreeOne } from "./SceneObjects/TreeOne";
import { TreeTwo } from "./SceneObjects/TreeTwo";
import { TreeThree } from "./SceneObjects/TreeThree";

const cameraDefaultPosition = [6, 75, 0] as const;
const TRUCK_GROUND_OFFSET = 0.89;

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
        <color attach="background" args={["white"]} />
        <Physics gravity={[0, -9.81, 0]} interpolate={false}>
          <DumpTruckScene
            ref={truckRef}
            position={[0, TRUCK_GROUND_OFFSET, 1]}
          />
          <TruckController truckRef={truckRef} mobileInputRef={mobileInputRef} />
          <Ground />
          <RoadBarrier rotation-y={Math.PI / 2} position={[-3, 0, 0]} />
          <RoadBarrier rotation-y={Math.PI / 2} position={[3, 0, 0]} />
          <RoadBarrier rotation-y={Math.PI / 2} position={[-3, 0, 4]} />
          <RoadBarrier rotation-y={Math.PI / 2} position={[3, 0, 4]} />
          <RoadBarrier rotation-y={Math.PI / 2} position={[-3, 0, 8]} />
          <RoadBarrier rotation-y={Math.PI / 2} position={[3, 0, 8]} />
          <TreeOne />
          <TreeTwo />
          <TreeThree />
        </Physics>
        <TruckCamera truckRef={truckRef} mobileInputRef={mobileInputRef} />
        <SunLight truckRef={truckRef} />
        <Environment preset="city" environmentIntensity={0.5} />
        {import.meta.env.DEV && <axesHelper args={[5]} />}
      </Canvas>
      <MobileControls inputRef={mobileInputRef} />
    </KeyboardControls>
  );
}
