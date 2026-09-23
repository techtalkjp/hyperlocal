import type { LanguageId } from "@hyperlocal/consts";
import { LanguageSelect } from "./language-select";

export const SiteFooter = ({ languageId }: { languageId: LanguageId }) => {
  return (
    <footer className="flex items-center border-t px-2 py-2 sm:px-4 md:px-6">
      <div>
        <p className="text-sm">
          © {new Date().getFullYear()}{" "}
          <a href="/" className="underline">
            Hyperlocal
          </a>
        </p>
      </div>
      <div className="flex-1" />
      {/* ホットペッパーグルメ Webサービスの利用規約で必須のクレジット表記 (店舗写真の出典) */}
      <a
        href="http://webservice.recruit.co.jp/"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground mr-3 text-xs"
      >
        Powered by ホットペッパーグルメ Webサービス
      </a>
      <LanguageSelect currentLanguageId={languageId}>Language</LanguageSelect>
    </footer>
  );
};
