import { Link } from "react-router-dom";

const AnimeCard = ({ anime }) => {
  return (
    <Link to={`/anime/${anime.id}`}>
      <div className="relative group rounded-xl overflow-hidden bg-bgCard">

        <img src={anime.coverImage.large} />

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4">
          <h3 className="font-bold">{anime.title.romaji}</h3>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
