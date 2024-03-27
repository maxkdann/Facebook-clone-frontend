import { useEffect, useRef, useState } from "react";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";
import { useSelector } from "react-redux";
import axios from "axios";
export default function Enable2FA({ setVisible }) {
  const popup = useRef(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));
  const username = user.username;
  const [qrImageUrl, setQrImageUrl] = useState(null); // State to hold QR image URL
  const [token, setToken] = useState(""); // State to hold the 6-digit code
  const [message, setMessage] = useState(""); // State to hold the 6-digit code
  const [verified, setVerified] = useState(false);
  useClickOutside(popup, () => {
    setVisible(false);
  });

  useEffect(() => {
    // Function to fetch QR code image URL from backend
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/generate2faSecret`,
          {
            username,
          }
        );
        if (data.success) {
          setQrImageUrl(data.qrImageDataUrl);
        } else {
          setMessage(data.message);
          setVerified(true);
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, []); // Run only once on component mount

  const handleQRInput = (e) => {
    // Update the state with the 6-digit code entered by the user
    setToken(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/verifyOtp`,
        {
          username,
          token,
        }
      );
      if (data.twofaEnabled) {
        setVerified(true);
      }
      setMessage(data.message);
    } catch (error) {
      console.error("Error in network request:", error); // Log any errors in the network request
      setMessage("An error occurred. Please try again later.");
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
          <span>Enable 2FA</span>
        </div>

        <div className="box_profile">
          {!verified && qrImageUrl && (
            <img src={qrImageUrl} alt="QR Code" className="qr" />
          )}
        </div>
        <div className="twofamessage">{message}</div>
        {/* Input field for the 6-digit code */}
        <div className="inputandbutton">
          {message == "" && (
            <>Scan this code with your favourite mobile authenticator app.</>
          )}

          {!verified && (
            <>
              <input
                type="text"
                value={token}
                onChange={handleQRInput}
                placeholder="Enter 6-digit code"
                maxLength={6} // Limit input to 6 characters
              />
              <button onClick={handleButtonClick} type="submit">
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
