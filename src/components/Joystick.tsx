import { useCallback, useEffect, useRef, type PointerEvent } from "react";

const TRACK_HEIGHT = 160;
const KNOB_SIZE = 32;
const MAX_TRAVEL = TRACK_HEIGHT / 2;
const DEAD_ZONE = 0.25;

export type JoystickValue = -1 | 0 | 1;

export function Joystick({
  onChange,
  ariaLabel,
}: {
  onChange: (v: JoystickValue) => void;
  ariaLabel: string;
}) {
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const baselineOffsetRef = useRef(0);
  const lastValueRef = useRef<JoystickValue>(0);

  const emit = useCallback(
    (v: JoystickValue) => {
      if (v !== lastValueRef.current) {
        lastValueRef.current = v;
        onChange(v);
      }
    },
    [onChange],
  );

  const setKnobOffset = (px: number) => {
    const knob = knobRef.current;
    if (!knob) {
      return;
    }
    knob.style.transform = `translateY(${px}px)`;
  };

  const readCurrentOffset = (): number => {
    const knob = knobRef.current;
    if (!knob) {
      return 0;
    }
    const matrix = new DOMMatrixReadOnly(getComputedStyle(knob).transform);
    return matrix.m42;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const knob = knobRef.current;
    if (!knob) {
      return;
    }
    const currentOffset = readCurrentOffset();
    knob.classList.remove("snapping");
    setKnobOffset(currentOffset);
    baselineOffsetRef.current = currentOffset;
    startYRef.current = e.clientY;
    knob.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const knob = knobRef.current;
    if (!knob || !knob.hasPointerCapture(e.pointerId)) {
      return;
    }
    const dy = e.clientY - startYRef.current;
    const raw = baselineOffsetRef.current + dy;
    const clamped = Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, raw));
    setKnobOffset(clamped);

    const normalized = -clamped / MAX_TRAVEL;
    if (normalized > DEAD_ZONE) {
      emit(1);
    } else if (normalized < -DEAD_ZONE) {
      emit(-1);
    } else {
      emit(0);
    }
  };

  const handlePointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const knob = knobRef.current;
    if (!knob) {
      return;
    }
    if (knob.hasPointerCapture(e.pointerId)) {
      knob.releasePointerCapture(e.pointerId);
    }
    emit(0);
    knob.classList.add("snapping");
    setKnobOffset(0);
  };

  useEffect(() => {
    return () => {
      lastValueRef.current = 0;
    };
  }, []);

  return (
    <div
      className="joystick"
      style={{ height: TRACK_HEIGHT, width: KNOB_SIZE }}
      aria-label={ariaLabel}
      role="slider"
    >
      <div className="joystick-track" />
      <div
        ref={knobRef}
        className="joystick-knob snapping"
        style={{ width: KNOB_SIZE, height: KNOB_SIZE }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />
    </div>
  );
}
