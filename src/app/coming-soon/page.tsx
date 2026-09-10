import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Coming Soon | Surekh Luxury Intimates",
  description:
    "Something intimate is arriving. Reserve your private invitation for Surekh debut access, French laces, pure mulberry silks, and flawless fit assurance.",
};

export default function Page() {
  return <ComingSoonPage />;
}
