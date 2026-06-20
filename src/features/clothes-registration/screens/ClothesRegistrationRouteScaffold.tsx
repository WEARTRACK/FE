import { Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClosetRegistrationHeader } from "@/features/clothes-registration/screens/ClosetRegistrationHeader";

type RouteAction = {
  label: string;
  href?: Href;
  onPress?: () => void;
  variant?: "primary" | "secondary";
};

type ClothesRegistrationRouteScaffoldProps = {
  step?: string;
  title: string;
  description: string;
  children?: ReactNode;
  actions?: RouteAction[];
};

export function ClothesRegistrationRouteScaffold({
  title,
  description,
  children,
  actions = [],
}: ClothesRegistrationRouteScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-bg-light px-6"
      style={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <ClosetRegistrationHeader variant="compact" />

      <View className="mt-8">
        <Text className="mt-3 font-pretendard-semibold text-headline text-text">{title}</Text>
        <Text className="mt-3 font-pretendard text-subhead text-text-subdued">{description}</Text>
      </View>

      <View className="mt-8 flex-1">{children}</View>

      {actions.length > 0 ? (
        <View className="gap-3">
          {actions.map((action) =>
            action.onPress ? (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                className={[
                  "h-[55px] items-center justify-center rounded-lg",
                  action.variant === "secondary"
                    ? "border border-text-subdued bg-white"
                    : "bg-bg-dark",
                ].join(" ")}
              >
                <Text
                  className={[
                    "font-pretendard-semibold text-button-lg",
                    action.variant === "secondary" ? "text-text" : "text-white",
                  ].join(" ")}
                >
                  {action.label}
                </Text>
              </Pressable>
            ) : action.href ? (
              <Link key={action.label} href={action.href} asChild>
                <Pressable
                  className={[
                    "h-[55px] items-center justify-center rounded-lg",
                    action.variant === "secondary"
                      ? "border border-text-subdued bg-white"
                      : "bg-bg-dark",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "font-pretendard-semibold text-button-lg",
                      action.variant === "secondary" ? "text-text" : "text-white",
                    ].join(" ")}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              </Link>
            ) : null,
          )}
        </View>
      ) : null}
    </View>
  );
}
