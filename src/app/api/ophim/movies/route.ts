import { ApiResponse } from "@/core/dto/api-result.dto";

const apiUrl = "https://ophim1.com/danh-sach/phim-moi-cap-nhat";
const pageSize = 24;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const _page = searchParams.get("page") || 1;
  const _limit = searchParams.get("limit") || 24;

  try {
    let limit = Number(_limit);
    const page = Number(_page);

    if (limit < 10) {
      limit = 10;
    } else if (limit > 50) {
      limit = 50;
    }

    const movies = [];

    let queryPage = Math.ceil((page * limit) / pageSize);
    let pathImage = "";
    let totalItems = 0;

    do {
      const queryParams = new URLSearchParams();
      queryParams.set("page", `${queryPage}`);

      const queryString = queryParams.toString();

      queryPage -= 1;

      const response = await fetch(`${apiUrl}?${queryString}`).then((res) =>
        res.json()
      );

      movies.unshift(...response.items);
      if (!pathImage) {
        pathImage = response.pathImage;
      }
      if (!totalItems) {
        totalItems = response.pagination.totalItems;
      }
    } while (movies.length < limit);

    const startIndex = limit * (page - 1) - queryPage * pageSize;
    const endIndex = startIndex + limit;

    const moviesItems = movies.slice(startIndex, endIndex);

    const items = moviesItems.map((item: any) => ({
      id: item._id,
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: `${pathImage}${item.thumb_url}`,
      posterUrl: `${pathImage}${item.poster_url}`,
      source: "ophim",
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
