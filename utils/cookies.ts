import Cookies from "js-cookie";

export const setCookie = (name: string, value: string, days: number) => {
  Cookies.set(name, value, {
    expires: days,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const deleteCookie = (name: string) => {
  Cookies.remove(name);
};
