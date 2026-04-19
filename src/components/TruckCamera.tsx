import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import { Vector3 } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";
import type { MobileInputRef } from "./mobileInput";

const CAMERA_DISTANCE = 7;
const CAMERA_HEIGHT = 4.5;
const LOOK_HEIGHT = 0.8;
const DEFAULT_PAN_MS = 450;
const DRIVE_THRESHOLD = 0.05;
const TWO_PI = Math.PI * 2;

const up = new Vector3();
const forwardLocal = new Vector3(0, 0, 1);
const forwardWorld = new Vector3();
const cameraDir = new Vector3();
const lookTarget = new Vector3();

type KeyName = "forward" | "back" | "left" | "right";
type PanMode = "forward" | "back";

function shortestAngleDelta(from: number, to: number): number {
  let d = (to - from) % TWO_PI;
  if (d > Math.PI) {
    d -= TWO_PI;
  }
  if (d < -Math.PI) {
    d += TWO_PI;
  }
  return d;
}

function easeInOutCubic(t: number): number {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  const f = 2 * t - 2;
  return 1 + (f * f * f) / 2;
}

export function TruckCamera({
  truckRef,
  mobileInputRef,
  panDurationMs = DEFAULT_PAN_MS,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
  mobileInputRef: MobileInputRef;
  panDurationMs?: number;
}) {
  const camera = useThree((state) => state.camera);
  const [, get] = useKeyboardControls<KeyName>();
  const activeMode = useRef<PanMode>("forward");
  const panYaw = useRef(0);
  const panning = useRef(false);
  const panStartTimeMs = useRef(0);
  const panStartYaw = useRef(0);

  useFrame((state) => {
    const root = truckRef.current?.root;
    if (!root) {
      return;
    }

    up.copy(root.position).normalize();
    forwardWorld.copy(forwardLocal).applyQuaternion(root.quaternion);
    forwardWorld.addScaledVector(up, -forwardWorld.dot(up));
    if (forwardWorld.lengthSq() < 1e-8) {
      return;
    }
    forwardWorld.normalize();

    const kb = get();
    const mobile = mobileInputRef.current;
    const kbDrive = (kb.forward ? 1 : 0) + (kb.back ? -1 : 0);
    const drive =
      Math.abs(kbDrive) >= Math.abs(mobile.drive) ? kbDrive : mobile.drive;

    const nextMode: PanMode | null =
      drive > DRIVE_THRESHOLD
        ? "forward"
        : drive < -DRIVE_THRESHOLD
          ? "back"
          : null;

    const nowMs = state.clock.elapsedTime * 1000;

    if (nextMode !== null && nextMode !== activeMode.current) {
      panStartYaw.current = panYaw.current;
      panStartTimeMs.current = nowMs;
      panning.current = true;
      activeMode.current = nextMode;
    }

    const targetYaw = activeMode.current === "forward" ? 0 : Math.PI;
    if (panning.current) {
      const elapsed = nowMs - panStartTimeMs.current;
      const t = panDurationMs > 0 ? Math.min(1, elapsed / panDurationMs) : 1;
      const eased = easeInOutCubic(t);
      const diff = shortestAngleDelta(panStartYaw.current, targetYaw);
      panYaw.current = panStartYaw.current + diff * eased;
      if (t >= 1) {
        panning.current = false;
        panYaw.current = targetYaw;
      }
    } else {
      panYaw.current = targetYaw;
    }

    cameraDir
      .copy(forwardWorld)
      .multiplyScalar(-1)
      .applyAxisAngle(up, panYaw.current);

    camera.position
      .copy(root.position)
      .addScaledVector(up, CAMERA_HEIGHT)
      .addScaledVector(cameraDir, CAMERA_DISTANCE);
    camera.up.copy(up);
    lookTarget.copy(root.position).addScaledVector(up, LOOK_HEIGHT);
    camera.lookAt(lookTarget);
  });

  return null;
}
