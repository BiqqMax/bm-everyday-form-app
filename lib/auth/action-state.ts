export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const AUTH_ACTION_INITIAL_STATE: AuthActionState = {
  status: "idle",
  message: "",
};
