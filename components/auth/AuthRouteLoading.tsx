import AuthLoadingScreen from "./AuthLoadingScreen";

export default function AuthRouteLoading() {
  return (
    <AuthLoadingScreen
      title="Authenticating..."
      details="Please wait while we complete your sign in and redirect you."
    />
  );
}
