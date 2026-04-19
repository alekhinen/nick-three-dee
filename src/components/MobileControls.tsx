import { useEffect, useState } from "react";
import { Joystick, type JoystickValue } from "./Joystick";
import type { MobileInputRef } from "./mobileInput";
import "./MobileControls.css";

function shouldShowMobileControls(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("mobile") === "1") {
    return true;
  }
  return window.matchMedia("(pointer: coarse)").matches;
}

export function MobileControls({ inputRef }: { inputRef: MobileInputRef }) {
  const [visible, setVisible] = useState(shouldShowMobileControls);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = () => {
      setVisible(shouldShowMobileControls());
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  if (!visible) {
    return null;
  }

  const handleDrive = (v: JoystickValue) => {
    inputRef.current.forward = v === 1;
    inputRef.current.back = v === -1;
  };

  const handleSteer = (v: JoystickValue) => {
    inputRef.current.left = v === 1;
    inputRef.current.right = v === -1;
  };

  return (
    <div className="mobile-controls">
      <Joystick onChange={handleDrive} ariaLabel="Drive forward or back" />
      <Joystick onChange={handleSteer} ariaLabel="Steer left or right" />
    </div>
  );
}
