import { Redirect } from "expo-router";

import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

export function ClothesRegisterPlaceholderScreen() {
  return <Redirect href={clothesRegistrationRoutes.clothesPreview} />;
}
