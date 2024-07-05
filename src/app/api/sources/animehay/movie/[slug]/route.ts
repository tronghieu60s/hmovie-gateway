import { apiCaller } from "@/core/api";
import { ApiResponse } from "@/core/dto/api-result.dto";
import * as cheerio from "cheerio";

const apiUrl = "https://animehay.bio/thong-tin-phim/";

export async function GET(
  request: Request,
  { params: { slug } }: { params: { slug: string } }
) {
  try {
    const apiReq = `${apiUrl}/${slug}.html`;
    const movie = await apiCaller(apiReq).then((res) => res.text());

    const $ = cheerio.load(movie);

    const name = $(".info-movie .heading_movie").text() || "";
    const status =
      $(".info-movie .status > div:nth-child(2)").text().trim() || "";
    const _slug =
      $("link[rel='canonical']")
        .attr("href")
        ?.split("/")
        ?.pop()
        ?.replace(".html", "") || "";
    const originName =
      $(".info-movie .name_other > div:nth-child(2)").text().trim() || "";
    const content =
      $(".info-movie .desc > div:nth-child(2)").text().trim() || "";
    const thumbUrl = $(".info-movie .first > img").attr("src") || "";
    const posterUrl = thumbUrl;
    const currentEpisode =
      $(".info-movie .list-item-episode > a:nth-child(1)").text().trim() || "";
    const duration =
      $(".info-movie .duration > div:nth-child(2)")
        .text()
        .trim()
        ?.toLowerCase() || "";
    const publishYear =
      $(".info-movie .update_time > div:nth-child(2)").text().trim() || "";

    const totalEpisodes = duration.toLowerCase().includes("tập")
      ? duration
      : "1 tập";
    const categories = Array.from($(".list_cate > div:nth-child(2) > a"))
      .map((item) => $(item).text().trim())
      .filter((item) => item);
    const episodes = Array.from($(".list_cate > div:nth-child(2) > a"));

    const data = {
      name,
      slug: _slug,
      status,
      originName: originName || name,
      content,
      thumbUrl,
      posterUrl,
      totalEpisodes,
      currentEpisode,
      duration,
      publishYear: Number(publishYear),
      categories,
      source: "animehay",
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
