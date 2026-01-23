import React, { useRef, useState } from "react";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifyError, toastifySuccess } from "../../Utility/Utility";

const DeleteOtpModal = ({ open, mobileNo, onVerify, onClose }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  if (!open) return null;

  const handleChange = (i, v) => {
    const newOtp = [...otp];
    newOtp[i] = v.replace(/\D/, "");
    setOtp(newOtp);
    if (v && i < 3) inputs.current[i + 1].focus();
  };

  const verifyOtp = async () => {
    const otpVal = otp.join("");
    if (otpVal.length !== 4) return toastifyError("Enter 4 digit OTP");

    const res = await PostWithToken("SMS/Check_Otp", {
      MobileNo: "7990586879",
      OTP: otpVal,
    });

    if (res?.[0]?.Message === "OTP verified successfully") {
      toastifySuccess("OTP Verified");
      onVerify();
      onClose();
    } else {
      toastifyError("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Verify OTP</h3>

        <div className="flex gap-2 justify-center mb-4">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-12 h-12 text-center border rounded"
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={verifyOtp}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOtpModal;
