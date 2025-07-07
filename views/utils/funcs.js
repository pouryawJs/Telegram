let socket = null;
let namespaceSocket = null;
let roomName = "";
let user = null;

export const showNamespaces = (namespaces, socketConnection, userInfo) => {
	socket = socketConnection;
	user = userInfo;

	const chatCategories = document.querySelector(".sidebar__categories-list");
	chatCategories.innerHTML = "";

	getNamespaceChats(namespaces[0].href);

	namespaces.forEach((namespace, index) => {
		chatCategories.insertAdjacentHTML(
			"beforeend",
			`
              <li data-title="${
					namespace.title
				}" class="sidebar__categories-item ${
				index === 0 && "sidebar__categories-item--active"
			}" data-category-name="all">
                <span class="sidebar__categories-text">${namespace.title}</span>
                <!-- <span class="sidebar__categories-counter sidebar__counter">3</span> -->
            </li>
          `
		);
	});
};

export const showActiveNamespace = (namespaces) => {
	let sidebarCategoriesItem = document.querySelectorAll(
		".sidebar__categories-item"
	);

	sidebarCategoriesItem.forEach((item) => {
		item.addEventListener("click", function (e) {
			const namespaceTitle = item.dataset.title;
			const mainNamespace = namespaces.find(
				(namespace) => namespace.title === namespaceTitle
			);

			getNamespaceChats(mainNamespace.href);

			let activeSidebarCategoriesItem = document.querySelector(
				".sidebar__categories-item--active"
			);

			activeSidebarCategoriesItem.classList.remove(
				"sidebar__categories-item--active"
			);

			e.currentTarget.classList.add("sidebar__categories-item--active");

			let categoryName = e.currentTarget.dataset.categoryName;
			let selectedCategory = document.querySelector(
				`.data-category-${categoryName}`
			);
			let selectedCategoryActive = document.querySelector(
				`.sidebar__contact.sidebar__contact--active`
			);
			selectedCategoryActive.classList.remove("sidebar__contact--active");
			selectedCategory.classList.add("sidebar__contact--active");
		});
	});
};

export const getNamespaceChats = (namespaceHref) => {
	if (namespaceSocket) namespaceSocket.close();
	namespaceSocket = io(`http://localhost:4003${namespaceHref}`);

	namespaceSocket.on("connect", () => {
		namespaceSocket.on("namespaceRooms", (rooms) => {
			showNamespaceChats(rooms);
		});
	});
};

