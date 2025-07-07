let namespaceSocket = null;
let user = null;
let roomName = "";

export const showNamespaces = (namespaces, userInfo) => {
  user = userInfo;
  const chatCategories = document.querySelector(".sidebar__categories-list");

  chatCategories.innerHTML = "";
  getNamespaceChats(namespaces[0].href);

  namespaces.forEach((namespace, index) => {
    chatCategories.insertAdjacentHTML(
      "beforeend",
      `
        <li data-title="${namespace.title}" class="sidebar__categories-item ${
        index === 0 && "sidebar__categories-item--active"
      }" data-category-name="all">
            <span class="sidebar__categories-text">${namespace.title}</span>
            <!-- <span class="sidebar__categories-counter sidebar__counter">3</span> -->
        </li>
      `
    );
  });
};

const getNamespaceChats = (href) => {
  if (namespaceSocket) namespaceSocket.close();
  namespaceSocket = io(`http://localhost:4003${href}`);
  namespaceSocket.on("connect", () => {
    namespaceSocket.on("namespaceRooms", (rooms) => {
      console.log("Rooms ->", rooms);
      showActiveCategoryRooms(rooms);
    });
  });
};

const showActiveCategoryRooms = (rooms) => {
  const categoryChats = document.querySelector(".sidebar__contact-list");

  categoryChats.innerHTML = "";

  rooms.forEach((room) => {
    categoryChats.insertAdjacentHTML(
      "beforeend",
      `
        <li class="sidebar__contact-item" data-room="${room.title}">
              <a class="sidebar__contact-link" href="#">
                <div class="sidebar__contact-left">
                  <div class="sidebar__contact-left-left">
                    <img class="sidebar__contact-avatar" src="http://localhost:4003/${room.image}">
                  </div>
                  <div class="sidebar__contact-left-right">
                    <span class="sidebar__contact-title">${room.title}</span>
                    <div class="sidebar__contact-sender">
                      <span class="sidebar__contact-sender-name">Qadir Yolme :
                      </span>
                      <span class="sidebar__contact-sender-text">سلام داداش خوبی؟</span>
                    </div>
                  </div>
                    </div>
                <div class="sidebar__contact-right">
                  <span class="sidebar__contact-clock">15.53</span>
                  <span class="sidebar__contact-counter sidebar__counter sidebar__counter-active">66</span>
                </div>
              </a>
        </li>
      `
    );
  });

  setClickOnRooms();
};

export const showActiveCategory = (namespaces) => {
  const chatCategories = document.querySelectorAll(".sidebar__categories-item");

  chatCategories.forEach((category) => {
    category.addEventListener("click", (event) => {
      const namespaceTitle = category.dataset.title;

      const mainNamespace = namespaces.find(
        (namespace) => namespace.title === namespaceTitle
      );

      getNamespaceChats(mainNamespace.href);

      const activeNamespaceElem = document.querySelector(
        ".sidebar__categories-item--active"
      );
      activeNamespaceElem.classList.remove("sidebar__categories-item--active");

      event.target.classList.add("sidebar__categories-item--active");
    });
  });
};

const setClickOnRooms = () => {
  const chats = document.querySelectorAll(".sidebar__contact-item");
  const chatsContainer = document.querySelector(".chat__content-main");

  chats.forEach((chat) => {
    chat.addEventListener("click", (event) => {
      const msgInput = document.querySelector(
        ".chat__content-bottom-bar-input"
      );
      msgInput.value = "";

      roomName = chat.dataset.room;
      namespaceSocket.emit("joining", roomName);

      namespaceSocket.off("roomInfo");
      namespaceSocket.on("roomInfo", (roomInfo) => {
        console.log("RoomInfo ->", roomInfo);
        const chatContent = document.querySelector(".chat__content");
        chatContent.classList.add("chat__content--active");

        const chatHeader = document.querySelector(".chat__header");
        chatHeader.classList.add("chat__header--active");

        const chatName = document.querySelector(".chat__header-name");
        chatName.innerHTML = roomInfo.title;

        const chatProfile = document.querySelector(".chat__header-avatar");
        chatProfile.src = `http://localhost:4003/${roomInfo.image}`;

        chatsContainer.innerHTML = "";

        roomInfo.messages.forEach((messageInfo) => {
          if (messageInfo.sender === user._id) {
            chatsContainer.insertAdjacentHTML(
              "beforeend",
              `
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver">
                    <span class="chat__content-receiver-text">${messageInfo.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
              `
            );
          } else {
            chatsContainer.insertAdjacentHTML(
              "beforeend",
              `
                <div class="chat__content-sender-wrapper chat__content-wrapper">
                  <div class="chat__content-sender">
                    <span class="chat__content-sender-text">${messageInfo.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
              `
            );
          }
        });

        let mapElemID = null;
        roomInfo.locations.forEach((locationInfo) => {
          mapElemID = Math.floor(Math.random() * 99999);
          if (locationInfo.sender === user._id) {
            chatsContainer.insertAdjacentHTML(
              "beforeend",
              `
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver chat__content-map">
                    <div class="map-receiver" id="map-${mapElemID}"></div>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
              `
            );
            addLocation(`map-${mapElemID}`, locationInfo.x, locationInfo.y);
          } else {
            chatsContainer.insertAdjacentHTML(
              "beforeend",
              `
                <div class="chat__content-sender-wrapper chat__content-wrapper">
                  <div class="chat__content-sender chat__content-map">
                    <div class="map-sender" id="map-${mapElemID}"></div>
                    <span class="chat__content-chat-clock">17:58</span>
                  </div>
                </div>
              `
            );
            addLocation(`map-${mapElemID}`, locationInfo.x, locationInfo.y);
          }
        });
      });

      getAndShowRoomOnlineUsersCount();
    });
  });
};

