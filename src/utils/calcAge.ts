import { BIRTH_DATE } from "@/const";

export const calculateAge = (currentDate: Date) => {
  const birth = new Date(BIRTH_DATE);

  let years = currentDate.getFullYear() - birth.getFullYear();
  let months = currentDate.getMonth() - birth.getMonth();
  let days = currentDate.getDate() - birth.getDate();

  // 如果天数小于0，需要从上个月借
  if (days < 0) {
    months--;
    // 获取上个月的最后一天
    const lastDayOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();
    days += lastDayOfPrevMonth;
  }

  // 如果月数小于0，需要从上一年借
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};