export const showNamespaceChats = (rooms) => {
	const chats = document.querySelector(".sidebar__contact-list");
	chats.innerHTML = "";

	rooms.forEach((room) => {
		chats.insertAdjacentHTML(
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

const setClickOnRooms = () => {
	const chats = document.querySelectorAll(".sidebar__contact-item");
	chats.forEach((chat) => {
		chat.addEventListener("click", () => {
			const msgInput = document.querySelector(
				".chat__content-bottom-bar-input"
			);

			msgInput.value = "";

			roomName = chat.dataset.room;
			namespaceSocket.emit("joining", roomName);

			namespaceSocket.off("roomInfo");
			namespaceSocket.on("roomInfo", (roomInfo) => {
				console.log("roomInfo ->", roomInfo);
				const chatHeader = document.querySelector(".chat__header");
				chatHeader.classList.add("chat__header--active");

				const chatContent = document.querySelector(".chat__content");
				chatContent.classList.add("chat__content--active");

				const chatName = document.querySelector(".chat__header-name");
				chatName.innerHTML = roomInfo.title;

				const chatAvatar = document.querySelector(
					".chat__header-avatar"
				);
				chatAvatar.src = `http://localhost:4003/${roomInfo.image}`;

				const chatsContainer = document.querySelector(
					".chat__content-main"
				);
				chatsContainer.innerHTML = "";

				roomInfo.messages.forEach((item) => {
					if (item.sender === user._id) {
						chatsContainer.insertAdjacentHTML(
							"beforeend",
							`
                  <div class="chat__content-receiver-wrapper chat__content-wrapper">
                    <div class="chat__content-receiver">
                      <span class="chat__content-receiver-text">${item.message}</span>
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
                    <span class="chat__content-sender-text">${item.message}</span>
                    <span class="chat__content-chat-clock">17:55</span>
                  </div>
                </div>
              `
						);
					}
				});
			});

			getAndShowRoomOnlineUsers();
		});
	});
};

const getAndShowRoomOnlineUsers = () => {
	namespaceSocket.on("onlineUsersCount", (count) => {
		const chatOnlineUsersCount = document.querySelector(
			".chat__header-status"
		);
		chatOnlineUsersCount.innerHTML = `${count} Users online`;
	});
};

export const sendMessageInRoom = () => {
	const msgInput = document.querySelector(".chat__content-bottom-bar-input");

	msgInput.addEventListener("keyup", (event) => {
		if (event.keyCode === 13) {
			const message = event.target.value.trim();
			if (message) {
				namespaceSocket.emit("newMsg", {
					message,
					roomName,
					sender: user._id,
				});
				event.target.value = "";
			}
		}
	});
};

export const getMsg = () => {
	// const chatsContent = document.querySelector(".chat__content--active");
	const chatsContainer = document.querySelector(".chat__content-main");

	namespaceSocket.off("confirmMsg");
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

		// chatsContent.scrollTo(0, chatsContent.scrollHeight);
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
		const chatHeaderStatus = document.querySelector(".chat__header-status");
		if (data.isTyping) {
			if (data.username !== user.username) {
				chatHeaderStatus.innerHTML = `${data.username} is typing ...`;
			}
		} else {
			getAndShowRoomOnlineUsers();
		}
	});
};

export const sendLocation = () => {
	const sendLocationElem = document.querySelector(".location-icon");
	sendLocationElem.addEventListener("click", () => {
		console.log("sendLocation");
		namespaceSocket.emit("newLocation", {
			location: { x: 35.538931360333486, y: 50.811767578125 },
			roomName,
			sender: user._id,
		});
	});
};

export const getLocation = () => {
	const chatsContainer = document.querySelector(".chat__content-main");
	namespaceSocket.off("confirmLocation");
	namespaceSocket.on("confirmLocation", (data) => {
		console.log("Confirm Location ->", data);
	});
};

export const initMap = (id, x, y) => {
	// Initialize map
	let map = L.map(id).setView([x, y], 13);

	let icon = L.icon({
		iconUrl:
			"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNyA0OCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InBpbi1hIiB4MT0iNTAlIiB4Mj0iNTAlIiB5MT0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0E2MjYyNiIgc3RvcC1vcGFjaXR5PSIuMzIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTYyNjI2Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdGggaWQ9InBpbi1jIiBkPSJNMTguNzk0MzMzMywxNC40NjA0IEMxOC43OTQzMzMzLDE3LjQwNTQ1OTkgMTYuNDA3NDQ5NiwxOS43OTM3MzMzIDEzLjQ2MDEwNDcsMTkuNzkzNzMzMyBDMTAuNTE0NTUwNCwxOS43OTM3MzMzIDguMTI3NjY2NjcsMTcuNDA1NDU5OSA4LjEyNzY2NjY3LDE0LjQ2MDQgQzguMTI3NjY2NjcsMTEuNTE1MzQwMSAxMC41MTQ1NTA0LDkuMTI3MDY2NjcgMTMuNDYwMTA0Nyw5LjEyNzA2NjY3IEMxNi40MDc0NDk2LDkuMTI3MDY2NjcgMTguNzk0MzMzMywxMS41MTUzNDAxIDE4Ljc5NDMzMzMsMTQuNDYwNCIvPgogICAgPGZpbHRlciBpZD0icGluLWIiIHdpZHRoPSIyMzEuMiUiIGhlaWdodD0iMjMxLjIlIiB4PSItNjUuNiUiIHk9Ii00Ni45JSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij4KICAgICAgPGZlT2Zmc2V0IGR5PSIyIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIi8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiIHN0ZERldmlhdGlvbj0iMiIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ic2hhZG93Qmx1ck91dGVyMSIgdmFsdWVzPSIwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMjQgMCIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICA8cGF0aCBmaWxsPSJ1cmwoI3Bpbi1hKSIgZD0iTTEzLjA3MzcsMS4wMDUxIEM1LjgwMzIsMS4yMTUxIC0wLjEzOTgsNy40Njg2IDAuMDAyNywxNC43MzkxIEMwLjEwOTIsMjAuMTkwMSAzLjQ1NTcsMjQuODQ2MSA4LjE5NTcsMjYuODYzNiBDMTAuNDUzMiwyNy44MjUxIDExLjk3MTIsMjkuOTc0NiAxMS45NzEyLDMyLjQyODYgTDExLjk3MTIsMzkuNDExNTUxNCBDMTEuOTcxMiw0MC4yMzk1NTE0IDEyLjY0MTcsNDAuOTExNTUxNCAxMy40NzEyLDQwLjkxMTU1MTQgQzE0LjI5OTIsNDAuOTExNTUxNCAxNC45NzEyLDQwLjIzOTU1MTQgMTQuOTcxMiwzOS40MTE1NTE0IEwxNC45NzEyLDMyLjQyNTYgQzE0Ljk3MTIsMzAuMDEyMSAxNi40MTcyLDI3LjgzNDEgMTguNjQ0NywyNi45MDU2IEMyMy41MTY3LDI0Ljg3NzYgMjYuOTQxMiwyMC4wNzYxIDI2Ljk0MTIsMTQuNDcwNiBDMjYuOTQxMiw2Ljg5ODYgMjAuNjkzNywwLjc4NjEgMTMuMDczNywxLjAwNTEgWiIvPgogICAgPHBhdGggZmlsbD0iI0E2MjYyNiIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNMTMuNDcwNiw0Ny44MTIgQzEyLjU1NTYsNDcuODEyIDExLjgxNDYsNDcuMDcxIDExLjgxNDYsNDYuMTU2IEMxMS44MTQ2LDQ1LjI0MSAxMi41NTU2LDQ0LjUgMTMuNDcwNiw0NC41IEMxNC4zODU2LDQ0LjUgMTUuMTI2Niw0NS4yNDEgMTUuMTI2Niw0Ni4xNTYgQzE1LjEyNjYsNDcuMDcxIDE0LjM4NTYsNDcuODEyIDEzLjQ3MDYsNDcuODEyIFoiLz4KICAgIDx1c2UgZmlsbD0iIzAwMCIgZmlsdGVyPSJ1cmwoI3Bpbi1iKSIgeGxpbms6aHJlZj0iI3Bpbi1jIi8+CiAgICA8dXNlIGZpbGw9IiNGRkYiIHhsaW5rOmhyZWY9IiNwaW4tYyIvPgogIDwvZz4KPC9zdmc+Cg==",
		iconSize: [45, 45],
	});

	L.marker([x, y], { icon: icon }).addTo(map);

	L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">33</a>',
	}).addTo(map);
};

export const sendFile = () => {
	const fileIcon = document.querySelector("#file-input");

	fileIcon.addEventListener("change", (event) => {
		console.log(event.target.files);
		namespaceSocket.emit("newMedia", {
			file: event.target.files[0],
			filename: event.target.files[0].name,
			sender: user._id,
			roomName,
		});
	});
};

export const getFile = () => {
	namespaceSocket.on("confirmMedia", (data) => {
		console.log("New Media ->", data);
	});
};
