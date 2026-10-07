import type { Metadata } from "next";
import Site from "@/app/site";

export const metadata: Metadata = {
  "title": "Contact | Pauline kookt",
  "description": "Vertel Pauline je wensen. Catering en weekmaaltijden vanuit Arcen. Persoonlijk antwoord binnen 48 uur."
};

export default function Page() { return <Site page="contact"/>; }
