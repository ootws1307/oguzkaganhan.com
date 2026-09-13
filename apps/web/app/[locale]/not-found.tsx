import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main id="main" className="page pt-20 pb-24 sm:pt-28">
      <p className="caps text-xs text-ink-faint">404</p>
      <h1 className="mt-4 max-w-[16ch] text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.025em]">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[52ch] text-xl text-ink-soft">{t("body")}</p>
      <Link
        href="/"
        className="caps mt-10 inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-xs text-paper transition-colors hover:bg-ink-hover"
      >
        <ArrowLeft />
        {t("home")}
      </Link>
    </main>
  );
}
