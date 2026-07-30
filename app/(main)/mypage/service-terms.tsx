import { TermsDocumentScreen } from "@/features/terms/screens/TermsDocumentScreen";
import { termsRoutes } from "@/features/terms/routes";

export default function MyPageServiceTermsRoute() {
  return <TermsDocumentScreen documentId="service" fallbackHref={termsRoutes.myPageHome} />;
}
