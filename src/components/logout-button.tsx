import Image from "next/image";

import logoutIcon from "@/assets/images/icone-logout.svg";
import { signOut } from "@/features/auth/actions";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#B500B2] bg-transparent px-4 text-sm font-bold text-[#B500B2] transition-colors hover:border-[#8100D1] hover:text-[#8100D1]"
      >
        <span className="relative block h-4 w-4 shrink-0 overflow-hidden">
          <Image src={logoutIcon} alt="" fill sizes="16px" className="object-contain" />
        </span>
        {compact ? "Sair" : "Sair da conta"}
      </button>
    </form>
  );
}
