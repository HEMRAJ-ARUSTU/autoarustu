import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toastifyError, toastifySuccess } from "../../Utility/Utility";
import { PostWithToken } from "../../ApiMethods/ApiMethods";

const Login = () => {
    const navigate = useNavigate();

    const url = window.location.origin;


    const [value, setValue] = useState({ UserName: "", Password: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [LoginStatus, setLoginStatus] = useState(true);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [mobileNo, setMobileNo] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const otpInputRefs = useRef([]);
    const isVerifyingRef = useRef(false);
    const lastVerifiedOtpRef = useRef("");

    const inputCls =
        "w-full rounded-lg border bg-white pl-11 pr-12 py-2.5 text-sm outline-none transition ";


    const handleChange = (e) => {
        setValue({
            ...value,
            [e.target.name]: e.target.value
        })
    }

    const Check_validate = () => {
        const newErrors = {};
        if (!value.UserName.trim()) {
            newErrors.UserName = "UserName is required";
        }
        if (!value.Password.trim()) {
            newErrors.Password = "Password is required";
        }



        setErrors(newErrors);
        if (Object.keys(newErrors)?.length === 0) {
            UserLogin();
        }
    };


    const UserLogin = async () => {
        try {
            setLoading(true);

            const val = {
                UserName: value?.UserName,
                Password: value?.Password,
                grant_type: "password",
            };

            const res = await axios.post(

                url === 'https://automation.arustu.com'
                    ? "https://automationapi.arustu.com/api/User/Login"
                    : "http://autoapi.arustu.com/api/User/Login",

                val);

            if (res?.data?.error_description == "Successfully Login" && res?.data?.error == 200) {
                sessionStorage.setItem("TempUserData", JSON.stringify(res.data));
                const userData = res.data;
                const mobileNumber = userData?.MobileNo || userData?.MobileNumber || "7990586879";
                // const mobileNumber = userData?.MobileNo || userData?.MobileNumber || "8890441033";
                setMobileNo(mobileNumber);
                await SendOTP(mobileNumber);

                setLoginStatus(false);
            } else {
                toastifyError("Invalid username or password");
            }
        } catch (error) {
            console.log(error);
            toastifyError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    const SendOTP = async (mobileNumber) => {
        try {
            const payload = {
                MobileNo: mobileNumber
            };
            const res = await PostWithToken("SMS/SendMessage", payload);
            if (res) {
                toastifySuccess("OTP sent successfully");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toastifyError("Failed to send OTP");
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value.replace(/[^0-9]/g, "");
        setOtp(newOtp);

        if (value && index < 3) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const otpString = otp.join("");
            if (otpString.length === 4) {
                VerifyOTP();
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
        const newOtp = [...otp];
        for (let i = 0; i < 4; i++) {
            newOtp[i] = pastedData[i] || "";
        }
        setOtp(newOtp);
        if (pastedData.length === 4) {
            otpInputRefs.current[3]?.focus();
        }
    };

    const VerifyOTP = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 4) {
            toastifyError("Please enter 4-digit OTP");
            return;
        }

        if (isVerifyingRef.current || otpString === lastVerifiedOtpRef.current) return;

        try {
            isVerifyingRef.current = true;
            lastVerifiedOtpRef.current = otpString;
            setOtpLoading(true);

            const payload = {
                MobileNo: mobileNo,
                OTP: otpString
            };

            const res = await PostWithToken("SMS/Check_Otp", payload);
            // console.log("OTP Verification Response:", res);
            if (res && res[0].Message == "OTP verified successfully") {
                const tempUserData = sessionStorage.getItem("TempUserData");
                if (tempUserData) {
                    const userData = JSON.parse(tempUserData);
                    userData.isOTPVerified = true;
                    sessionStorage.setItem("UserData", JSON.stringify(userData));
                    sessionStorage.removeItem("TempUserData");
                }

                toastifySuccess("OTP verified successfully");
                navigate("/dashboard");
            } else {
                toastifyError("Invalid OTP. Please try again.");
                setOtp(["", "", "", ""]);
                lastVerifiedOtpRef.current = "";
                otpInputRefs.current[0]?.focus();
            }

        } catch (error) {
            console.error("Error verifying OTP:", error);
            toastifyError("Failed to verify OTP. Please try again.");
            setOtp(["", "", "", ""]);
            lastVerifiedOtpRef.current = "";
            otpInputRefs.current[0]?.focus();
        } finally {
            setOtpLoading(false);

            isVerifyingRef.current = false;
        }
    };

    const handleResendOTP = async () => {
        try {
            setResendLoading(true);
            await SendOTP(mobileNo);
        } catch (error) {
            console.error("Error resending OTP:", error);
        } finally {
            setResendLoading(false);
        }
    };

    useEffect(() => {
        if (!LoginStatus && otpInputRefs.current[0]) {
            otpInputRefs.current[0]?.focus();
        }
    }, [LoginStatus]);

    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 4 &&
            !LoginStatus &&
            !otpLoading &&
            !isVerifyingRef.current &&
            otpString !== lastVerifiedOtpRef.current) {
            VerifyOTP();
        }

    }, [otp, LoginStatus]);

    useEffect(() => {
        const tempUserData = sessionStorage.getItem("TempUserData");
        if (tempUserData && LoginStatus) {
            try {
                const userData = JSON.parse(tempUserData);
                const mobileNumber = userData?.MobileNo || userData?.MobileNumber || "7990586879";
                setMobileNo(mobileNumber);
                setLoginStatus(false);
            } catch (error) {
                console.error("Error parsing TempUserData:", error);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
                {
                    LoginStatus ? (
                        <div className="p-6 md:p-8">
                            <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Sign in to continue to your dashboard
                            </p>

                            <form className="mt-6 space-y-4" autoComplete="off">
                                <input type="text" name="fake-user" autoComplete="username" hidden />
                                <input type="password" name="fake-pass" autoComplete="current-password" hidden />

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        UserName
                                    </label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="UserName"
                                            value={value.UserName}
                                            onChange={handleChange}
                                            placeholder="Enter username"
                                            autoComplete="off-district"

                                            className={`${inputCls} ${errors.UserName
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                                }`}
                                        />

                                    </div>
                                    {errors.UserName && (
                                        <p className="mt-1 text-xs text-red-500">{errors.UserName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                                        <input
                                            type={showPwd ? "text" : "password"}
                                            name="Password"
                                            value={value.Password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            autoComplete="off-district"

                                            className={`${inputCls} ${errors.Password
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-slate-300 focus:border-blue-600 focus"}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        >
                                            {showPwd ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {errors.Password && (
                                        <p className="mt-1 text-xs text-red-500">{errors.Password}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        Check_validate();
                                    }}
                                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>
                        </div>
                    )
                        :
                        (
                            <div className="p-6 md:p-8">
                                <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify OTP</h1>
                                <p className="text-sm text-slate-500 mb-8">
                                    We've sent a verification code to <strong className="text-slate-700">{mobileNo}</strong>
                                </p>

                                <div className="mb-6">
                                    <label className="mb-3 block text-sm font-medium text-slate-700 text-left">
                                        Enter 4-digit OTP
                                    </label>
                                    <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (otpInputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                autoComplete="off-district"

                                                className="w-16 h-16 text-center text-xl font-semibold rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={VerifyOTP}
                                    disabled={otpLoading || otp.join("").length !== 4}

                                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {otpLoading ? "Verifying..." : "Verify OTP"}
                                </button>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-600">
                                        Didn't receive code?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={resendLoading}
                                            className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60 underline"
                                        >
                                            {resendLoading ? "Sending..." : "Resend OTP"}
                                        </button>
                                    </p>
                                </div>

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {

                                            sessionStorage.removeItem("TempUserData");
                                            setLoginStatus(true);
                                            setOtp(["", "", "", ""]);
                                            lastVerifiedOtpRef.current = "";
                                        }}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        )
                }
            </div>
        </div>
    );
};

export default Login;