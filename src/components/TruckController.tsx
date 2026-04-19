import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, type RefObject } from "react";
import type { DumpTruckHandle } from "./DumpTruckScene";
import type { MobileInputRef } from "./mobileInput";

const WHEEL_SPEED = 8;
const TRUCK_SPEED = 6.6;
const MAX_STEER = Math.PI / 6;
const STEER_RATE = MAX_STEER / 0.25;
const WHEELBASE = 2.486;

type KeyName = "forward" | "back" | "left" | "right";

export function TruckController({
  truckRef,
  mobileInputRef,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
  mobileInputRef: MobileInputRef;
}) {
  const [, get] = useKeyboardControls<KeyName>();
  const steerAngleRef = useRef(0);

  useFrame((_, dt) => {
    const handle = truckRef.current;
    if (!handle) {
      return;
    }
    const kb = get();
    const mobile = mobileInputRef.current;
    const forward = kb.forward || mobile.forward;
    const back = kb.back || mobile.back;
    const left = kb.left || mobile.left;
    const right = kb.right || mobile.right;

    const dir = forward ? 1 : back ? -1 : 0;
    const steerInput = left ? 1 : right ? -1 : 0;

    const targetSteer = steerInput * MAX_STEER;
    const currentSteer = steerAngleRef.current;
    const maxStep = STEER_RATE * dt;
    const diff = targetSteer - currentSteer;
    const step = Math.max(-maxStep, Math.min(maxStep, diff));
    const nextSteer = currentSteer + step;
    steerAngleRef.current = nextSteer;

    const { bl, br, fl, fr } = handle.wheels;
    if (fl) {
      fl.rotation.order = "ZYX";
      fl.rotation.z = nextSteer;
    }
    if (fr) {
      fr.rotation.order = "ZYX";
      fr.rotation.z = nextSteer;
    }

    if (dir !== 0) {
      const rollDelta = dir * WHEEL_SPEED * dt;
      if (bl) {
        bl.rotation.x += rollDelta;
      }
      if (br) {
        br.rotation.x += rollDelta;
      }
      if (fl) {
        fl.rotation.x += rollDelta;
      }
      if (fr) {
        fr.rotation.x += rollDelta;
      }

      if (handle.root) {
        const v = dir * TRUCK_SPEED;
        handle.root.rotation.y += (v * Math.tan(nextSteer) * dt) / WHEELBASE;
        const yaw = handle.root.rotation.y;
        handle.root.position.x += Math.sin(yaw) * v * dt;
        handle.root.position.z += Math.cos(yaw) * v * dt;
      }
    }
  });

  return null;
}
