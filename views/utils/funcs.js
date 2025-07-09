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

                  </div>
                    </div>
                
              </a>
        </li>
      `
		);
	});

	setClickOnRooms();
};

export const showActiveCategory = (namespaces) => {
	const chatCategories = document.querySelectorAll(
		".sidebar__categories-item"
	);

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
			activeNamespaceElem.classList.remove(
				"sidebar__categories-item--active"
			);

			event.target.classList.add("sidebar__categories-item--active");
		});
	});
};

let prevSelectedChat = null;

const setClickOnRooms = () => {
	const chats = document.querySelectorAll(".sidebar__contact-item");
	const chatsContainer = document.querySelector(".chat__content-main");
	let sideBarParent = document.querySelector(".costom-col-3");
	let mainConainer = document.querySelector(".costom-col-9");

	chats.forEach((chat) => {
		chat.addEventListener("click", (event) => {
			const mainContents = document.querySelector(".chat__content");

			// Remove active class from the previously selected item
			if (prevSelectedChat) {
				prevSelectedChat.children[0].classList.remove(
					"sidebar__contact-link--selected"
				);
			}

			// Add active class to the currently clicked item
			chat.children[0].classList.add("sidebar__contact-link--selected");

			// Update the previous selected item to the current one
			prevSelectedChat = chat;

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

				const chatProfile = document.querySelector(
					".chat__header-avatar"
				);
				chatProfile.src = `http://localhost:4003/${roomInfo.image}`;

				chatsContainer.innerHTML = "";
				console.log(roomInfo);
				sideBarParent.classList.toggle("sideBar-hide");
				mainConainer.classList.toggle("container-hide");

				roomInfo.messages.forEach((messageInfo) => {
					if (messageInfo.sender._id === user._id) {
						chatsContainer.insertAdjacentHTML(
							"beforeend",
							`
                <div class="chat__content-receiver-wrapper chat__content-wrapper">
                  <div class="chat__content-receiver">
                    <span class="chat__content-receiver-text">${messageInfo.message}</span>
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
                    <span class="chat__content-sender-name">${messageInfo.sender.username}</span>
                    <span class="chat__content-sender-text">${messageInfo.message}</span>
                  </div>
                </div>
              `
						);
					}
				});
				mainContents.scrollTop = mainContents.scrollHeight;
			});
			getAndShowRoomOnlineUsersCount();
		});
	});
};

const getAndShowRoomOnlineUsersCount = () => {
	namespaceSocket.on("onlineUsersCount", (count) => {
		const chatOnlineUsersCount = document.querySelector(
			".chat__header-status"
		);
		chatOnlineUsersCount.innerHTML = `${count} online`;
	});
};

export const sendMsg = () => {
	const msgInput = document.querySelector(".chat__content-bottom-bar-input");
	const sendBtn = document.querySelector(
		".chat__content-bottom-bar-right-icon"
	);

	msgInput.addEventListener("keyup", (event) => {
		if (event.keyCode === 13) {
			sendMessageLogic(event);
		}
	});
	sendBtn.addEventListener("click", (event) => {
		sendMessageLogic(event, msgInput);
	});
};

const sendMessageLogic = (event, input) => {
	let inputElement = event.target;
	if (input) {
		inputElement = input;
	}
	const message = inputElement.value.trim();
	if (message) {
		namespaceSocket.emit("newMsg", {
			message,
			roomName,
			senderID: user._id,
		});
		inputElement.value = "";
	}
};

export const getMsg = () => {
	const mainContents = document.querySelector(".chat__content");
	const chatsContainer = document.querySelector(".chat__content-main");

	namespaceSocket.on("confirmMsg", (data) => {
		console.log(user);
		if (data.sender._id === user._id) {
			chatsContainer.insertAdjacentHTML(
				"beforeend",
				`
          <div class="chat__content-receiver-wrapper chat__content-wrapper">
            <div class="chat__content-receiver">
              <span class="chat__content-receiver-text">${data.message}</span>
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
            <span class="chat__content-sender-name">${data.sender.username}</span>
              <span class="chat__content-sender-text">${data.message}</span>
            </div>
          </div>
        `
			);
		}

		mainContents.scrollTop = mainContents.scrollHeight;
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
