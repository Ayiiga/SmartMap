"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CommunityReport,
  Coordinates,
  EmergencyContact,
  MapStyle,
  Place,
  PlaceCategory,
  TravelMode,
  UserMapPreferences,
} from "@/types/smart-map";
import type {
  AddressResolveStatus,
  LocationEngineStatus,
  LocationPermission,
  NavEndpoint,
  ResolvedAddress,
} from "@/lib/geo/types";
import type { PrivacyConsent, PrivacyConsentKey } from "@/lib/ai40/types";
import { DEFAULT_CONSENTS, grantConsent, revokeConsent, revokeAllConsents } from "@/lib/ai40/privacy";
import { SAMPLE_REPORTS } from "@/content/smart-map/reports";

interface LocationMeta {
  accuracyM: number | null;
  speedMps: number | null;
  updatedAt: number | null;
  source: "gps" | "manual" | "none";
}

interface MapState extends UserMapPreferences {
  countryCode: string;
  userLocation: Coordinates | null;
  locationPermission: LocationPermission;
  locationMeta: LocationMeta;
  resolvedAddress: ResolvedAddress | null;
  locationEngineStatus: LocationEngineStatus;
  addressStatus: AddressResolveStatus;
  addressError: string | null;
  selectedPlaceId: string | null;
  activeCategory: PlaceCategory | "all";
  travelMode: TravelMode;
  destination: Place | null;
  navOrigin: NavEndpoint | null;
  navDestination: NavEndpoint | null;
  homeLocation: NavEndpoint | null;
  workLocation: NavEndpoint | null;
  recentPlaces: NavEndpoint[];
  pickOnMapMode: "origin" | "destination" | null;
  followUser: boolean;
  reports: CommunityReport[];
  searchQuery: string;
  sosActive: boolean;
  aiOpen: boolean;
  privacyConsents: PrivacyConsent[];
  selectedAi40RouteId: string | null;
  setCountryCode: (code: string) => void;
  setUserLocation: (coords: Coordinates | null) => void;
  setLocationPermission: (permission: LocationPermission) => void;
  setLocationMeta: (meta: Partial<LocationMeta>) => void;
  setResolvedAddress: (address: ResolvedAddress | null) => void;
  setLocationEngineStatus: (status: LocationEngineStatus) => void;
  setAddressStatus: (status: AddressResolveStatus, error?: string | null) => void;
  setSelectedPlaceId: (id: string | null) => void;
  setActiveCategory: (category: PlaceCategory | "all") => void;
  setTravelMode: (mode: TravelMode) => void;
  setDestination: (place: Place | null) => void;
  setNavOrigin: (endpoint: NavEndpoint | null) => void;
  setNavDestination: (endpoint: NavEndpoint | null) => void;
  setHomeLocation: (endpoint: NavEndpoint | null) => void;
  setWorkLocation: (endpoint: NavEndpoint | null) => void;
  addRecentPlace: (endpoint: NavEndpoint) => void;
  setPickOnMapMode: (mode: "origin" | "destination" | null) => void;
  setFollowUser: (follow: boolean) => void;
  setSearchQuery: (q: string) => void;
  setMapStyle: (style: MapStyle) => void;
  toggleSavedPlace: (id: string) => void;
  setSosActive: (active: boolean) => void;
  setAiOpen: (open: boolean) => void;
  setPrivacyConsent: (key: PrivacyConsentKey, granted: boolean) => void;
  revokeAllPrivacyConsents: () => void;
  setSelectedAi40RouteId: (id: string | null) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
  setSafetyModes: (
    modes: Partial<Pick<UserMapPreferences, "womenSafetyMode" | "childSafetyMode" | "touristSafetyMode">>,
  ) => void;
  setMedical: (bloodGroup?: string, medicalNotes?: string) => void;
  addReport: (report: CommunityReport) => void;
  setVoiceNav: (on: boolean) => void;
  voiceLanguage: "en" | "tw";
  setVoiceLanguage: (language: "en" | "tw") => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      countryCode: "GH",
      userLocation: null,
      locationPermission: "unknown",
      locationMeta: { accuracyM: null, speedMps: null, updatedAt: null, source: "none" },
      resolvedAddress: null,
      locationEngineStatus: "idle",
      addressStatus: "idle",
      addressError: null,
      selectedPlaceId: null,
      activeCategory: "all",
      travelMode: "driving",
      destination: null,
      navOrigin: null,
      navDestination: null,
      homeLocation: null,
      workLocation: null,
      recentPlaces: [],
      pickOnMapMode: null,
      followUser: true,
      reports: SAMPLE_REPORTS,
      searchQuery: "",
      sosActive: false,
      aiOpen: false,
      privacyConsents: DEFAULT_CONSENTS,
      selectedAi40RouteId: null,
      savedPlaceIds: [],
      favoriteRouteIds: [],
      emergencyContacts: [],
      womenSafetyMode: false,
      childSafetyMode: false,
      touristSafetyMode: false,
      bloodGroup: undefined,
      medicalNotes: undefined,
      mapStyle: "streets",
      voiceNav: true,
      voiceLanguage: "en",
      setCountryCode: (code) => set({ countryCode: code }),
      setUserLocation: (coords) => set({ userLocation: coords }),
      setLocationPermission: (permission) => set({ locationPermission: permission }),
      setLocationMeta: (meta) => set({ locationMeta: { ...get().locationMeta, ...meta } }),
      setResolvedAddress: (address) =>
        set({
          resolvedAddress: address,
          addressStatus: address ? "resolved" : get().addressStatus,
          addressError: address ? null : get().addressError,
        }),
      setLocationEngineStatus: (status) => set({ locationEngineStatus: status }),
      setAddressStatus: (status, error = null) => set({ addressStatus: status, addressError: error }),
      setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      setTravelMode: (mode) => set({ travelMode: mode }),
      setDestination: (place) => {
        set({ destination: place });
        if (place) {
          const endpoint: NavEndpoint = {
            id: place.id,
            label: place.name,
            coordinates: place.coordinates,
            source: "search",
            placeId: place.id,
            address: place.address,
          };
          set({ navDestination: endpoint });
          get().addRecentPlace(endpoint);
        }
      },
      setNavOrigin: (endpoint) => {
        const current = get().navOrigin;
        if (
          current &&
          endpoint &&
          current.id === endpoint.id &&
          current.source === endpoint.source &&
          current.label === endpoint.label &&
          current.address === endpoint.address &&
          Math.abs(current.coordinates.lat - endpoint.coordinates.lat) < 1e-7 &&
          Math.abs(current.coordinates.lng - endpoint.coordinates.lng) < 1e-7
        ) {
          return;
        }
        set({ navOrigin: endpoint });
      },
      setNavDestination: (endpoint) => {
        const current = get().navDestination;
        if (
          current &&
          endpoint &&
          current.id === endpoint.id &&
          current.source === endpoint.source &&
          current.label === endpoint.label &&
          Math.abs(current.coordinates.lat - endpoint.coordinates.lat) < 1e-7 &&
          Math.abs(current.coordinates.lng - endpoint.coordinates.lng) < 1e-7
        ) {
          return;
        }
        set({ navDestination: endpoint });
        if (endpoint) get().addRecentPlace(endpoint);
      },
      setHomeLocation: (endpoint) => set({ homeLocation: endpoint }),
      setWorkLocation: (endpoint) => set({ workLocation: endpoint }),
      addRecentPlace: (endpoint) => {
        const filtered = get().recentPlaces.filter((p) => p.id !== endpoint.id);
        set({ recentPlaces: [endpoint, ...filtered].slice(0, 12) });
      },
      setPickOnMapMode: (mode) => set({ pickOnMapMode: mode, followUser: mode == null }),
      setFollowUser: (follow) => set({ followUser: follow }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setMapStyle: (style) => set({ mapStyle: style }),
      toggleSavedPlace: (id) => {
        const current = get().savedPlaceIds;
        set({
          savedPlaceIds: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        });
      },
      setSosActive: (active) => set({ sosActive: active }),
      setAiOpen: (open) => set({ aiOpen: open }),
      setPrivacyConsent: (key, granted) =>
        set({
          privacyConsents: granted
            ? grantConsent(get().privacyConsents, key)
            : revokeConsent(get().privacyConsents, key),
        }),
      revokeAllPrivacyConsents: () =>
        set({ privacyConsents: revokeAllConsents(get().privacyConsents) }),
      setSelectedAi40RouteId: (id) => set({ selectedAi40RouteId: id }),
      addEmergencyContact: (contact) =>
        set({ emergencyContacts: [...get().emergencyContacts, contact] }),
      removeEmergencyContact: (id) =>
        set({ emergencyContacts: get().emergencyContacts.filter((c) => c.id !== id) }),
      setSafetyModes: (modes) => set({ ...modes }),
      setMedical: (bloodGroup, medicalNotes) => set({ bloodGroup, medicalNotes }),
      addReport: (report) => set({ reports: [report, ...get().reports] }),
      setVoiceNav: (on) => set({ voiceNav: on }),
      setVoiceLanguage: (language) => set({ voiceLanguage: language }),
    }),
    {
      name: "smart-map-store",
      version: 3,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<MapState>;
        return {
          ...current,
          ...p,
          // Ensure new GPS/nav fields always exist after rehydrate from older clients
          recentPlaces: Array.isArray(p.recentPlaces) ? p.recentPlaces : current.recentPlaces,
          homeLocation: p.homeLocation ?? current.homeLocation,
          workLocation: p.workLocation ?? current.workLocation,
          locationPermission: current.locationPermission,
          locationMeta: current.locationMeta,
          resolvedAddress: current.resolvedAddress,
          locationEngineStatus: current.locationEngineStatus,
          addressStatus: current.addressStatus,
          addressError: current.addressError,
          navOrigin: current.navOrigin,
          navDestination: current.navDestination,
          pickOnMapMode: current.pickOnMapMode,
          followUser: current.followUser,
          userLocation: current.userLocation,
        };
      },
      partialize: (state) => ({
        countryCode: state.countryCode,
        savedPlaceIds: state.savedPlaceIds,
        favoriteRouteIds: state.favoriteRouteIds,
        emergencyContacts: state.emergencyContacts,
        womenSafetyMode: state.womenSafetyMode,
        childSafetyMode: state.childSafetyMode,
        touristSafetyMode: state.touristSafetyMode,
        bloodGroup: state.bloodGroup,
        medicalNotes: state.medicalNotes,
          mapStyle: state.mapStyle,
          voiceNav: state.voiceNav,
          voiceLanguage: state.voiceLanguage ?? "en",
        reports: state.reports,
        privacyConsents: state.privacyConsents,
        homeLocation: state.homeLocation,
        workLocation: state.workLocation,
        recentPlaces: state.recentPlaces,
      }),
    },
  ),
);
