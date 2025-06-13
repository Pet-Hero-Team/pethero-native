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
