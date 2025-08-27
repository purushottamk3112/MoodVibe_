import axios from "axios";
import { Song } from "@shared/schema";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async searchTracks(keywords: string[]): Promise<Song[]> {
    try {
      const accessToken = await this.getAccessToken();
      const query = keywords.join(' OR ');

      const response = await axios.get<SpotifySearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          params: {
            q: query,
            type: 'track',
            limit: 20,
            market: 'US',
          },
        }
      );

      const tracks = response.data.tracks.items;
      
      // Remove duplicates and take first 6 tracks
      const uniqueTracks = tracks
        .filter((track, index, self) => 
          index === self.findIndex(t => t.name === track.name && t.artists[0]?.name === track.artists[0]?.name)
        )
        .slice(0, 6);

      return uniqueTracks.map(track => {
        const song: Song = {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          album: track.album.name,
          spotifyUrl: track.external_urls.spotify,
        };

        if (track.album.images[0]?.url) {
          song.imageUrl = track.album.images[0].url;
        }

        if (track.preview_url) {
          song.previewUrl = track.preview_url;
        }

        return song;
      });
    } catch (error) {
      console.error('Failed to search Spotify tracks:', error);
      throw new Error('Failed to search for music recommendations');
    }
  }
}

export const spotifyService = new SpotifyService();
