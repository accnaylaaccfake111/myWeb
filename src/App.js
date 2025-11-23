// frontend/src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationSystem from "./components/NavigationSystem";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MyProjects from "./pages/MyProjects";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DanceSimulation from "./pages/DanceSimulation";
import DanceScoring from "./pages/DanceScoring";
import DancingHandle from "./pages/DancingHandle";
import FaceSwap from "./pages/FaceSwap";
import LyricsComposition from "./pages/LyricsComposition";
import Karaoke from "./pages/Karaoke";
import CulturalHistory from "./pages/CulturalHistory";
import { storage } from "./utils/storage";
import DancePreview from "./pages/DancePreview";
import FeedBack from "./pages/FeedBack";
import Profile from "./pages/Profile";
import PageNotFound from "./pages/PageNotFound";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = (userData) => {
        setIsLoggedIn(storage.getAccessToken() !== null);
        setUser(storage.getUser());
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
        storage.clearAuthData();
    };

    useEffect(() => {
        setIsLoggedIn(storage.getAccessToken() !== null);
        setUser(storage.getUser());
    }, []);

    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* Routes sử dụng NavigationSystem layout */}
                <Route
                    path="/*"
                    element={
                        <NavigationSystem
                            isLoggedIn={isLoggedIn}
                            user={user}
                            onLogout={handleLogout}
                        />
                    }
                >
                    {/* Các route con sẽ được render trong Outlet của NavigationSystem */}
                    <Route index element={<Home />} />
                    <Route
                        path="cultural-history"
                        element={<CulturalHistory />}
                    />
                    <Route
                        path="my-projects"
                        element={<MyProjects isLoggedIn={isLoggedIn} />}
                    />
                    <Route path="help" element={<Help />} />
                    <Route
                        path="dancing"
                        element={<DancingHandle isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="dancing-scoring"
                        element={<DanceScoring isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="dancing-simulation"
                        element={<DanceSimulation isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="face-swap"
                        element={<FaceSwap isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="lyrics-composition"
                        element={<LyricsComposition isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="karaoke"
                        element={<Karaoke isLoggedIn={isLoggedIn} />}
                    />
                    <Route path="dancing-preview" element={<DancePreview />} />
                    <Route
                        path="feedback"
                        element={<FeedBack isLoggedIn={isLoggedIn} />}
                    />
                    <Route
                        path="profile"
                        element={<Profile setUser={setUser} />}
                    />
                    <Route
                        path="login"
                        element={<Login onLogin={handleLogin} />}
                    />
                    <Route path="register" element={<Register />} />
                    <Route path="*" element={<PageNotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
