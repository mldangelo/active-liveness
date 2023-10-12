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

export { hasGetUserMedia, checkAvailableCameras };
