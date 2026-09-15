import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserMediaPreferences } from "@/types/media";

const defaultPreferences: UserMediaPreferences = {
  savedArticles: [],
  watchHistory: [],
  favoriteTvStations: [],
  favoriteRadioStations: [],
  followedTopics: [],
  followedJournalists: [],
  searchHistory: [],
  recentChannels: [],
  language: "en",
  notifications: {
    breakingNews: true,
    sports: true,
    liveMatches: true,
    trending: true,
    aiRecommendations: true,
  },
};

interface MediaState {
  preferences: UserMediaPreferences;
  toggleSavedArticle: (slug: string) => void;
  addWatchHistory: (id: string) => void;
  toggleFavoriteTv: (id: string) => void;
  toggleFavoriteRadio: (id: string) => void;
  toggleFollowTopic: (topic: string) => void;
  toggleFollowJournalist: (name: string) => void;
  setLanguage: (lang: string) => void;
  updateNotifications: (partial: Partial<UserMediaPreferences["notifications"]>) => void;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addRecentChannel: (id: string) => void;
  isArticleSaved: (slug: string) => boolean;
}

function toggleInList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,

      toggleSavedArticle: (slug) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            savedArticles: toggleInList(s.preferences.savedArticles, slug),
          },
        })),

      addWatchHistory: (id) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            watchHistory: [id, ...s.preferences.watchHistory.filter((h) => h !== id)].slice(0, 50),
          },
        })),

      toggleFavoriteTv: (id) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            favoriteTvStations: toggleInList(s.preferences.favoriteTvStations, id),
          },
        })),

      toggleFavoriteRadio: (id) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            favoriteRadioStations: toggleInList(s.preferences.favoriteRadioStations, id),
          },
        })),

      toggleFollowTopic: (topic) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            followedTopics: toggleInList(s.preferences.followedTopics, topic),
          },
        })),

      toggleFollowJournalist: (name) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            followedJournalists: toggleInList(s.preferences.followedJournalists, name),
          },
        })),

      setLanguage: (language) =>
        set((s) => ({ preferences: { ...s.preferences, language } })),

      updateNotifications: (partial) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            notifications: { ...s.preferences.notifications, ...partial },
          },
        })),

      addSearchHistory: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((s) => ({
          preferences: {
            ...s.preferences,
            searchHistory: [trimmed, ...(s.preferences.searchHistory ?? []).filter((h) => h !== trimmed)].slice(0, 20),
          },
        }));
      },

      clearSearchHistory: () =>
        set((s) => ({
          preferences: { ...s.preferences, searchHistory: [] },
        })),

      addRecentChannel: (id) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            recentChannels: [id, ...(s.preferences.recentChannels ?? []).filter((c) => c !== id)].slice(0, 12),
          },
        })),

      isArticleSaved: (slug) => get().preferences.savedArticles.includes(slug),
    }),
    { name: "gigatrend-media-store", skipHydration: true },
  ),
);
