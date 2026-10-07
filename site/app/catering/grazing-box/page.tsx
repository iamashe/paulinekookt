import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Grazing box | Pauline kookt",
  "description": "Een borrelbox vanaf 6 personen. Bekijk de inhoud, prijzen en bezorging vanuit Arcen."
};

export default function Page() { return <Site page="box"/>; }
