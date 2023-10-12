import { render, h } from "preact";
import { useState } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker: any;
let runningMode: "IMAGE" | "VIDEO" = "IMAGE";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoWidth = 480;

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
    runningMode,
    numFaces: 1,
  });
}
createFaceLandmarker();

const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
  "output_canvas",
) as HTMLCanvasElement;

const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById(
    "webcamButton",
  ) as HTMLButtonElement;
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "I'm Ready";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // getUsermedia parameters.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results: any = undefined;
const drawingUtils = new DrawingUtils(canvasCtx as CanvasRenderingContext2D);
async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" },
      );
    }
  }
  drawBlendShapes(videoBlendShapes as HTMLElement, results.faceBlendshapes);

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

function drawBlendShapes(el: HTMLElement, blendShapes: any[]) {
  if (!blendShapes.length) {
    return;
  }

  console.log(blendShapes[0]);

  let htmlMaker = "";
  blendShapes[0].categories.map((shape) => {
    htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${
          shape.displayName || shape.categoryName
        }</span>
        <span class="blend-shapes-value" style="width: calc(${
          +shape.score * 100
        }% - 120px)">${(+shape.score).toFixed(4)}</span>
      </li>
    `;
  });

  el.innerHTML = htmlMaker;
}

const Instructions = (props) => {
  return (
    <div className="smile-container">
      <img
        src="/icons/logo.svg"
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
            Hold your phone steady so the selfie is clear and sharp. Don’t take
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

const CameraContainer = () => {
  return (
    <div className="camera-container">
      <section id="webcam-section" className="centered-section">
        <div id="liveView" className="videoView">
          <div className="camera-frame">
            <video id="webcam" autoplay playsinline></video>
            <canvas className="output_canvas" id="output_canvas"></canvas>
            <img
              src="icons/face_outline_icon.svg"
              alt="Face Outline"
              className="face-outline"
            />
          </div>
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="video-blend-shapes"></ul>
        </div>
      </section>
      <p className="position-text" id="helpMessage" style={{ display: "none" }}>
        Position face within the outline
      </p>
    </div>
  );
};

const App = () => {
  const [capture, startCapture] = useState(false);
  return (
    <div>
      {!capture ? <Instructions onClick={() => startCapture(true)} /> : null}
      {capture ? <CameraContainer /> : null}
    </div>
  );
};

render(<App />, document.body);
