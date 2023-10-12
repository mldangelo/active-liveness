import { h, render } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import * as vision from "@mediapipe/tasks-vision";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
import Instructions from "./instructions";
import CameraApp from "./camera";
import { hasGetUserMedia } from "./utils";

const HelpMessage = ({ message }) => {
  return (
    <p className="position-text" id="helpMessage">
      {message}
    </p>
  );
};

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

const root = document.getElementById("app");
if (root) {
  render(<App />, root);
} else {
  console.error("Could not find the root element to mount the app.");
}
