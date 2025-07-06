import {
  showActiveNamespace,
  showNamespaces,
  sendMessage,
} from "../../utils/funcs.js";

window.addEventListener("load", async () => {
  // const res = await fetch("http://localhost:4003/apu/auth/me");
  // if (res.status === 200) {
  //   const user = await res.json();
  //   console.log("User ->", user);
  // }

  const socket = io("http://localhost:4003");

  socket.on("connect", () => {
    socket.on("bro", (data) => console.log("Bro Data"));

    socket.on("namespaces", (namespaces) => {
      showNamespaces(namespaces, socket);
      showActiveNamespace(namespaces);
      sendMessage();
    });
  });
});
