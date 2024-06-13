// @ts-ignore
import * as uslug from "uslug";

export const getSlug = (str: string) => {
  let uSlug = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  uSlug = uslug(uSlug, { lower: true });
  return uSlug;
};
