import type { ReactNode } from "react";

import AuthLoadingScreen from "../auth/AuthLoadingScreen";

type UnifiedLoadingProps = {
  title?: ReactNode;
  details?: ReactNode;
  className?: string;
};

export default function UnifiedLoading({ title = "Loading...", details, className = "" }: UnifiedLoadingProps) {
  return <AuthLoadingScreen title={title} details={details} className={className} />;
}
