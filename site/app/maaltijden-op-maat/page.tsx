import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Maaltijden op maat | Pauline kookt",
  "description": "Huisgemaakte maaltijden voor jouw gezin, afgestemd op jullie smaak en weekritme. Ik zorg voor het menu, de boodschappen en het koken, zodat jullie meer tijd overhouden voor elkaar."
};

export default function Page() { return <Site page="weekly"/>; }
