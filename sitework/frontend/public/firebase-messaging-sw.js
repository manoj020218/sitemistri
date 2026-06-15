importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyBpNsNwDDzr8HaPQ253HmmwdL3OQgJb8ts",
  authDomain:        "sitemitra-bda17.firebaseapp.com",
  projectId:         "sitemitra-bda17",
  messagingSenderId: "991312818872",
  appId:             "1:991312818872:web:ee691cd5d415e26c41ba4d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "SiteMitra", {
    body:  body  || "",
    icon:  icon  || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data:  payload.data || {},
  });
});
