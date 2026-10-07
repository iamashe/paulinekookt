import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Over Pauline | Pauline kookt",
  "description": "Ik ben Pauline, moeder van twee en de kok achter deze nieuwe onderneming in Arcen. Ik bereid met aandacht, luister naar je wensen en maak van samen eten graag iets bijzonders."
};

export default function Page() { return <Site page="story"/>; }
