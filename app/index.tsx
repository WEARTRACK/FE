import React from "react";
import { Redirect } from "expo-router";

export default function RootIndexRoute() {
  // return <Redirect href="/home" />;
  // return <Redirect href="auth/sign-up" />;
  return <Redirect href="/auth/sign-up-success" />;
}
