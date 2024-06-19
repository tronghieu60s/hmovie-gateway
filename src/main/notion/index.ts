import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: "secret_5kuxOOTT2FUJ96ucUR7knA93Th9RYCtpgLQlPPC9B71",
});

export const getPageNotion = (blockId = "9da663ff82bc4a5f91525a34a26e954f") =>
  notion.blocks.children.list({
    block_id: blockId,
  });
