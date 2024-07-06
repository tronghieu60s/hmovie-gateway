export class MovieResponse {
  name: string;
  slug: string;
  type?: string;
  status?: string;
  originName?: string;
  content: string;
  thumbUrl: string;
  posterUrl: string;
  trailerUrl?: string;
  totalEpisodes?: string;
  currentEpisode?: string;
  quality?: string;
  duration?: string;
  language?: string;
  showTimes?: string;
  publishYear?: number;
  casts?: string[];
  formats?: string[];
  directors?: string[];
  categories?: string[];
  countries?: string[];
  connections?: {
    name: string;
    slug: string;
  }[];
  isTheater?: boolean;
  isCopyright?: boolean;
  episodes: {
    name: string;
    slug: string;
    filename?: string;
    episodes?: {
      server: string;
      linkEmbed: string;
      linkM3u8: string;
    }[];
  }[];
  source: string;

  constructor(data: MovieResponse) {
    this.name = data.name;
    this.slug = data.slug;
    this.type = data.type || "";
    this.status = data.status || "";
    this.originName = data.originName || "";
    this.content = data.content;
    this.thumbUrl = data.thumbUrl;
    this.posterUrl = data.posterUrl;
    this.totalEpisodes = data.totalEpisodes || "";
    this.currentEpisode = data.currentEpisode || "";
    this.quality = data.quality || "";
    this.duration = data.duration || "";
    this.language = data.language || "";
    this.showTimes = data.showTimes || "";
    this.publishYear = data.publishYear || 0;
    this.casts = data.casts || [];
    this.formats = data.formats || [];
    this.directors = data.directors || [];
    this.categories = data.categories || [];
    this.countries = data.countries || [];
    this.connections = data.connections || [];
    this.isTheater = data.isTheater || false;
    this.isCopyright = data.isCopyright || false;
    this.episodes = data.episodes || [];
    this.source = data.source;
  }
}

export class MoviesResponse {
  name: string;
  slug: string;
  originName?: string;
  thumbUrl: string;
  posterUrl: string;
  source: string;

  constructor(data: MoviesResponse) {
    this.name = data.name;
    this.slug = data.slug;
    this.originName = data.originName || "";
    this.thumbUrl = data.thumbUrl;
    this.posterUrl = data.posterUrl;
    this.source = data.source;
  }
}
