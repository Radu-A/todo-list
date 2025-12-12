// ==========================
// 1. CONFIGURATION AND INITIALIZATION
// ==========================

// --- DOM ELEMENTS ---
const logoutButton = document.getElementById("logout-button");
const avatar = document.getElementById("avatar");
const userDropdown = document.getElementById("user-dropdown");
const usernameDisplay = document.getElementById("username-display");
const dropdownLogoutButton = document.getElementById("dropdown-logout-button");
const todoContainer = document.getElementById("todo-container");
const doneContainer = document.getElementById("done-container");
const currentDate = document.getElementById("current-day");
const newInput = document.getElementById("new-input");
const newButton = document.getElementById("new-button");
const filterButtons = [...document.getElementsByClassName("filter-button")];

// --- STATE AND API ---
/**
 * Local cache of all tasks fetched from the server.
 * @type {Array<Object>}
 */
let taskList = [];
// RELATIVE
// const API_URL = "/api/tasks";
// LOCAL
const API_URL = "http://localhost:5000/api/tasks";
// KOYEB
// const API_URL = "https://zealous-odele-radu-a-2bb4e20d.koyeb.app/api/tasks";
// RENDER
// const API_URL = "https://todo-server-1zx1.onrender.com/api/tasks";

// ==========================
// 2. COMMON UTILITIES
// ==========================

/** Formats and prints the current date in the header. */
const printCurrentDate = () => {
  const today = new Date();
  const formatedDate = today.toLocaleDateString("en-EN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  currentDate.textContent = formatedDate;
};

/** Resets the ToDo and Done sections to their initial state. */
const clearTasks = () => {
  todoContainer.innerHTML = ``;
  doneContainer.innerHTML = ``;
};

/**
 * Filters the local taskList based on a status.
 * @param {string} [filterStatus="all"] - The status to filter by ("all", "todo", or "done").
 * @returns {Array<Object>} The filtered list of tasks.
 */
const filterTasks = (filterStatus = "all") => {
  return filterStatus === "all"
    ? taskList
    : taskList.filter((task) => task.status == filterStatus);
};

/** Updates the pending and completed task counters. */
const printCounters = () => {
  const todoCounter = document.getElementById("todo-counter");
  const doneCounter = document.getElementById("done-counter");
  todoCounter.textContent = taskList.filter(
    (task) => task.status == "todo"
  ).length;
  doneCounter.textContent = taskList.filter(
    (task) => task.status == "done"
  ).length;
};

/** Highlights the active filter button. */
const activateFilterButton = (clickedButton) => {
  filterButtons.forEach((button) => {
    button.classList.toggle("filter-active", button === clickedButton);
  });
};

/**
 * Retrieves the JWT from localStorage.
 * If not found, redirects the user to the login page.
 * @returns {string|null} The JWT, or null if redirected.
 */
const getToken = () => {
  const token = localStorage.getItem("userToken");

  if (!token) {
    console.error("No session token found. Redirecting to login.");
    const baseUrl = `${window.location.origin}`;
    window.location.href = `${baseUrl}/pages/login.html`;
    return null; // Stop execution
  }
  return token;
};

/**
 * Logs the user out by clearing the token and redirecting to the login page.
 */
const handleLogout = () => {
  console.log("Logging out user...");
  localStorage.removeItem("userToken");
  const baseUrl = `${window.location.origin}`;
  window.location.href = `${baseUrl}/pages/login.html`;
};

// ==========================
// 3. TASK RENDERING AND LIFECYCLE
// ==========================

/**
 * Creates and adds a task element to the DOM.
 * @param {string} _id - MongoDB ID used as the DOM ID.
 * @param {string} taskName - The title of the task.
 * @param {string} status - The status ('todo' or 'done').
 */
const printTask = (_id, taskName, status) => {
  let taskArticle = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = _id;
  taskArticle.innerHTML = `
    <div class="task-header" id="${_id}-task-header">
      <div class="status-icon ${status}" id="${_id}-icon"></div>
      <h3 class="task-name" id="${_id}-task-name">${taskName}</h3>
    </div>
    <button class="delete-button" id="${_id}-delete-button"></button>`;

  // Determine the target section
  const container = status === "todo" ? todoContainer : doneContainer;
  container.appendChild(taskArticle);

  // Trigger CSS animation
  requestAnimationFrame(() => {
    taskArticle.classList.add("article-show");
  });

  // Assign events
  activateDeleteButton(_id, status);
  assignStatus(taskArticle, _id);
  assignEditEvent(_id);
};

// ==========================
// 4. CRUD OPERATIONS (API CALLS)
// ==========================

/**
 * Fetches all tasks from the API, updates the local taskList,
 * and renders them to the DOM.
 * @param {string} [filterStatus="all"] - The filter to apply after fetching.
 */
const getTasks = async (filterStatus = "all") => {
  const token = getToken();
  if (!token) return; // Stop if no token

  clearTasks();
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    taskList = await response.json();
    let filteredTaskList = filterTasks(filterStatus);

    filteredTaskList.forEach((task) =>
      printTask(task._id, task.title, task.status)
    );
    printCounters();
  } catch (error) {
    console.error("Failed in getTasks:", error);
  }
};

