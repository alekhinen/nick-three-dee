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
const INPUT_THRESHOLD = 0.05;
const TWO_PI = Math.PI * 2;

const INTRO_HOLD_MS = 2000;
const INTRO_PAN_MS = 3000;
const INTRO_START_POS = new Vector3(6, 75, 0);
const INTRO_START_Y_ROTATION = Math.PI;
const INTRO_END_POS = new Vector3(-7, 6, 8);

const WORLD_UP = new Vector3(0, 1, 0);
const scratchOffset = new Vector3();
const scratchDelta = new Vector3();
const scratchStart = new Vector3();
const scratchSpherical = new Spherical();

type KeyName = "forward" | "back" | "left" | "right";

type Pose = {
  radius: number;
  phi: number;
  localTheta: number;
};

function wrapAngle(a: number): number {
  let x = a % TWO_PI;
  if (x > Math.PI) {
    x -= TWO_PI;
  }
  if (x < -Math.PI) {
    x += TWO_PI;
  }
  return x;
}

function lerpAngle(a: number, b: number, t: number): number {
  return a + wrapAngle(b - a) * t;
}

function easeInOutCubic(t: number): number {
  if (t < 0.5) {
    return 4 * t * t * t;
  }
  const f = 2 * t - 2;
  return 1 + (f * f * f) / 2;
}

