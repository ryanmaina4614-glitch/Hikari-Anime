import { useEffect, useState } from "react";
import { getTrendingAnime } from "../api/anilist";
import AnimeCard from "../components/AnimeCard";

const Home = () => {
  const [anime, setAnime] = useState([]);

  useEffect(() => {
    getTrendingAnime().then(setAnime);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Trending Anime</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {anime.map(a => <AnimeCard key={a.id} anime={a} />)}
      </div>
    </div>
  );
};

export default Home;
