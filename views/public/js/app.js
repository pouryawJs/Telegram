import { showActiveNamespace, showNamespaces } from "../../utils/funcs.js";

window.addEventListener("load", () => {
  const socket = io("http://localhost:4003");

  socket.on("connect", () => {
    socket.on("bro", (data) => console.log("Bro Data"));

    socket.on("namespaces", (namespaces) => {
      showNamespaces(namespaces, socket);
      showActiveNamespace(namespaces);
    });
  });
});
