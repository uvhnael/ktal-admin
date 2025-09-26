import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/dashboard/Dashboard";
import Project from "./pages/project/Project";
import Service from "./pages/service/Service";
import Contact from "./pages/contact/Contact";
import Blog from "./pages/blog/Blog";
import "./index.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-16"
            } pt-16`}
          >
            <div className="p-6">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Project />} />
                <Route path="/services" element={<Service />} />
                <Route path="/contacts" element={<Contact />} />
                <Route path="/blogs" element={<Blog />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
