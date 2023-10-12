import { h } from "preact";

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

export default Instructions;
