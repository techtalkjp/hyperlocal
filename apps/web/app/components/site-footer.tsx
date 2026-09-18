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
      <LanguageSelect currentLanguageId={languageId}>Language</LanguageSelect>
    </footer>
  );
};
