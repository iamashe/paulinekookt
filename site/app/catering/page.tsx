import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Catering | Pauline kookt",
  "description": "Grazing box, lunch, brunch en een warm of koud buffet vanuit Arcen. Ontdek de menu’s en prijzen."
};

export default function Page() { return <Site page="catering"/>; }