function captureRestFromCamera(
  cameraPosition: Vector3,
  target: Vector3,
  truckYaw: number,
  out: Pose,
): void {
  scratchOffset.copy(cameraPosition).sub(target);
  scratchSpherical.setFromVector3(scratchOffset);
  out.radius = scratchSpherical.radius;
  out.phi = scratchSpherical.phi;
  out.localTheta = scratchSpherical.theta - truckYaw;
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

  const restPose = useRef<Pose>({
    radius: 10,
    phi: Math.PI * 0.4,
    localTheta: Math.PI,
  });
  const drivingPose = useRef<Pose>({
    radius: 10,
    phi: Math.PI * 0.4,
    localTheta: Math.PI,
  });

  const progress = useRef(0);
  const progressStart = useRef(0);
  const progressTarget = useRef(0);
  const progressStartMs = useRef(0);
  const dragging = useRef(false);
  const introStartMs = useRef<number | null>(null);

  useFrame((state) => {
    const root = truckRef.current?.root;
    const ctrl = controls.current;
    if (!root || !ctrl) {
      return;
    }

    const targetX = root.position.x + LOOK_OFFSET_X;
    const targetY = root.position.y + LOOK_HEIGHT;
    const targetZ = root.position.z + LOOK_OFFSET_Z;

    const nowMs = state.clock.elapsedTime * 1000;
    if (introStartMs.current === null) {
      introStartMs.current = nowMs;
    }
    const introElapsed = nowMs - introStartMs.current;
    if (introElapsed < INTRO_HOLD_MS + INTRO_PAN_MS) {
      ctrl.target.set(targetX, targetY, targetZ);
      scratchStart
        .copy(INTRO_START_POS)
        .sub(ctrl.target)
        .applyAxisAngle(WORLD_UP, INTRO_START_Y_ROTATION)
        .add(ctrl.target);
      if (introElapsed < INTRO_HOLD_MS) {
        camera.position.copy(scratchStart);
      } else {
        const t = Math.min(1, (introElapsed - INTRO_HOLD_MS) / INTRO_PAN_MS);
        const eased = easeInOutCubic(t);
        camera.position.lerpVectors(scratchStart, INTRO_END_POS, eased);
      }
      ctrl.enabled = false;
      ctrl.update();
      return;
    }

    if (!initialized.current) {
      ctrl.target.set(targetX, targetY, targetZ);
      initialized.current = true;
      captureRestFromCamera(
        camera.position,
        ctrl.target,
        root.rotation.y,
        restPose.current,
      );
      ctrl.update();
      return;
    }

    // Keep the orbit target glued to the truck; move camera with it so the
    // user's framing is preserved when the truck drives.
    scratchDelta.set(targetX, targetY, targetZ).sub(ctrl.target);
    ctrl.target.add(scratchDelta);
    camera.position.add(scratchDelta);

    const kb = get();
    const mobile = mobileInputRef.current;
    const kbDrive = (kb.forward ? 1 : 0) + (kb.back ? -1 : 0);
    const kbSteer = (kb.left ? 1 : 0) + (kb.right ? -1 : 0);
    const drive =
      Math.abs(kbDrive) >= Math.abs(mobile.drive) ? kbDrive : mobile.drive;
    const steer =
      Math.abs(kbSteer) >= Math.abs(mobile.steer) ? kbSteer : mobile.steer;
    const active =
      Math.abs(drive) > INPUT_THRESHOLD || Math.abs(steer) > INPUT_THRESHOLD;

    const desiredTarget = active ? 1 : 0;

    if (desiredTarget !== progressTarget.current) {
      // Freeze the current rest pose the moment we leave it, and snapshot
      // it as the driving pose too.
      if (progress.current <= 0.0001 && desiredTarget === 1) {
        captureRestFromCamera(
          camera.position,
          ctrl.target,
          root.rotation.y,
          restPose.current,
        );
        drivingPose.current.radius = restPose.current.radius;
        drivingPose.current.phi = restPose.current.phi;
        drivingPose.current.localTheta = restPose.current.localTheta;
      }
      progressStart.current = progress.current;
      progressTarget.current = desiredTarget;
      progressStartMs.current = nowMs;
    }

    if (panDurationMs > 0) {
      const elapsed = nowMs - progressStartMs.current;
      const t = Math.min(1, elapsed / panDurationMs);
      const eased = easeInOutCubic(t);
      progress.current =
        progressStart.current +
        (progressTarget.current - progressStart.current) * eased;
    } else {
      progress.current = progressTarget.current;
    }

    // User drag is always allowed; camera stays glued to the truck target.
    ctrl.enabled = true;

    const atRest = progress.current <= 0.0001 && progressTarget.current === 0;
    const atDrive = progress.current >= 0.9999 && progressTarget.current === 1;

    if (atRest) {
      captureRestFromCamera(
        camera.position,
        ctrl.target,
        root.rotation.y,
        restPose.current,
      );
      ctrl.update();
      return;
    }

    if (atDrive) {
      if (dragging.current) {
        // Active drag: sync both poses from the camera so the new framing
        // sticks as the driving lock and carries over to the next rest.
        captureRestFromCamera(
          camera.position,
          ctrl.target,
          root.rotation.y,
          drivingPose.current,
        );
        restPose.current.radius = drivingPose.current.radius;
        restPose.current.phi = drivingPose.current.phi;
        restPose.current.localTheta = drivingPose.current.localTheta;
      } else {
        // Idle: lock camera to the stored drivingPose.
        const drv = drivingPose.current;
        const worldTheta = drv.localTheta + root.rotation.y;
        scratchSpherical.set(drv.radius, drv.phi, worldTheta);
        scratchOffset.setFromSpherical(scratchSpherical);
        camera.position.copy(ctrl.target).add(scratchOffset);
      }
      ctrl.update();
      return;
    }

    // Mid-transition: interpolator briefly owns the camera.
    const p = progress.current;
    const rest = restPose.current;
    const drv = drivingPose.current;
    const radius = rest.radius + (drv.radius - rest.radius) * p;
    const phi = rest.phi + (drv.phi - rest.phi) * p;
    const localTheta = lerpAngle(rest.localTheta, drv.localTheta, p);
    const worldTheta = localTheta + root.rotation.y;

    scratchSpherical.set(radius, phi, worldTheta);
    scratchOffset.setFromSpherical(scratchSpherical);
    camera.position.copy(ctrl.target).add(scratchOffset);

    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minPolarAngle={0}
      maxPolarAngle={(Math.PI / 180) * 75}
      onStart={() => {
        dragging.current = true;
      }}
      onEnd={() => {
        dragging.current = false;
      }}
    />
  );
}
