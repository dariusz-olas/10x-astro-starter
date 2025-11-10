import type { ReactNode } from "react";
import VersionDisplay from "./VersionDisplay";
import UserMenu from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <UserMenu />
      {children}
      <VersionDisplay />
    </>
  );
}
