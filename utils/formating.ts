import { PET_OPTIONS, TREATMENT_OPTIONS } from "@/constants/pet";

export const numberFormatter = new Intl.NumberFormat("en-US");

export const formatNumber = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return "";
  return numberFormatter.format(value);
};

export const handleNumericInput = (text: string, maxValue: number): number | undefined => {
  const numericValue = text.replace(/[^0-9]/g, "");
  if (!numericValue) return undefined;

  const parsedValue = parseInt(numericValue, 10);
  return parsedValue > maxValue ? maxValue : parsedValue;
};

export const formatDistance = (distance: number | null): string => {
  if (distance == null) return "거리 정보 없음";
  if (distance < 1000) return `${distance}m`;
  return `${(distance / 1000).toFixed(1)}km`;
};

const getAnimalTypeLabel = (value: string) => {
  const option = PET_OPTIONS.find((option) => option.value === value);
  return option ? option.label : value;
};

const getTreatmentLabel = (value: string) => {
  const option = TREATMENT_OPTIONS.find((option) => option.value === value);
  return option ? option.label : value;
};

export { getAnimalTypeLabel, getTreatmentLabel, PET_OPTIONS, TREATMENT_OPTIONS };
