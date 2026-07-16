import { TermsDocumentScreen } from "@/features/terms/screens/TermsDocumentScreen";
import { termsRoutes } from "@/features/terms/routes";

export default function ServiceTermsRoute() {
  return <TermsDocumentScreen documentId="service" fallbackHref={termsRoutes.authAgreement} />;
}
