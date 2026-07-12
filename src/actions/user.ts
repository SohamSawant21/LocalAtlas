"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserSettings(data: {
  name?: string;
  location?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  locationTracking?: boolean;
  publicProfile?: boolean;
  avatar?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    revalidatePath("/settings");
    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Due to cascading deletes configured in Prisma schema (onDelete: Cascade), 
    // this will delete the associated Accounts, Sessions, and other records.
    await prisma.user.delete({
      where: { id: session.user.id },
    });
    // Session destruction is typically handled client-side via next-auth signOut
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
