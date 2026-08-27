import { Redirect } from "expo-router";

import { clothesRegistrationRoutes } from "@/features/clothes-registration/routes";

export default function ClothesRegisterRoute() {
  return <Redirect href={clothesRegistrationRoutes.clothesPreview} />;
}
