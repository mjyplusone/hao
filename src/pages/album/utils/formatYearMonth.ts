export const formatYearMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-");
  return `${year}年${parseInt(month) - 1}月`;
};
