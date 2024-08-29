export const showNamespaces = (namespaces) => {
  const chatCategories = document.querySelector(".sidebar__categories-list");
  chatCategories.innerHTML = "";

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
  const namespaceSocket = io(`http://localhost:4003${namespaceHref}`);

  namespaceSocket.on("connect", () => {
    namespaceSocket.on("namespaceRooms", (rooms) => {
      showNamespaceChats(rooms);
    });
  });
};

export const showNamespaceChats = (rooms) => {
  const chats = document.querySelector(".sidebar__contact-list");
  chats.innerHTML = "";

  console.log(rooms);

  rooms.forEach((room) => {
    chats.insertAdjacentHTML(
      "beforeend",
      `
          <li class="sidebar__contact-item">
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
};
