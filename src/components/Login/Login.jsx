import axios from "axios";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toastifyError, toastifySuccess } from "../../Utility/Utility";

const Login = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState({ UserName: "", Password: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);

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
        // else if (value.Password.length < 5) {
        //     newErrors.Password = "Password must be at least 5 characters";
        // }
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
                // "UserName": "Admin",
                // "Password": "Admin@12345",
                // "grant_type": "password"

            };

            const res = await axios.post("http://autoapi.arustu.com/api/User/Login", val);
            // console.log(res?.data);

            if (res?.data?.error_description == "Successfully Login" && res?.data?.error == 200) {
                navigate("/dashboard");
                localStorage.setItem("UserData", JSON.stringify(res.data));
                toastifySuccess("Login Successful");
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
                <div className="p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sign in to continue to your dashboard
                    </p>

                    <form className="mt-6 space-y-4">
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
                                    autoComplete="Off"
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
            </div>
        </div>
    );
};

export default Login;