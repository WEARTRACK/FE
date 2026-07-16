import type { Href } from "expo-router";
import { create } from "zustand";

export type QuestRegistrationKind = "closet" | "top" | "bottom";

type QuestRegistrationItem = {
  id: string;
  imageUri: string;
};

type ActiveQuestRegistration = {
  kind: QuestRegistrationKind;
  returnRoute: Href;
};

type QuestRegistrationState = {
  activeRegistration: ActiveQuestRegistration | null;
  registeredItemsByKind: Record<QuestRegistrationKind, QuestRegistrationItem[]>;
  startRegistration: (registration: ActiveQuestRegistration) => void;
  completeActiveRegistration: (imageUri?: string | null) => Href | null;
  clearActiveRegistration: () => void;
  resetState: () => void;
};

const emptyRegisteredItems = {
  closet: [],
  top: [],
  bottom: [],
} satisfies Record<QuestRegistrationKind, QuestRegistrationItem[]>;

function createQuestRegistrationItem(imageUri: string): QuestRegistrationItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    imageUri,
  };
}

export const useQuestRegistrationStore = create<QuestRegistrationState>()((set, get) => ({
  activeRegistration: null,
  registeredItemsByKind: emptyRegisteredItems,
  startRegistration: (registration) =>
    set(() => ({
      activeRegistration: registration,
    })),
  completeActiveRegistration: (imageUri) => {
    const activeRegistration = get().activeRegistration;

    if (!activeRegistration) {
      return null;
    }

    const returnRoute = activeRegistration.returnRoute;

    set((state) => ({
      activeRegistration: null,
      registeredItemsByKind: imageUri
        ? {
            ...state.registeredItemsByKind,
            [activeRegistration.kind]: [
              ...state.registeredItemsByKind[activeRegistration.kind],
              createQuestRegistrationItem(imageUri),
            ],
          }
        : state.registeredItemsByKind,
    }));

    return returnRoute;
  },
  clearActiveRegistration: () =>
    set(() => ({
      activeRegistration: null,
    })),
  resetState: () =>
    set(() => ({
      activeRegistration: null,
      registeredItemsByKind: emptyRegisteredItems,
    })),
}));
