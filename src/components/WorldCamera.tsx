import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export function WorldCamera() {
  const { camera } = useThree();

  return (
    <CameraControls
      onEnd={() => {
        // This logs the precise values you need
        console.log("Position:", camera.position);
        // If you're using a specific target/lookAt:
        // console.log("Target:", controls.current.getTarget());
      }}
    />
  );
}
