import { getPageNotion } from ".";

export const checkDatabaseExists = async (title: string, parent?: string) => {
  const pageNotion = await getPageNotion(parent);

  const databaseChildFound = pageNotion.results.find(
    (object: any) =>
      object.type === "child_database" && object.child_database.title === title
  );

  if (databaseChildFound) {
    return databaseChildFound.id;
  }

  return null;
};
