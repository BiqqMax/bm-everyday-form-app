"use client";

import Button from "../ui/Button";

export default function LogoutButton() {
  return (
    <Button type="button" href="/logout" variant="secondary">
      Log out
    </Button>
  );
}
