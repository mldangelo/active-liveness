import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver } = vision;

const FaceLandmarkComponent = () => {
  const [faceLandmarker, setFaceLandmarker] = useState<any>();
  const [runningMode] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [webcamRunning] = useState<boolean>(false);
  const [videoWidth] = useState<number>(480);
  const [lastVideoTime, setLastVideoTime] = useState<number>(-1);
  const [results, setResults] = useState<any>();

  useEffect(() => {
    async function createFaceLandmarker() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      );
      const createdFaceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        },
      );

      setFaceLandmarker(createdFaceLandmarker);
    }

    createFaceLandmarker();
  }, []);

  // JSX Rendering
  return <div>{/* Any desired JSX components or elements */}</div>;
};

export default FaceLandmarkComponent;
