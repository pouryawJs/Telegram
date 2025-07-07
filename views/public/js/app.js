import {
  showActiveNamespace,
  showNamespaces,
  sendMessageInRoom,
  getMsg,
  detectIsTyping,
  sendLocation,
  getLocation,
  initMap,
  sendFile,
  getFile,
} from "../../utils/funcs.js";

window.addEventListener("load", async () => {
  const token = localStorage.getItem("token");
  let user = null;
  if (token) {
    const res = await fetch("http://localhost:4003/api/auth/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      user = await res.json();

      const socket = io("http://localhost:4003");

      socket.on("connect", () => {
        // socket.on("bro", (data) => console.log("Bro Data"));

        socket.on("namespaces", (namespaces) => {
          showNamespaces(namespaces, socket, user);

          showActiveNamespace(namespaces);
          sendMessageInRoom();
          getMsg();
          detectIsTyping();
          sendLocation();
          getLocation();
          sendFile();
          getFile();
          // initMap("map", 35, 50);
        });
      });
    } else {
      location.href = "./pages/register.html";
    }
  } else {
    location.href = "./pages/register.html";
  }
});