/**
 * Creates a new task in the API and renders it to the DOM.
 * @param {string} taskName - The title for the new task.
 */
const createTask = async (taskName) => {
  const token = getToken();
  if (!token) return;

  const taskData = { title: taskName };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to create task.");

    const newTask = await response.json();
    taskList.push(newTask); // Update local state
    printTask(newTask._id, newTask.title, newTask.status); // Render
    printCounters();
  } catch (error) {
    console.error("Failed in createTask:", error);
  }
};

/**
 * Deletes a task from the API and triggers its removal from the DOM.
 * @param {string} _id - The ID of the task to delete.
 * @param {string} status - The current status (used to find the DOM element).
 */
const deleteTask = async (_id, status) => {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to delete task.");

    // Update local list
    taskList = taskList.filter((task) => task._id !== _id);
    // Trigger DOM removal (with animation)
    deleteFromDocument(_id, status);
  } catch (error) {
    console.error("Failed in deleteTask:", error);
  }
};

/**
 * Updates the task's title or status in the API (PATCH).
 * @param {string} _id - ID of the task to update.
 * @param {Object} updateData - Object with fields to modify (e.g., {title} or {status}).
 * @returns {Promise<boolean>} True if the update was successful.
 */
const updateTaskInApi = async (_id, updateData) => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/${_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok)
      throw new Error(`Failed to update on server: ${response.statusText}`);
    return true;
  } catch (error) {
    console.error("Error in updateTaskInApi:", error);
    return false;
  }
};

// ==========================
// 5. SHOW USER NAME
// ==========================

/**
 * Decodes a JWT payload from its Base64Url string.
 * @param {string} token - The JWT.
 * @returns {Object|null} The decoded payload object, or null on error.
 */
const decodeJwt = (token) => {
  try {
    const parts = token.split(".");
    const payload = parts[1];
    // 1. Replace URL-unsafe characters
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // 2. Use atob() to decode Base64 to a binary string
    const raw = atob(base64);

    // 3. Force interpretation as UTF-8
    const decodedPayload = decodeURIComponent(escape(raw));

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding token: ", error);
    return null;
  }
};

/**
 * Gets user data from the JWT and displays it in the header.
 */
const getUserData = () => {
  const token = getToken();
  if (!token) return;

  const payload = decodeJwt(token);
  if (!payload) return;

  const username = payload.username;
  const initial = username[0].toUpperCase();

  avatar.textContent = initial;
  usernameDisplay.textContent = `${username}`;
};

getUserData();

// ==========================
// 6. REORDERING LOGIC
// ==========================

/**
 * Handles task reordering in the DOM and local list.
 * Calls the API to persist the new order.
 * @param {string} _id - ID of the dragged task.
 * @param {number} newIndex - The new position of the task.
 * @param {number} oldIndex - The original position of the task.
 */
