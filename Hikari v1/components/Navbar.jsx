import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-bgCard">

      <h1 className="text-2xl font-bold">
        <span className="text-primary">Hikari</span>{" "}
        <span className="text-accentYellow">Anime</span>
      </h1>

      <div className="flex gap-6 text-textSecondary">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/profile">Profile</Link>
      </div>

      <Link to="/login" className="bg-primary px-4 py-2 rounded-lg">
        Sign In
      </Link>
    </nav>
  );
};

export default Navbar;
