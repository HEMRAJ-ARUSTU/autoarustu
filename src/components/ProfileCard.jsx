import React, { useContext, useEffect, useState } from "react";
import { FaPersonCircleQuestion } from "react-icons/fa6";
import { toastifySuccess } from "../Utility/Utility";


const ProfileCard = () => {

    const Logout = () => {
        sessionStorage.removeItem("UserData");
        window.location.href = "/";
        toastifySuccess("Logout Successful");
    }


    return (
        <div className="w-[260px] mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
            <div className="py-4 flex flex-col divide-y divide-gray-100 text-gray-800 font-medium text-sm">
                <button className="flex items-center gap-4 px-5 py-3 text-red-500 hover:bg-red-50 transition w-full text-left" onClick={Logout}>
                    <FaPersonCircleQuestion className="text-xl flex-shrink-0" />
                    <span className="font-medium">logout</span>
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;
