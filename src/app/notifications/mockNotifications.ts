import { NotificationData } from "@/types";

export const mockNotifications: NotificationData[] = [
  {
    id: "notif_1",
    type: "SYSTEM",
    title: "Welcome to LocalAtlas!",
    message: "Start discovering hidden gems across the Konkan coast.",
    read: false,
    userId: "user_1",
    actorId: null,
    locationId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "notif_2",
    type: "APPROVAL",
    title: "Location Approved",
    message: "Your submission for 'Secret Cove' has been verified and published.",
    read: true,
    userId: "user_1",
    actorId: "admin_1",
    locationId: "loc_1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "notif_3",
    type: "LIKE",
    title: "New Like",
    message: "Aditi liked your review on Sindhudurg Fort.",
    read: true,
    userId: "user_1",
    actorId: "user_2",
    locationId: "loc_2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "notif_4",
    type: "WEATHER_ALERT",
    title: "Heavy Rainfall Warning",
    message: "High tide and heavy rainfall expected in Ratnagiri over the weekend. Stay safe!",
    read: false,
    userId: "user_1",
    actorId: null,
    locationId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  }
];
