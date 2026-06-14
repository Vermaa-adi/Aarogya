import "server-only";
import { cookies } from "next/headers";

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  hi: () => import("./locales/hi.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value as Locale || "en";
  
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  
  return dictionaries.en();
};

export const getCurrentLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
};
