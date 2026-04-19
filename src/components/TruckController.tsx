import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, type RefObject } from "react";
import { Quaternion, Vector3 } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";
import type { MobileInputRef } from "./mobileInput";
import { TRUCK_SURFACE_RADIUS } from "../world/constants";

const WHEEL_SPEED = 8;
const TRUCK_SPEED = 6.6;
const MAX_STEER = Math.PI / 6;
const STEER_RATE = MAX_STEER / 0.25;
const WHEELBASE = 2.486;

const UP_LOCAL = new Vector3(0, 1, 0);
const DRIVE_AXIS_LOCAL = new Vector3(-1, 0, 0);
const STEER_AXIS_LOCAL = new Vector3(0, 1, 0);

const qDrive = new Quaternion();
const qSteer = new Quaternion();
const upWorld = new Vector3();

type KeyName = "forward" | "back" | "left" | "right";

function maxMagnitude(a: number, b: number): number {
  if (Math.abs(a) >= Math.abs(b)) {
    return a;
  }
  return b;
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
    const root = handle.root;
    if (!root) {
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

      const v = drive * TRUCK_SPEED;
      const arc = (v * dt) / TRUCK_SURFACE_RADIUS;
      qDrive.setFromAxisAngle(DRIVE_AXIS_LOCAL, arc);
      root.quaternion.multiply(qDrive);

      const yawDelta = (v * Math.tan(nextSteer) * dt) / WHEELBASE;
      if (yawDelta !== 0) {
        qSteer.setFromAxisAngle(STEER_AXIS_LOCAL, yawDelta);
        root.quaternion.multiply(qSteer);
      }
      root.quaternion.normalize();
    }

    upWorld.copy(UP_LOCAL).applyQuaternion(root.quaternion);
    root.position.copy(upWorld).multiplyScalar(TRUCK_SURFACE_RADIUS);
  });

  return null;
}
