import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import type { RefObject } from "react";
import type { DumpTruckHandle } from "./DumpTruckScene";

const WHEEL_SPEED = 8;

type KeyName = "forward" | "back";

export function TruckController({
  truckRef,
}: {
  truckRef: RefObject<DumpTruckHandle | null>;
}) {
  const [, get] = useKeyboardControls<KeyName>();

  useFrame((_, dt) => {
    const handle = truckRef.current;
    if (!handle) {
      return;
    }
    const { forward, back } = get();
    const dir = forward ? 1 : back ? -1 : 0;
    if (dir === 0) {
      return;
    }
    const delta = dir * WHEEL_SPEED * dt;
    const { bl, br, fl, fr } = handle.wheels;
    if (bl) {
      bl.rotation.x += delta;
    }
    if (br) {
      br.rotation.x += delta;
    }
    if (fl) {
      fl.rotation.x += delta;
    }
    if (fr) {
      fr.rotation.x += delta;
    }
  });

  return null;
}
