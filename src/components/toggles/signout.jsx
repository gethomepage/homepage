import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next/pages";
import { MdLogout } from "react-icons/md";

export default function SignOut() {
  const { t } = useTranslation();
  const { status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div id="signout" className="rounded-full flex align-middle self-center mr-3">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/signin?autologin=0" })}
        className="outline-hidden"
      >
        <MdLogout className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer" aria-hidden="true" />
        <span className="sr-only">{t("auth.signout")}</span>
      </button>
    </div>
  );
}
