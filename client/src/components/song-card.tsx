import { motion } from "framer-motion";
import { Song } from "@/types/music";
import { ExternalLink, Play } from "lucide-react";

interface SongCardProps {
  song: Song;
  index: number;
}

export function SongCard({ song, index }: SongCardProps) {
  const handleSpotifyClick = () => {
    window.open(song.spotifyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
      }}
      className="song-card glass-card rounded-2xl p-6 group cursor-pointer"
      data-testid={`song-card-${song.id}`}
    >
      {song.imageUrl ? (
        <img
          src={song.imageUrl}
          alt={`Album cover for ${song.album}`}
          className="w-full aspect-square rounded-xl mb-4 object-cover shadow-md"
        />
      ) : (
        <div className="w-full aspect-square rounded-xl mb-4 bg-muted flex items-center justify-center shadow-md">
          <Play className="w-16 h-16 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground text-lg leading-tight line-clamp-2">
          {song.name}
        </h4>
        <p className="text-muted-foreground">{song.artist}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{song.album}</p>

        <motion.button
          onClick={handleSpotifyClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
          data-testid={`spotify-button-${song.id}`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Play on Spotify</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
