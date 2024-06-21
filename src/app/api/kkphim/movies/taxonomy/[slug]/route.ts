import { ApiResponse } from "@/core/dto/api-result.dto";

const apiUrl = "https://phimapi.com/v1/api/danh-sach";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
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

    const queryParams = new URLSearchParams();
    queryParams.append("page", `${page}`);
    queryParams.append("limit", `${limit}`);

    const queryString = queryParams.toString();

    const movies = await fetch(`${apiUrl}/${slug}?${queryString}`).then((res) =>
      res.json()
    );

    const pathImage = movies.data.APP_DOMAIN_CDN_IMAGE;

    const items = movies.data.items.map((item: any) => ({
      name: item.name,
      slug: item.slug,
      originName: item.origin_name,
      thumbUrl: `${pathImage}/${item.thumb_url}`,
      posterUrl: `${pathImage}/${item.poster_url}`,
      source: "kkphim",
    }));

    const pagination = {
      page: movies.data.params.pagination.currentPage,
      limit: movies.data.params.pagination.totalItemsPerPage,
      totalPages: movies.data.params.pagination.totalPages,
      totalItems: movies.data.params.pagination.totalItems,
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
