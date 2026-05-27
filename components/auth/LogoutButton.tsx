"use client";

import Button from "../ui/Button";

export default function LogoutButton() {
  return (
    <form action="/logout" method="post">
      <Button type="submit" variant="secondary">
        Log out
      </Button>
    </form>
  );
}
