import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import AnimeDetails from "./pages/AnimeDetails";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="bg-bgMain min-h-screen text-white relative overflow-hidden">

        <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary opacity-20 blur-3xl rounded-full"></div>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
