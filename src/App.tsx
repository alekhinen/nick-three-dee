import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import "./App.css";
import { World } from "./components/World";

const FADE_MS = 1000;

function App() {
  const { active } = useProgress();
  const hasLoaded = useRef(false);
  const [faded, setFaded] = useState(false);
  useEffect(() => {
    if (active) {
      hasLoaded.current = true;
      return;
    }
    if (hasLoaded.current) {
      setFaded(true);
    }
  }, [active]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <World />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "white",
          opacity: faded ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease-out`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default App;
