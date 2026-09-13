import { notFound } from "next/navigation";

// Unknown paths under a locale render the localized not-found sheet.
export default function CatchAll() {
  notFound();
}
