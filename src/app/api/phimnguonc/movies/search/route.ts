import { ApiResponse } from "@/core/dto/api-result.dto";

const apiUrl = "https://phim.nguonc.com/api/films/search";
const pageSize = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const _page = searchParams.get("page") || 1;
  const _limit = searchParams.get("limit") || 24;
  const keyword = searchParams.get("keyword");

  try {
    if (!keyword) {
      throw new Error("keyword is required");
    }

    let limit = Number(_limit);
    const page = Number(_page);

    if (limit < 10) {
      limit = 10;
    } else if (limit > 50) {
      limit = 50;
    }

    const movies = [];

    let queryPage = Math.ceil((page * limit) / pageSize);
    let totalItems = 0;

    do {
      const queryParams = new URLSearchParams();
      queryParams.set("page", `${queryPage}`);
      queryParams.append("keyword", `${keyword}`);

      const queryString = queryParams.toString();

      queryPage -= 1;

      const response = await fetch(`${apiUrl}?${queryString}`).then((res) =>
        res.json()
      );

      movies.unshift(...response.items);
      if (!totalItems) {
        totalItems = response.paginate.total_items;
      }
    } while (movies.length < limit);

    const startIndex = limit * (page - 1) - queryPage * pageSize;
    const endIndex = startIndex + limit;

    const moviesItems = movies.slice(startIndex, endIndex);

    const items = moviesItems.map((item: any) => ({
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: item.thumb_url,
      posterUrl: item.poster_url,
      content: item.description,
      totalEpisodes: item.total_episodes,
      currentEpisode: item.current_episode,
      quality: item.quality,
      duration: item.item,
      language: item.language,
      casts: (item.casts || "")
        .split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      directors: (item.director || "")
        ?.split(",")
        .map((item: string) => item.trim())
        .filter((item: string) => item),
      source: "phimnguonc",
    }));

    const pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };

    return Response.json(new ApiResponse({ data: { items, pagination } }), {
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
