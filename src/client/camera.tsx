import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
import { hasGetUserMedia } from "./utils";

let lastVideoTime = -1;
let results: any = undefined;
// const drawingUtils = new DrawingUtils(canvasCtx as CanvasRenderingContext2D);

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
  );
  return FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
}

const CameraApp = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blendShapesRef = useRef<HTMLUListElement>(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [blendShapes, setBlendShapes] = useState([]);

  const [faceLandmarker, setFaceLandmarker] = useState<any>();

  useEffect(() => {
    async function setupCamera() {
      let faceLandmarkerInstance = await createFaceLandmarker();
      setFaceLandmarker(faceLandmarkerInstance);

      if (hasGetUserMedia()) {
        enableCam(); // Enable camera on component mount.
      } else {
        console.warn("getUserMedia() is not supported by your browser");
      }
    }

    setupCamera();
  }, []);

  async function enableCam() {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    if (webcamRunning) {
      setWebcamRunning(false);
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track: any) => track.stop());
      }
      return;
    }

    try {
      const constraints = {
        video: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setWebcamRunning(true);
    } catch (error) {
      console.error("Error accessing the webcam:", error);
    }
  }

  return (
    <div className="camera-container">
      <section id="webcam-section" className="centered-section">
        <div id="liveView" className="videoView">
          <div className="camera-frame">
            <div className="overlay-left"></div>
            <div className="overlay-right"></div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="mirror"
            ></video>
            <canvas
              className="output_canvas"
              id="output_canvas"
              ref={canvasRef}
            ></canvas>
            <img
              src="icons/face_outline_icon.svg"
              alt="Face Outline"
              className="face-outline"
            />
          </div>
        </div>
        <div className="blend-shapes">
          <ul
            className="blend-shapes-list"
            id="video-blend-shapes"
            ref={blendShapesRef}
          ></ul>
        </div>
      </section>
    </div>
  );
};

export default CameraApp;
