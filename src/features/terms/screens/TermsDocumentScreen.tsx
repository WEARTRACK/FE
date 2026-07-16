import { StatusBar } from "expo-status-bar";
import { Href, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BackButton } from "@/components/common/BackButton";
import { termsRoutes } from "@/features/terms/routes";
import { getTermsDocument, type TermsDocumentId } from "@/features/terms/termsDocuments";

type TermsDocumentScreenProps = {
  documentId: TermsDocumentId;
  fallbackHref?: Href;
};

export function TermsDocumentScreen({
  documentId,
  fallbackHref = termsRoutes.authAgreement,
}: TermsDocumentScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const document = getTermsDocument(documentId);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1 bg-bg-light">
      <StatusBar style="dark" />

      <View className="relative px-6 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <View className="absolute left-6 z-10" style={{ top: insets.top + 12 }}>
          <BackButton
            accessibilityLabel="이전 화면으로 돌아가기"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace(fallbackHref);
            }}
          />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center font-pretendard-semibold text-headline text-text-subdued"
        >
          {document.title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="gap-6">
          {document.sections.map((section) => (
            <View key={section.title}>
              <Text className="font-pretendard-semibold text-caption text-text">
                {section.title}
              </Text>
              <View className="mt-2 gap-1">
                {section.items.map((item) => (
                  <Text
                    key={`${section.title}-${item.text}`}
                    className={[
                      "font-pretendard text-caption text-text",
                      item.indent === 1 ? "ml-4" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.indent || section.useBullets || section.items.length > 1 ? "· " : ""}
                    {item.text}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
