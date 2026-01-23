import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuClick = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSidebarClose = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
                    onClick={handleSidebarClose}
                />
            )}

            <div
                className={`${
                    isMobile
                        ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                          }`
                        : `${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`
                }`}
            >
                <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                isMobile && sidebarOpen ? 'backdrop-blur-sm' : ''
            }`}>
                <Topbar
                    onMenuClick={handleMenuClick}
                    isSidebarOpen={sidebarOpen}
                />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-2 sm:p-3 md:p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Dashboard