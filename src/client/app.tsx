import { h, render, Fragment } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

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

const Instructions = (props) => {
  return (
    <div className="smile-container">
      <img
        src="/icons/si_smart_selfie_instructions_hero.svg"
        alt="Smile Identity Logo"
        className="smile-logo"
      />
      <h2>Next, we'll take a quick selfie</h2>
      <p>
        We'll use it to verify your Identity. Please follow the instructions
        below.
      </p>

      <div className="smile-instructions">
        <div className="instruction">
          <img src="icons/good_light_icon.svg" alt="Good Light" />
          <p>
            Make sure you are in a well-lit environment where your face is clear
            and visible.
          </p>
        </div>
        <div className="instruction">
          <img src="icons/clear_image_icon.svg" alt="Clear Image" />
          <p>
            Hold your phone steady so the selfie is clear and sharp. Don't take
            blurry images.
          </p>
        </div>
        <div className="instruction">
          <img
            src="icons/remove_obstructions_icon.svg"
            alt="Remove Obstructions"
          />
          <p>
            Remove anything that covers your face, such glasses, masks, hats,
            and scarves.
          </p>
        </div>
      </div>
      <button className="smile-button" onClick={props.onClick}>
        I'm Ready
      </button>
      <div className="powered-by">
        <p>
          Powered by{" "}
          <span>
            <a href="https://usesmileid.com/">SmileID</a>
          </span>
        </p>
      </div>
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
