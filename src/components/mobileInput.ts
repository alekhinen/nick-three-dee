import { useRef, type RefObject } from "react";

export type MobileInputState = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
};

export type MobileInputRef = RefObject<MobileInputState>;

export function useMobileInputRef(): MobileInputRef {
  const ref = useRef<MobileInputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
  });
  return ref;
}
