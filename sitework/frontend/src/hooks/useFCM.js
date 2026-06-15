import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase";
import api from "../services/api";

const VAPID = import.meta.env.VITE_VAPID_KEY;

export function useFCM(user) {
  const registered = useRef(false);

  useEffect(() => {
    if (!user || registered.current) return;

    const setup = async () => {
      try {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, { vapidKey: VAPID, serviceWorkerRegistration: swReg });
        if (!token) return;

        await api.post("/auth/fcm-token", { token });
        registered.current = true;

        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          if (title && Notification.permission === "granted") {
            new Notification(title, { body: body || "", icon: "/icons/icon-192.png" });
          }
        });
      } catch (e) {
        // FCM is optional — silently skip
      }
    };

    setup();
  }, [user]);
}
