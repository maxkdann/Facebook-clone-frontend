import { useEffect, useRef, useState } from "react";
import "./style.css";
import useClickOutside from "../../helpers/clickOutside";
import PulseLoader from "react-spinners/PulseLoader";
import { useSelector } from "react-redux";
import axios from "axios";
export default function Enable2FA({ setVisible }) {
  const popup = useRef(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => ({ ...state }));
  const email = user.email;
  const [qrImageUrl, setQrImageUrl] = useState(null); // State to hold QR image URL
  useClickOutside(popup, () => {
    setVisible(false);
  });

  useEffect(() => {
    // Function to fetch QR code image URL from backend
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/generateQR`,
          {
            email,
          }
        );
        if (data.success) {
          setQrImageUrl(data.image);
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
          {qrImageUrl && <img src={qrImageUrl} alt="QR Code" />}
        </div>

        <button className="post_submit" onClick={() => {}} disabled={loading}>
          {loading ? <PulseLoader color="#fff" size={5} /> : "Post"}
        </button>
      </div>
    </div>
  );
}
