import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Pauline kookt | Catering & maaltijden op maat in Arcen",
  "description": "Persoonlijke catering en huisgemaakte weekmaaltijden vanuit Arcen. Borrelboxen, lunch, brunch en buffetten. Een voorstel op maat, antwoord binnen 48 uur."
};

export default function Page() { return <Site page="home"/>; }
