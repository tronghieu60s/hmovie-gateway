import { getPageNotion } from ".";

export const checkPageExists = async (title: string, parent?: string) => {
  const pageNotion = await getPageNotion(parent);

  const pageChildFound = pageNotion.results.find(
    (object: any) =>
      object.type === "child_page" && object.child_page.title === title
  );

  if (pageChildFound) {
    return pageChildFound.id;
  }

  return null;
};
