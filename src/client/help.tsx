import { h } from "preact";

const HelpMessage = ({ message }) => {
  return (
    <p className="position-text" id="helpMessage">
      {message}
    </p>
  );
};

export default HelpMessage;
