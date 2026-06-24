import { create } from "zustand";

type ShoppingMallRegistrationDraft = {
  sourceUrl: string | null;
  imageUrl: string | null;
  productName: string | null;
  price: number | null;
  color: string | null;
  category: string | null;
  purchaseDate: Date | null;
  storageLocation: string | null;
  sectionId: number | null;
};

type ShoppingMallRegistrationState = ShoppingMallRegistrationDraft & {
  setDraft: (draft: Partial<ShoppingMallRegistrationDraft>) => void;
  resetDraft: () => void;
};

const initialState: ShoppingMallRegistrationDraft = {
  sourceUrl: null,
  imageUrl: null,
  productName: null,
  price: null,
  color: null,
  category: null,
  purchaseDate: null,
  storageLocation: null,
  sectionId: null,
};

export const useShoppingMallRegistrationStore = create<ShoppingMallRegistrationState>()((set) => ({
  ...initialState,
  setDraft: (draft) =>
    set((state) => ({
      ...state,
      ...draft,
    })),
  resetDraft: () => set(initialState),
}));
