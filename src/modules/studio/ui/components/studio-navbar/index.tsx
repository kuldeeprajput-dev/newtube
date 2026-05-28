"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/trpc/client";

// import { AuthButton } from "@/hooks/auth/ui/components/auth-button";
import { StudioUploadModal } from "../studio-upload-modal";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";

export const StudioNavbar = () => {
  const utils = trpc.useUtils();

  return (
    <nav className="flex items-center fixed top-0 left-0 right-0 z-50 bg-white px-2 pr-5 h-16 border-b shadow-md">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center shrink-0">
          <SidebarTrigger />

          <Link
            prefetch
            href="/studio"
            className="hidden md:block"
            onClick={() => utils.studio.getMany.invalidate()}
          >
            <div className="p-4 flex items-center gap-1">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              <p className="text-xl font-semibold tracking-tight">Studio</p>
            </div>
          </Link>
        </div>
        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-4">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
