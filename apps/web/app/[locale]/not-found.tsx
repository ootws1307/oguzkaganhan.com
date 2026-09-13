import { getTranslations } from "next-intl/server";
import { Frame } from "@/components/frame";
import { ArrowLeft } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main id="main" className="mx-auto w-full max-w-[1480px] px-3 pt-3 sm:px-6 sm:pt-9">
      <div className="relative border border-rule">
        <div className="relative px-6 py-16 text-ink sm:px-10 sm:py-24">
          <Frame />
          <p className="caps tnum text-sm text-ink-soft">404</p>
          <h1 className="caps mt-3 text-[clamp(2.5rem,7vw,5rem)] leading-[0.92] font-bold">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[48ch] text-xl text-ink-soft">{t("body")}</p>
          <Link
            href="/"
            className="caps mt-10 inline-flex items-center gap-2 border border-ink px-4 py-2.5 transition-colors hover:bg-paper-deep"
          >
            <ArrowLeft />
            {t("home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
