import { TermsDocumentScreen } from "@/features/terms/screens/TermsDocumentScreen";
import { termsRoutes } from "@/features/terms/routes";

export default function PrivacyPolicyRoute() {
  return <TermsDocumentScreen documentId="privacy" fallbackHref={termsRoutes.authAgreement} />;
}
