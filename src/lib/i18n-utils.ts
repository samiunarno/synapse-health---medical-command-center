
/**
 * Converts a string to a potential i18n key.
 * Example: "Digital BP Monitor" -> "digital_bp_monitor"
 * "Emergency" -> "emergency"
 * "Cardiology Ward A" -> "cardiology_ward_a"
 */
export const toTranslationKey = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
};

/**
 * Attempts to translate a dynamic string.
 * If translation is missing, returns the original string.
 */
export const translateDynamic = (t: (key: string) => string, str: string): string => {
  if (!str) return '';
  const key = toTranslationKey(str);
  const translated = t(key);
  // If t returns the key (meaning missing translation), return the original string
  return translated === key ? str : translated;
};
