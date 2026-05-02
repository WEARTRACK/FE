// import { SplashScreen } from "@/features/entry/screens/SplashScreen";
import { Redirect } from "expo-router";

export default function RootIndexRoute() {
  // return <SplashScreen />;
  return <Redirect href="/closet" />;
}