const handleTaskReorder = async (_id, newIndex, oldIndex) => {
  // 1. Find the moved task in the local list
  const taskToMove = taskList.find((task) => task._id === _id);
  if (!taskToMove) {
    console.error("Task not found in local list.");
    return;
  }
  const status = taskToMove.status; // 'todo' or 'done'

  // 2. Optimistic update of local state
  // Filter the list by the correct status
  const currentStatusList = taskList
    .filter((task) => task.status === status)
    .sort((a, b) => a.position - b.position); // Ensure correct order

  // Move the item in this filtered list
  const [movedItem] = currentStatusList.splice(oldIndex, 1);
  currentStatusList.splice(newIndex, 0, movedItem);

  // 3. Re-assign the 'position' property in the global 'taskList'
  // This is VITAL so that subsequent drag-and-drops have the correct 'oldIndex'.
  currentStatusList.forEach((task, index) => {
    const globalTask = taskList.find((t) => t._id === task._id);
    if (globalTask) globalTask.position = index;
  });

  // 4. Call the API to save the change in the backend
  try {
    const token = getToken();
    if (!token) return;

    const response = await fetch(`${API_URL}/${_id}/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPosition: oldIndex, // The 'oldIndex' from Sortable.js
        newPosition: newIndex, // The 'newIndex' from Sortable.js
        status: status,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save reorder to server.");
    }

    console.log(`Task ${_id} moved from ${oldIndex} to ${newIndex} and saved.`);
  } catch (error) {
    console.error("Error saving reorder:", error);
    // If the API fails, the DOM is out of sync with the DB.
    // Force a reload to return to the DB's true state.
    alert("Error saving the new order. Reloading the list.");
    const currentFilter =
      document.querySelector(".filter-active").dataset.filter;
    getTasks(currentFilter); // Reload
  }
};

// ==========================
// 7. EVENT HANDLERS AND DOM LOGIC
// ==========================

/**
 * Assigns the click handler for changing a task's status (todo <-> done).
 * This handles the API call, local state update, and DOM manipulation
 * (moving the element between containers with animation).
 *
 * @param {HTMLElement} taskArticle - The <article> element for the task.
 *ax @param {string} _id - The task's MongoDB ID.
 */
const assignStatus = (taskArticle, _id) => {
  const statusIcon = document.getElementById(`${_id}-icon`);

  statusIcon.addEventListener("click", async (event) => {
    event.preventDefault();

    const oldStatus = statusIcon.classList.contains("todo") ? "todo" : "done";
    const newStatus = oldStatus === "todo" ? "done" : "todo";

    // Wait for the backend update to be successful before changing the UI
    const updateSuccessful = await updateTaskInApi(_id, { status: newStatus });

    if (updateSuccessful) {
      // 1. Update the local state (taskList array) to match the change
      const taskIndex = taskList.findIndex((task) => task._id === _id);
      if (taskIndex !== -1) taskList[taskIndex].status = newStatus;

      // 2. Perform the visual DOM manipulation
      taskArticle.classList.remove("article-show"); // Start fade-out
      statusIcon.classList.replace(oldStatus, newStatus);

      const oldContainer = oldStatus === "todo" ? todoContainer : doneContainer;
      const newContainer = newStatus === "todo" ? todoContainer : doneContainer;

      oldContainer.removeChild(taskArticle);

      // --- Key Insertion Logic ---
      if (newStatus === "done") {
        // Add to the TOP of the "Done" list (LIFO - Last In, First Out)
        newContainer.prepend(taskArticle);
      } else {
        // Add to the BOTTOM of the "ToDo" list (FIFO - First In, First Out)
        newContainer.appendChild(taskArticle);
      }

      // Trigger the fade-in animation in the new location
      requestAnimationFrame(() => {
        taskArticle.classList.add("article-show");
      });

      printCounters();
    }
  });
};

/** Assigns the click event to the delete button. */
const activateDeleteButton = (_id, status) => {
  const deleteButton = document.getElementById(`${_id}-delete-button`);
  if (deleteButton) {
    deleteButton.classList.add("active");
    deleteButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        deleteTask(_id, status);
      },
      { once: true } // Use { once: true } to auto-remove the listener after click
    );
  }
};

/**
 * Handles the delete animation and removes the element from the DOM.
 * @param {string} _id - The ID of the task to remove.
 * @param {string} status - The status, used to find the correct parent container.
 */
const deleteFromDocument = (_id, status) => {
  const taskArticle = document.getElementById(`${_id}`);
  taskArticle.classList.remove("article-show");
  taskArticle.classList.add("article-unshow"); // Triggers fade-out animation

  taskArticle.addEventListener(
    "animationend",
    () => {
      const section = status === "todo" ? todoContainer : doneContainer;
      if (section.contains(taskArticle)) {
        // Extra check before removing
        section.removeChild(taskArticle);
      }
      printCounters();
    },
    { once: true }
  );
};

// --- Edit Title Logic ---

/**
 * Assigns the click event (to start editing) to the task's H3 title.
 * @param {string} _id - The task's ID.
 */
const assignEditEvent = (_id) => {
  const taskNameH3 = document.getElementById(`${_id}-task-name`);

  // Use { once: true } so the listener self-destructs after one click.
  // This is key to avoiding conflicts when the H3 is re-inserted.
  taskNameH3.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      createEditInput(taskNameH3, _id);
    },
    { once: true }
  );
};

/**
 * Replaces the H3 title with an <input> field to allow editing.
 * @param {HTMLElement} taskNameH3 - The <h3> element that was clicked.
 * @param {string} _id - The task's ID.
 */
const createEditInput = (taskNameH3, _id) => {
  const taskHeader = document.getElementById(`${_id}-task-header`);
  const editInput = document.createElement("input");
  editInput.classList.add("edit-input");

  taskHeader.replaceChild(editInput, taskNameH3);
  editInput.value = taskNameH3.textContent;
  editInput.focus();

  // Assign save/cancel events
  assignKeydownEvent(taskHeader, taskNameH3, editInput, _id);
  assignBlurEvent(taskHeader, taskNameH3, editInput, _id);
};

/** Handles Enter (save) and Escape (cancel) on the input. */
const assignKeydownEvent = (taskHeader, taskNameH3, editInput, _id) => {
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (editInput.value.trim()) {
        updateTaskName(_id, taskHeader, taskNameH3, editInput);
      }
    } else if (event.key === "Escape") {
      // Replaces input with H3 if Escape is pressed
      try {
        taskHeader.replaceChild(taskNameH3, editInput);
        assignEditEvent(_id); // Re-assign the click listener to the H3
      } catch (e) {
        /* ignore if already gone */
      }
    }
  });
};

/** Handles the loss of focus (blur) to save or revert. */
const assignBlurEvent = (taskHeader, taskNameH3, editInput, _id) => {
  editInput.addEventListener("blur", () => {
    if (editInput.value.trim()) {
      updateTaskName(_id, taskHeader, taskNameH3, editInput);
    } else {
      // If it's empty, revert to the original H3
      try {
        taskHeader.replaceChild(taskNameH3, editInput);
        assignEditEvent(_id); // Re-assign the click listener to the H3
      } catch (e) {
        /* ignore if already gone */
      }
    }
  });
};

/**
 * Updates the title in the API and restores the H3 in the DOM.
 * @param {string} _id
 * @param {HTMLElement} taskHeader
 * @param {HTMLElement} taskNameH3
 * @param {HTMLElement} editInput
 */
const updateTaskName = async (_id, taskHeader, taskNameH3, editInput) => {
  const newTaskName = editInput.value.trim();
  const titleChanged = taskNameH3.textContent !== newTaskName;

  // 1. If it hasn't changed, or is empty, restore the DOM and exit.
  if (!titleChanged) {
    try {
      taskHeader.replaceChild(taskNameH3, editInput);
      assignEditEvent(_id);
    } catch (e) {
      /* ignore */
    }
    return;
  }

  // 2. API call to save the new title
  const updateSuccessful = await updateTaskInApi(_id, { title: newTaskName });

  // 3. DOM restoration and local update
  try {
    // Restore the H3 ONLY if the input is still a child.
    taskHeader.replaceChild(taskNameH3, editInput);
  } catch (e) {
    /* ignore error if blur already did this */
  }

  if (updateSuccessful) {
    // Update the visible H3 and local list if the API was successful.
    taskNameH3.textContent = newTaskName;
    const taskIndex = taskList.findIndex((task) => task._id === _id);
    if (taskIndex !== -1) taskList[taskIndex].title = newTaskName;
  }

  // 4. Re-assign the click listener to the H3 (always)
  assignEditEvent(_id);
};

// ==========================
// 8. EVENT LISTENERS SETUP
// ==========================

// Listener to show/hide the user-dropdown when clicking the avatar
avatar.addEventListener("click", () => {
  userDropdown.classList.toggle("hidden");
});

// Listener to log out from the dropdown
dropdownLogoutButton.addEventListener("click", (event) => {
  event.preventDefault();
  handleLogout();
});

// Listener to close the user-dropdown when clicking outside of it
document.addEventListener("click", (event) => {
  // 1. Get the main menu container
  const menuContainer = document.getElementById("user-menu-container");

  // 2. Check if the menu is visible. If not, do nothing.
  if (userDropdown.classList.contains("hidden")) {
    return;
  }

  // 3. Check if the click happened OUTSIDE the menu container
  if (!menuContainer.contains(event.target)) {
    // The click was outside -> hide the menu
    userDropdown.classList.add("hidden");
  }
});

// Listener to add task with Enter in the input.
newInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && newInput.value.trim()) {
    createTask(newInput.value.trim());
    newInput.value = "";
  }
});

// Listener to add task with the "Add" button.
newButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (newInput.value.trim()) {
    createTask(newInput.value.trim());
    newInput.value = "";
  }
});

// Listeners for filter buttons.
filterButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    getTasks(button.dataset.filter); // Load and filter
    activateFilterButton(button); // Activate button
  });
});

// ==========================
// 9. APPLICATION START
// ==========================

printCurrentDate();
getTasks();

// ==========================
// 10. INITIALIZATION SORTABLE
// ==========================

/** Initializes Sortable for the 'ToDo' list */
new Sortable(todoContainer, {
  group: "todoGroup", // Essential to prevent moving items to 'doneGroup'
  animation: 150,
  ghostClass: "sortable-ghost", // CSS class for the placeholder ghost
  filter: ".section-header",
  onEnd: function (evt) {
    // Logic to update the order in the backend
    handleTaskReorder(evt.item.id, evt.newIndex, evt.oldIndex);
  },
});

/** Initializes Sortable for the 'Done' list */
new Sortable(doneContainer, {
  group: "doneGroup", // Essential to prevent moving items to 'todoGroup'
  animation: 150,
  ghostClass: "sortable-ghost",
  filter: ".section-header",
  onEnd: function (evt) {
    // Logic to update the order in the backend
    handleTaskReorder(evt.item.id, evt.newIndex, evt.oldIndex);
  },
});
