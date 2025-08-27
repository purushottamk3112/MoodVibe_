export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  spotifyUrl: string;
  imageUrl?: string;
  previewUrl?: string;
}

export interface RecommendationsResponse {
  detectedMood: string;
  songs: Song[];
}
