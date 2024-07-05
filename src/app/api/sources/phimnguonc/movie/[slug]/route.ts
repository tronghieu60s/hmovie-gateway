import { apiCaller } from "@/core/api";
import { getSlug } from "@/core/commonFuncs";
import { ApiResponse } from "@/core/dto/api-result.dto";

const apiUrl = "https://phim.nguonc.com/api/film";

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const apiReq = `${apiUrl}/${slug}`;
    const movie = await apiCaller(apiReq).then((res) => res.json());

    const data = {
      name: movie.movie.name,
      slug: movie.movie.slug,
      originName: movie.movie.original_name,
      content: movie.movie.description,
      thumbUrl: movie.movie.thumb_url,
      posterUrl: movie.movie.poster_url,
      totalEpisodes: movie.movie.total_episodes,
      currentEpisode: movie.movie.current_episode,
      quality: movie.movie.quality,
      duration: movie.movie.time,
      language: movie.movie.language,
      casts: (movie.movie.casts || "")
        .split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      directors: (movie.movie.director || "")
        ?.split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      taxonomies: Object.values(movie.movie.category).map((item: any) => ({
        group: {
          name: item.group.name,
          slug: getSlug(item.group.name),
        },
        categories: item.list.map((data: any) => ({
          name: data.name,
          slug: getSlug(data.name),
        })),
      })),
      episodes: Object.entries(
        movie.movie.episodes
          .flatMap((ep: any) =>
            ep.items
              .map((data: any) => ({
                name: data.name,
                slug: data.slug,
                server: ep.server_name,
                linkEmbed: data.embed,
              }))
              .filter((data: any) => data.name)
          )
          .reduce((acc: any, cur: any) => {
            if (!acc[cur.name])
              acc[cur.name] = {
                name: cur.name,
                slug: cur.slug,
                filename: cur.filename,
                episodes: [],
              };
            acc[cur.name].episodes.push({
              server: cur.server,
              linkEmbed: cur.linkEmbed,
            });
            return acc;
          }, {})
      ).map(([, v]) => v),
      source: "phimnguonc",
    };

    return Response.json(new ApiResponse({ data }), {
      headers: {
        "Cache-Control": "max-age=10",
        "CDN-Cache-Control": "max-age=60",
        "Vercel-CDN-Cache-Control": "max-age=3600",
      },
    });
  } catch (error: any) {
    return Response.json(
      new ApiResponse({
        data: null,
        message: `${error.message || error}`,
        success: false,
      }),
      { status: 500 }
    );
  }
}
