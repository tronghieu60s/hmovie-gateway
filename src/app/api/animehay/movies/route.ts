import { ApiResponse } from "@/core/dto/api-result.dto";
import * as cheerio from "cheerio";

const apiUrl = "https://animehay.bio/phim-moi-cap-nhap/trang";
const pageSize = 30;

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

    const numberOfPage = Math.ceil(limit / pageSize);
    const totalItemsDestination = numberOfPage * pageSize;
    const queryPage = Math.ceil((page * limit) / pageSize);

    console.log(queryPage, numberOfPage, totalItemsDestination);

    // do {
    //   const page = queryPage;
    //   queryPage -= 1;

    //   const response = await fetch(`${apiUrl}-${page}.html`).then((res) =>
    //     res.text()
    //   );

    //   if (response) {
    //     const $ = cheerio.load(response);
    //     const items = $(".movies-list .movie-item");

    //     const itemsData = Array.from(items).map((item) => {
    //       const href = $(item).children("a").attr("href") || "";
    //       const episode = $(item).find(".episode-latest").text();

    //       const id = href.split("-")?.pop()?.replace(".html", "");
    //       const name = $(item).children("a").attr("title");
    //       const slug = href.split("/")?.pop()?.replace(".html", "");
    //       const link = $(item).children("a").attr("href");
    //       const posterUrl = $(item).find("img").attr("src");
    //       const totalEpisodes = episode.split("/")?.[1]?.trim();
    //       const currentEpisode = episode.split("/")?.[0]?.trim();
    //       const rating = $(item).children("a").children(".score").text().trim();
    //       return {
    //         id,
    //         name,
    //         slug,
    //         link,
    //         posterUrl,
    //         totalEpisodes,
    //         currentEpisode,
    //         rating,
    //       };
    //     });

    //     movies.unshift(...itemsData);
    //   }
    // } while (movies.length < limit);

    // const startIndex = limit * (page - 1) - queryPage * pageSize;
    // const endIndex = startIndex + limit;

    // const items = movies.slice(startIndex, endIndex);

    // const totalItems = movies.length;

    // const pagination = {
    //   page: page,
    //   limit: limit,
    //   totalPages: Math.ceil(totalItems / limit),
    //   totalItems,
    // };

    return Response.json(new ApiResponse({}), {
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
