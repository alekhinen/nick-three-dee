import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { ComponentRef, RefObject } from "react";
import { Vector3 } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";

const LOOK_HEIGHT = 0.5;
const LOOK_OFFSET_X = 0;
const LOOK_OFFSET_Z = -0.6;

const delta = new Vector3();

export function TruckCamera({
  truckRef,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const initialized = useRef(false);
  const camera = useThree((state) => state.camera);

  useFrame(() => {
    const root = truckRef.current?.root;
    const ctrl = controls.current;
    if (!root || !ctrl) {
      return;
    }
    if (!initialized.current) {
      ctrl.target.set(
        root.position.x + LOOK_OFFSET_X,
        root.position.y + LOOK_HEIGHT,
        root.position.z + LOOK_OFFSET_Z,
      );
      initialized.current = true;
      ctrl.update();
      return;
    }
    delta.set(
      root.position.x + LOOK_OFFSET_X,
      root.position.y + LOOK_HEIGHT,
      root.position.z + LOOK_OFFSET_Z,
    );
    delta.sub(ctrl.target);
    ctrl.target.add(delta);
    camera.position.add(delta);
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minPolarAngle={0}
      maxPolarAngle={(Math.PI / 180) * 75}
    />
  );
}
