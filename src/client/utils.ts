import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

let faceLandmarker: any;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";
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
const getRunningMode = () => runningMode;
const setRunningMode = async (mode: "IMAGE" | "VIDEO") => {
  runningMode = mode;
  await faceLandmarker.setOptions({ runningMode });
};

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
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

export {
  hasGetUserMedia,
  checkAvailableCameras,
  faceLandmarker,
  getRunningMode,
  setRunningMode,
};
