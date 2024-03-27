import { Formik, Form } from "formik";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import LoginInput from "../../components/inputs/loginInput";
import Login2fa from "../2FA/login2fa";
import { useState, useEffect } from "react";
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
const loginInfos = {
  email: "",
  password: "",
};
export default function LoginForm({ setVisible }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, setLogin] = useState(loginInfos);
  const [access, setAccess] = useState(false);
  const { email, password } = login;
  const [loginStep2VerificationToken, setLoginStep2VerificationToken] =
    useState("");
  const [showInput, setShowInput] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [step2Input, setStep2Input] = useState(null);
  const [loginInput, setLoginInput] = useState("");
  const [token, setToken] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLogin({ ...login, [name]: value });
  };
  const loginValidation = Yup.object({
    email: Yup.string()
      .required("Email address is required.")
      .email("Must be a valid email.")
      .max(100),
    password: Yup.string().required("Password is required"),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        {
          email,
          password,
        }
      );
      setLoginInput(data);
      setLoginStep2VerificationToken(data.loginStep2VerificationToken);
      setToken(data.token);
      if (data.twofaEnabled) {
        setVisible2(true);
        if (!access) {
          setShowInput(true);
        }
      } else {
        //no 2 fa, just allow access
        dispatch({ type: "LOGIN", payload: data });
        Cookies.set("user", JSON.stringify(data));
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      setError(error.response.data.message);
    }
  };

  useEffect(() => {
    if (step2Input !== null) {
      // Perform login after step2Input is set
      dispatch({ type: "LOGIN", payload: step2Input });
      Cookies.set("user", JSON.stringify(step2Input));
      navigate("/");
    }
  }, [step2Input]); // Watch for changes in step2Input

  return (
    <div className="login_wrap">
      <div className="login_1">
        <img src="../../icons/facebook.svg" alt="" />
        <span>Dummy site built for CP400S.</span>
      </div>
      <div className="login_2">
        <div className="login_2_wrap">
          <Formik
            enableReinitialize
            initialValues={{
              email,
              password,
            }}
            validationSchema={loginValidation}
            onSubmit={() => {
              loginSubmit();
            }}
          >
            {(formik) => (
              <Form>
                <LoginInput
                  type="text"
                  name="email"
                  placeholder="Email address or phone number"
                  onChange={handleLoginChange}
                />
                <LoginInput
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleLoginChange}
                  bottom
                />
                <button type="submit" className="blue_btn">
                  Log In
                </button>
              </Form>
            )}
          </Formik>
          {visible2 && showInput && (
            <Login2fa
              setVisible={setVisible2}
              loginStep2VerificationToken={loginStep2VerificationToken}
              setAccess={setAccess}
              setStep2Input={setStep2Input}
              token={token}
            />
          )}

          <Link to="/reset" className="forgot_password">
            Forgotten password?
          </Link>
          <DotLoader color="#1876f2" loading={loading} size={30} />

          {error && <div className="error_text">{error}</div>}
          <div className="sign_splitter"></div>
          <button
            className="blue_btn open_signup"
            onClick={() => setVisible(true)}
          >
            Create Account
          </button>
        </div>
        <Link to="/" className="sign_extra">
          <b>Create a Page</b> for a celebrity, brand or business.
        </Link>
      </div>
    </div>
  );
}
