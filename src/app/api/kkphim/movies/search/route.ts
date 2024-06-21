import { ApiResponse } from "@/core/dto/api-result.dto";

const apiUrl = "https://phimapi.com/v1/api/tim-kiem";

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

    const queryParams = new URLSearchParams();
    queryParams.append("limit", `${page * limit}`);
    queryParams.append("keyword", `${keyword}`);

    const queryString = queryParams.toString();

    const movies = await fetch(`${apiUrl}?${queryString}`).then((res) =>
      res.json()
    );

    const pathImage = movies.data.APP_DOMAIN_CDN_IMAGE;

    const moviesItems = movies.data.items.slice(
      page * limit - limit,
      page * limit
    );

    const items = moviesItems.map((item: any) => ({
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: `${pathImage}/${item.thumb_url}`,
      posterUrl: `${pathImage}/${item.poster_url}`,
      source: "kkphim",
    }));

    const totalItems = movies.data.params.pagination.totalItems;

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
