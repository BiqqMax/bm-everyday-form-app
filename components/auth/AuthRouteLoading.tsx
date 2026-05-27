import type { ReactNode } from "react";

import AuthLoadingScreen from "./AuthLoadingScreen";

type AuthRouteLoadingProps = {
  title?: ReactNode;
  details?: ReactNode;
};

export default function AuthRouteLoading({
  title = "Signing you in...",
  details,
}: AuthRouteLoadingProps) {
  return <AuthLoadingScreen title={title} details={details} />;
}
