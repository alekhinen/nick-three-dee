import { useRef, type RefObject } from "react";

export type MobileInputState = {
  drive: number;
  steer: number;
};

export type MobileInputRef = RefObject<MobileInputState>;

export function useMobileInputRef(): MobileInputRef {
  const ref = useRef<MobileInputState>({
    drive: 0,
    steer: 0,
  });
  return ref;
}
