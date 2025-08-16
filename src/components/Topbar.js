import React from 'react';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30">
            <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    >
                        <svg
                            className="h-6 w-6"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <h1 className="ml-4 text-xl font-semibold text-gray-900">
                        Admin Panel
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <button className="p-2 text-gray-500 hover:text-gray-900 relative">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5h5V7h-5m-9 0H1l4 5-4 5h5m5-5h4" />
                            </svg>
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">admin@ktal.com</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">A</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
