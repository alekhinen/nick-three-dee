import { OrbitControls, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { ComponentRef, RefObject } from "react";
import { Spherical, Vector3 } from "three";
import type { DumpTruckHandle } from "./DumpTruckScene";
import type { MobileInputRef } from "./mobileInput";

const LOOK_HEIGHT = 0.5;
const LOOK_OFFSET_X = 0;
const LOOK_OFFSET_Z = -0.3;
const DEFAULT_PAN_MS = 450;
const DRIVE_THRESHOLD = 0.05;
const TWO_PI = Math.PI * 2;

const delta = new Vector3();
const offset = new Vector3();
const spherical = new Spherical();

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
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const initialized = useRef(false);
  const camera = useThree((state) => state.camera);
  const [, get] = useKeyboardControls<KeyName>();
  const activeMode = useRef<PanMode | null>(null);
  const panning = useRef(false);
  const panStartTimeMs = useRef(0);
  const panStartAzimuth = useRef(0);

  useFrame((state) => {
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

    if (nextMode === null) {
      activeMode.current = null;
      panning.current = false;
    } else if (nextMode !== activeMode.current) {
      offset.copy(camera.position).sub(ctrl.target);
      spherical.setFromVector3(offset);
      panStartAzimuth.current = spherical.theta;
      panStartTimeMs.current = nowMs;
      panning.current = true;
      activeMode.current = nextMode;
    }

    const mode = activeMode.current;
    if (mode) {
      const desiredAzimuth = root.rotation.y + Math.PI;

      let nextAzimuth: number;
      if (panning.current) {
        const elapsed = nowMs - panStartTimeMs.current;
        const t = panDurationMs > 0 ? Math.min(1, elapsed / panDurationMs) : 1;
        const eased = easeInOutCubic(t);
        const startAz = panStartAzimuth.current;
        const diff = shortestAngleDelta(startAz, desiredAzimuth);
        nextAzimuth = startAz + diff * eased;
        if (t >= 1) {
          panning.current = false;
        }
      } else {
        nextAzimuth = desiredAzimuth;
      }

      offset.copy(camera.position).sub(ctrl.target);
      spherical.setFromVector3(offset);
      spherical.theta = nextAzimuth;
      offset.setFromSpherical(spherical);
      camera.position.copy(ctrl.target).add(offset);
    }

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
