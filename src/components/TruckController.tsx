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

function maxMagnitude(a: number, b: number): number {
  return Math.abs(a) >= Math.abs(b) ? a : b;
}

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
    const body = handle.body;
    if (!body) {
      return;
    }
    const kb = get();
    const mobile = mobileInputRef.current;
    const kbDrive = (kb.forward ? 1 : 0) + (kb.back ? -1 : 0);
    const kbSteer = (kb.left ? 1 : 0) + (kb.right ? -1 : 0);
    const drive = maxMagnitude(kbDrive, mobile.drive);
    const steerInput = maxMagnitude(kbSteer, mobile.steer);

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

    if (drive !== 0) {
      const rollDelta = drive * WHEEL_SPEED * dt;
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
    }

    const q = body.rotation();
    const yaw = 2 * Math.atan2(q.y, q.w);
    const v = drive * TRUCK_SPEED;
    const yawRate = drive !== 0 ? (v * Math.tan(nextSteer)) / WHEELBASE : 0;
    const vx = Math.sin(yaw) * v;
    const vz = Math.cos(yaw) * v;
    body.setLinvel({ x: vx, y: 0, z: vz }, true);
    body.setAngvel({ x: 0, y: yawRate, z: 0 }, true);
  });

  return null;
}
