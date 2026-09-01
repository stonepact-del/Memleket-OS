import type { AppId } from "../core/model";

export const appNames: Record<AppId, string> = {
  home: "Ana Ekran",
  archive: "Hayat Arşivi",
  school: "Okulum",
  career: "Kariyer",
  bank: "CepBanka",
  market: "SarıPazar",
  chat: "Sohbet",
  feed: "Akış",
  mail: "Posta",
  news: "Gündem",
  stocks: "Piyasa",
  calendar: "Takvim",
  map: "Harita",
  notes: "Notlar",
  settings: "Ayarlar",
};

export const appTone: Record<AppId, string> = {
  home: "forest",
  archive: "clay",
  school: "blue",
  career: "sage",
  bank: "ink",
  market: "gold",
  chat: "mint",
  feed: "coral",
  mail: "sky",
  news: "stone",
  stocks: "emerald",
  calendar: "red",
  map: "teal",
  notes: "paper",
  settings: "graphite",
};
