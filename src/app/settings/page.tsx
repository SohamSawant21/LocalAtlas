import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      location: true,
      emailNotifications: true,
      pushNotifications: true,
      locationTracking: true,
      publicProfile: true,
      avatar: true,
    }
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <SettingsClient user={user} />
  );
}
