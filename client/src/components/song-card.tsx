import { motion } from "framer-motion";
import { Song } from "@/types/music";
import { ExternalLink, Play, Heart, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface SongCardProps {
  song: Song;
  index: number;
}

export function SongCard({ song, index }: SongCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleSpotifyClick = () => {
    window.open(song.spotifyUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${song.name} by ${song.artist}`,
        text: `Check out this amazing song: ${song.name} by ${song.artist}`,
        url: song.spotifyUrl,
      });
    } else {
      navigator.clipboard.writeText(song.spotifyUrl);
    }
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
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="song-card glass-card rounded-2xl p-6 group cursor-pointer relative overflow-hidden border border-border/20 hover:border-primary/30"
      data-testid={`song-card-${song.id}`}
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      {/* Album Cover with Overlay Controls */}
      <div className="relative mb-6 group/cover">
        {song.imageUrl ? (
          <motion.img
            src={song.imageUrl}
            alt={`Album cover for ${song.album}`}
            className="w-full aspect-square rounded-xl object-cover shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.div 
            className="w-full aspect-square rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Play className="w-16 h-16 text-muted-foreground" />
          </motion.div>
        )}
        
        {/* Overlay Controls */}
        <motion.div
          className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover/cover:opacity-100"
          transition={{ duration: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={handleSpotifyClick}
          >
            <Play className="w-8 h-8 ml-1" />
          </motion.button>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
              isLiked 
                ? 'bg-red-500/80 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Song Info */}
      <div className="relative z-10 space-y-4">
        <div>
          <motion.h4 
            className="font-bold text-foreground text-xl leading-tight line-clamp-2 mb-2"
            animate={{ color: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
            transition={{ duration: 0.2 }}
          >
            {song.name}
          </motion.h4>
          <p className="text-muted-foreground font-medium text-lg">{song.artist}</p>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{song.album}</p>
        </div>

        {/* Enhanced Spotify Button */}
        <motion.button
          onClick={handleSpotifyClick}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl relative overflow-hidden"
          data-testid={`spotify-button-${song.id}`}
        >
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <ExternalLink className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Play on Spotify</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
