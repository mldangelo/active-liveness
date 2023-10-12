import { h, render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
import Instructions from "./instructions";

let faceLandmarker: any;
let runningMode: "IMAGE" | "VIDEO" = "IMAGE";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoWidth = 480;
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
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
}

async function checkAvailableCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput",
    );

    let hasFrontCamera = false;
    let hasBackCamera = false;

    for (const device of videoDevices) {
      if (
        device.label.toLowerCase().includes("front") ||
        device.label.toLowerCase().includes("user")
      ) {
        hasFrontCamera = true;
      }
      if (
        device.label.toLowerCase().includes("back") ||
        device.label.toLowerCase().includes("environment")
      ) {
        hasBackCamera = true;
      }
    }

    return { hasFrontCamera, hasBackCamera };
  } catch (error) {
    console.error("Error accessing media devices:", error);
    return { hasFrontCamera: false, hasBackCamera: false };
  }
}

const CameraApp = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blendShapesRef = useRef<HTMLUListElement>(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [blendShapes, setBlendShapes] = useState([]);

  useEffect(() => {
    async function setupCamera() {
      await createFaceLandmarker();

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
            <video ref={videoRef} autoplay playsinline></video>
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

const HelpMessage = ({ message }) => {
  return (
    <p className="position-text" id="helpMessage">
      {message}
    </p>
  );
};

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

const App = () => {
  const [capture, startCapture] = useState<boolean>(false);
  const [helpMessage, setHelpMessage] = useState<string | undefined>(undefined);
  const supportsMediaDevices: boolean = hasGetUserMedia();

  useEffect(() => {
    if (!supportsMediaDevices) {
      setHelpMessage("Your browser doesn't support MediaDevices API.");
    }
  }, []);

  return (
    <div>
      {!capture ? <Instructions onClick={() => startCapture(true)} /> : null}
      {capture ? <CameraApp /> : null}
      {helpMessage && (
        <HelpMessage message="Please center your face in the frame" />
      )}
    </div>
  );
};

render(<App />, document.body);