const getAndShowRoomOnlineUsersCount = () => {
  namespaceSocket.on("onlineUsersCount", (count) => {
    const chatOnlineUsersCount = document.querySelector(".chat__header-status");
    chatOnlineUsersCount.innerHTML = `${count} Users online`;
  });
};

export const sendMsg = () => {
  const msgInput = document.querySelector(".chat__content-bottom-bar-input");

  msgInput.addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      const message = event.target.value.trim();
      if (message) {
        namespaceSocket.emit("newMsg", { message, roomName, sender: user._id });
        event.target.value = "";
      }
    }
  });
};

export const getMsg = () => {
  const chatsContainer = document.querySelector(".chat__content-main");

  namespaceSocket.on("confirmMsg", (data) => {
    if (data.sender === user._id) {
      chatsContainer.insertAdjacentHTML(
        "beforeend",
        `
          <div class="chat__content-receiver-wrapper chat__content-wrapper">
            <div class="chat__content-receiver">
              <span class="chat__content-receiver-text">${data.message}</span>
              <span class="chat__content-chat-clock">17:55</span>
            </div>
          </div>
        `
      );
    } else {
      chatsContainer.insertAdjacentHTML(
        "beforeend",
        `
          <div class="chat__content-sender-wrapper chat__content-wrapper">
            <div class="chat__content-sender">
              <span class="chat__content-sender-text">${data.message}</span>
              <span class="chat__content-chat-clock">17:55</span>
            </div>
          </div>
        `
      );
    }
  });
};

export const detectIsTyping = () => {
  const msgInput = document.querySelector(".chat__content-bottom-bar-input");

  let isTyping = false;
  let isTypingTimeOut = null;

  msgInput.addEventListener("keydown", (event) => {
    namespaceSocket.emit("isTyping", {
      userID: user._id,
      roomName,
      isTyping,
    });

    if (!isTyping) {
      isTyping = true;
    }

    if (isTypingTimeOut) clearTimeout(isTypingTimeOut);

    isTypingTimeOut = setTimeout(() => {
      isTyping = false;
      namespaceSocket.emit("isTyping", {
        userID: user._id,
        roomName,
        isTyping,
      });
    }, 2000);
  });

  namespaceSocket.on("isTyping", (data) => {
    console.log("IsTyping ->", data);
    const chatHeaderStatus = document.querySelector(".chat__header-status");
    if (data.isTyping) {
      if (data.username !== user.username) {
        chatHeaderStatus.innerHTML = `${data.username} is typing ...`;
      }
    }
  });
};

export const sendLocation = () => {
  const sendLocationElem = document.querySelector(".location-icon");

  sendLocationElem.addEventListener("click", () => {
    namespaceSocket.emit("newLocation", {
      location: { x: 36.841781928656516, y: 54.43292097321089 },
      sender: user._id,
      roomName,
    });
  });
};

export const getLocation = () => {
  const chatsContainer = document.querySelector(".chat__content-main");

  namespaceSocket.on("confirmLocation", (data) => {
    let mapElemID = Math.floor(Math.random() * 99999);

    if (data.sender === user._id) {
      chatsContainer.insertAdjacentHTML(
        "beforeend",
        `
          <div class="chat__content-receiver-wrapper chat__content-wrapper">
            <div class="chat__content-receiver chat__content-map">
              <div class="map-receiver" id="map-${mapElemID}"></div>
              <span class="chat__content-chat-clock">17:55</span>
            </div>
          </div>
        `
      );
      addLocation(`map-${mapElemID}`, data.location.x, data.location.y);
    } else {
      chatsContainer.insertAdjacentHTML(
        "beforeend",
        `
          <div class="chat__content-sender-wrapper chat__content-wrapper">
            <div class="chat__content-sender chat__content-map">
              <div class="map-sender" id="map-${mapElemID}"></div>
              <span class="chat__content-chat-clock">17:58</span>
            </div>
          </div>
        `
      );
      addLocation(`map-${mapElemID}`, data.location.x, data.location.y);
    }
  });
};

export const sendFile = () => {
  const fileInput = document.querySelector("#file-input");

  fileInput.addEventListener("change", (event) => {
    console.log(event.target.files);

    namespaceSocket.emit("newMedia", {
      sender: user._id,
      roomName,
      file: event.target.files[0],
      filename: event.target.files[0].name,
    });
  });
};

export const getMedia = () => {
  namespaceSocket.on("confirmMedia", (data) => {
    console.log("New Media ->", data);
  });
};
