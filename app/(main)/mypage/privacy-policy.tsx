import { TermsDocumentScreen } from "@/features/terms/screens/TermsDocumentScreen";
import { termsRoutes } from "@/features/terms/routes";

export default function MyPagePrivacyPolicyRoute() {
  return <TermsDocumentScreen documentId="privacy" fallbackHref={termsRoutes.myPageHome} />;
}
