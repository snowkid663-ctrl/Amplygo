"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

export default function UserSuspendAction({ userId, suspended }: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/users/${userId}/suspend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !suspended }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button small variant={suspended ? "primary" : "danger"} onClick={toggle} disabled={loading}>
      {suspended ? "Reinstate" : "Suspend"}
    </Button>
  );
}
