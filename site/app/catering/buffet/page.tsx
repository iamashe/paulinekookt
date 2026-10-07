import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Warm & koud buffet | Pauline kookt",
  "description": "Een buffet op maat met koude schalen, warme gerechten of allebei. Menu en prijs op aanvraag."
};

export default function Page() { return <Site page="buffet"/>; }
