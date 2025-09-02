import { BIRTH_DATE } from "@/const";

export const calculateAge = (currentData: Date) => {
  const birthDate = BIRTH_DATE;
  const birth = new Date(birthDate);
  const diffTime = Math.abs(currentData.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  return { years, months, days };
};
