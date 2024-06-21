export const getPaginationNewPerPage = (
  page: number,
  limit: number,
  limitDes: number
) => {
  const startRecord = (page - 1) * limitDes + 1;
  const endRecord = startRecord + limitDes - 1;

  const startPage = Math.ceil(startRecord / limit);
  const endPage = Math.ceil(endRecord / limit);

  return {
    startPage,
    endPage,
    startRecord,
    endRecord,
    numberOfPages: endPage - startPage + 1,
  };
};
