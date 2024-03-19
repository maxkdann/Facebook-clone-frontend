import { useEffect, useRef, useState } from "react";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";
import PulseLoader from "react-spinners/PulseLoader";
import { useSelector } from "react-redux";
import axios from "axios";
import LoginInput from "../inputs/loginInput";
export default function Enable2FA({ setVisible }) {
  const popup = useRef(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));
  const username = user.username;
  const [qrImageUrl, setQrImageUrl] = useState(null); // State to hold QR image URL
  const [sixDigitCode, setSixDigitCode] = useState(""); // State to hold the 6-digit code
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
          console.error("Failed to generate QR code:", data.message);
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
    setSixDigitCode(e.target.value);
  };

  const handleButtonClick = async () => {
    // Handle button click event
    const { response } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/verifyOtp`,
      {
        username,
        sixDigitCode,
      }
    );
    sixDigitCode = response.message;
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
          {/* Display QR code image if available */}
          {qrImageUrl && <img src={qrImageUrl} alt="QR Code" className="qr" />}
        </div>
        {/* Input field for the 6-digit code */}
        <div className="inputandbutton">
          <input
            type="text"
            value={sixDigitCode}
            onChange={handleQRInput}
            placeholder="Enter 6-digit code"
            maxLength={6} // Limit input to 6 characters
          />
          {/* Button for the user to click when they have entered their code */}
          <button onClick={handleButtonClick}>Submit</button>
        </div>
      </div>
    </div>
  );
}
