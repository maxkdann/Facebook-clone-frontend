import { useEffect, useRef, useState } from "react";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";
import axios from "axios";
export default function Login2fa({
  setVisible,
  loginStep2VerificationToken,
  setAccess,
  setStep2Input,
}) {
  const popup = useRef(null);
  const [loading, setLoading] = useState(false);
  const [twofaToken, setToken] = useState(""); // State to hold the 6-digit code
  const [message, setMessage] = useState(""); // State to hold the 6-digit code
  const [verified, setVerified] = useState(false);
  const isMountedRef = useRef(true);

  useClickOutside(popup, () => {
    setVisible(false);
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false; // Set to false when component unmounts
    };
  }, []);

  const handleQRInput = (e) => {
    // Update the state with the 6-digit code entered by the user
    setToken(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/loginStep2`,
        {
          loginStep2VerificationToken,
          twofaToken,
        }
      );
      if (data.success && isMountedRef.current) {
        setAccess(true);
        setVisible(false);
        setStep2Input(data);
      }
    } catch (error) {
      console.error("Error in network request:", error); // Log any errors in the network request
      setMessage("An error occurred at handlebuttonclick inside login2fa");
    }
  };

  return (
    <div className="blur">
      <div className="postBox" ref={popup}>
        <div className="box_header">
          <div
            className="small_circle"
            onClick={() => {
              setVisible(false);
            }}
          >
            <i className="exit_icon"></i>
          </div>
          <span>Enter 2FA Code</span>
        </div>
        <div className="twofamessage">{message}</div>
        {/* Input field for the 6-digit code */}
        <div className="inputandbutton">
          {
            <>
              <input
                type="text"
                value={twofaToken}
                onChange={handleQRInput}
                placeholder="Enter 6-digit code"
                maxLength={6} // Limit input to 6 characters
              />
              <button onClick={handleButtonClick} type="submit">
                Submit
              </button>
            </>
          }
        </div>
      </div>
    </div>
  );
}
