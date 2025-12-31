import React, { useEffect, useRef, useState } from "react";
import { FiMenu, FiSearch, FiBell, FiMail, FiSun, FiCalendar, FiClock } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileCard from "./ProfileCard";

const Topbar = ({ onMenuClick, isSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const profileRef = useRef(null);

    const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getPageTitle = () => {
        if (location.pathname.includes("/agent")) return "Agents";
        if (location.pathname.includes("/supplier")) return "Suppliers";
        if (location.pathname.includes("/contact")) return "Contacts";
        if (location.pathname.includes("/bill")) return "Bills";
        if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") return "Dashboard";
        return "Dashboard";
    };

    // const formatTime = (date) => {
    //     return date.toLocaleTimeString("en-US", {
    //         hour: "2-digit",
    //         minute: "2-digit",
    //         second: "2-digit",
    //         hour12: true,
    //     });
    // };

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };



    return (
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-2 sm:px-3 md:px-4 lg:px-6 shadow-sm gap-1 sm:gap-2">
            {/* Left Side - Menu & Title */}
            <div className="flex items-center min-w-0 gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
                <button
                    onClick={onMenuClick}
                    className="inline-flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 flex-shrink-0"
                    aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <FiMenu className="text-base sm:text-lg md:text-xl" />
                </button>
                {isSidebarOpen ? null : (
                    isDashboard ? (
                        <h1 className="text-4xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-slate-800 truncate">
                            {getPageTitle()}
                        </h1>
                    ) : (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-4xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors cursor-pointer"
                            title="Go to Dashboard"
                        >
                            {getPageTitle()}
                        </button>
                    )
                )}
            </div>

            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:block relative mx-1 sm:mx-2 md:mx-4 flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl min-w-0">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
                    <FiSearch className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="block w-full rounded-lg border-0 bg-slate-100 py-1.5 sm:py-2 pl-7 sm:pl-9 md:pl-10 pr-2 sm:pr-3 md:pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-500 transition-colors duration-200
             outline-none focus:outline-none focus:border-0
             focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Right Side Icons - All visible on mobile with compact size */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 flex-shrink-0">
                {/* Date - Visible on mobile with text, also on desktop */}
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 bg-slate-50 rounded-lg">
                    <FiCalendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-600" />
                    <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-600 font-medium">{formatDate(currentTime)}</span>
                </div>
                
                {/* Time - Hidden on mobile, visible on tablet+ */}
                {/* <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 bg-slate-50 rounded-lg">
                    <FiClock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-600" />
                    <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-600 font-medium">{formatTime(currentTime)}</span>
                </div> */}

                {/* <button className="inline-flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                    <FiSun className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                    <span className="sr-only">Toggle theme</span>
                </button> */}

                <button className="relative inline-flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                    <FiMail className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                    <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 md:right-1.5 md:top-1.5 lg:right-2 lg:top-2 h-1.5 w-1.5 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-red-500">
                        <span className="absolute -inset-0.5 sm:-inset-1 animate-ping rounded-full bg-red-500 opacity-75"></span>
                    </span>
                    <span className="sr-only">View notifications</span>
                </button>

                <button className="relative inline-flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                    <FiBell className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                    <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 md:right-1.5 md:top-1.5 lg:right-2 lg:top-2 h-1.5 w-1.5 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-blue-500"></span>
                    <span className="sr-only">View messages</span>
                </button>

                <div className="relative" ref={profileRef}>
                    {/* Avatar */}
                    <div
                        className="ml-1 sm:ml-2 h-8 w-8 sm:h-10 sm:w-10 cursor-pointer overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm"
                        onClick={() => setShowProfile(prev => !prev)}
                    >
                        <div className="flex h-full items-center justify-center text-xs sm:text-sm font-medium text-blue-600">
                            JD
                        </div>
                    </div>

                    {/* Dropdown */}
                    {showProfile && (
                        <div className="absolute right-0 top-11 sm:top-12 z-50">
                            <ProfileCard />
                        </div>
                    )}
                </div>



            </div>
        </header>
    );
}

function IconBtn({ children, dot }) {
    return (
        <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100">
            {dot && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />}
            {children}
        </button>
    );
}


export default Topbar;