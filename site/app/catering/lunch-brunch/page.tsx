import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Lunch & brunch | Pauline kookt",
  "description": "Lunch vanaf €17,50 en brunch vanaf €22,50 per persoon, vanaf 12 personen. Bekijk de mogelijkheden."
};

export default function Page() { return <Site page="lunch"/>; }
