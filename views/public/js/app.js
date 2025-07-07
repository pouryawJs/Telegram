import {
  showActiveCategory,
  showNamespaces,
  sendMsg,
  getMsg,
  sendLocation,
  detectIsTyping,
  getLocation,
  sendFile,
  getMedia,
} from "../../utils/funcs.js";

window.addEventListener("load", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    // /api/auth/me
    const res = await fetch(`http://localhost:4003/api/auth/me`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200) {
      const user = await res.json();

      const socket = io("http://localhost:4003");

      socket.on("connect", () => {
        socket.on("namespaces", (namespaces) => {
          showNamespaces(namespaces, user);
          showActiveCategory(namespaces);
          sendMsg();
          getMsg();
          detectIsTyping();
          sendLocation();
          getLocation();
          sendFile();
          getMedia();
        });
      });
    } else {
      location.href = "./pages/register.html";
    }
  } else {
    location.href = "./pages/register.html";
  }
});
