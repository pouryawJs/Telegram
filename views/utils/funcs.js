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
				".sidebar__categories-item.sidebar__categories-item--active"
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

	setClickOnChats();
};

const setClickOnChats = () => {
	console.log("[setClickOnChats Ftuncion !!]");
	const chats = document.querySelectorAll(".sidebar__contact-item");
	chats.forEach((chat) => {
		chat.addEventListener("click", () => {
			roomName = chat.dataset.room;
			namespaceSocket.emit("joining", roomName);

			namespaceSocket.off("roomInfo");
			namespaceSocket.on("roomInfo", (roomInfo) => {
				console.log("RoomInfo ->", roomInfo);
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
					console.log(item.message);
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

		console.log("onlineUsersCount ->", count);
	});
};

export const sendMessage = () => {
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
				console.log("Msg Send Shod !!");
				event.target.value = "";
			}
		}
	});
};

export const getMsg = () => {
	console.log("GetMsg Function");
	// const chatsContent = document.querySelector(".chat__content--active");
	const chatsContainer = document.querySelector(".chat__content-main");

	namespaceSocket.off("confirmMsg");
	namespaceSocket.on("confirmMsg", (data) => {
		console.log("New Msg ->", data);
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
