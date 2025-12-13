// ==========================
// 1. CONFIGURATION AND INITIALIZATION
// ==========================

// --- DOM ELEMENTS ---
const logoutButton: HTMLButtonElement =
  document.getElementById("logout-button");
const avatar: HTMLButtonElement = document.getElementById("avatar");
const userDropdown: HTMLDivElement = document.getElementById("user-dropdown");
const usernameDisplay: HTMLParagraphElement =
  document.getElementById("username-display");
const dropdownLogoutButton: HTMLDivElement = document.getElementById(
  "dropdown-logout-button"
);
const todoContainer: HTMLDivElement = document.getElementById("todo-container");
const doneContainer: HTMLDivElement = document.getElementById("done-container");
const currentDate: HTMLTimeElement = document.getElementById("current-day");
const newInput: HTMLInputElement = document.getElementById("new-input");
const newButton: HTMLInputElement = document.getElementById("new-button");
const filterButtons: HTMLButtonElement[] = [
  ...document.getElementsByClassName("filter-button"),
];

// --- STATE AND API ---
/**
 * Local cache of all tasks fetched from the server.
 * @type {Array<Object>}
 */
type MongoId = string;
type TaskStatus = "todo" | "done";
interface Task {
  // MongoDb default fields
  _id: MongoId;
  __v: number; // Optimistic Concurrency Control
  createdAt: string;
  updatedAt: string;
  // Schema fields
  userId: MongoId;
  title: string;
  status: TaskStatus;
  position: number;
}
let taskList: Task[] = [];
// RELATIVE
// const API_URL: String = "/api/tasks";
// LOCAL
const API_URL: string = "http://localhost:5000/api/tasks";
// KOYEB
// const API_URL: String = "https://zealous-odele-radu-a-2bb4e20d.koyeb.app/api/tasks";
// RENDER
// const API_URL: String = "https://todo-server-1zx1.onrender.com/api/tasks";

// ==========================
// 2. COMMON UTILITIES
// ==========================

/** Formats and prints the current date in the header. */
const printCurrentDate = (): void => {
  const today: Date = new Date();
  const formatedDate: string = today.toLocaleDateString("en-EN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  currentDate.textContent = formatedDate;
};

/** Resets the ToDo and Done sections to their initial state. */
const clearTasks = (): void => {
  todoContainer.innerHTML = "";
  doneContainer.innerHTML = "";
};

/**
 * Filters the local taskList based on a status.
 * @param {string} [filterStatus="all"] - The status to filter by ("all", "todo", or "done").
 * @returns {Array<Object>} The filtered list of tasks.
 */
const filterTasks = (filterStatus = "all"): Task[] => {
  return filterStatus === "all"
    ? taskList
    : taskList.filter((task) => task.status == filterStatus);
};

/** Updates the pending and completed task counters. */
const printCounters = (): void => {
  const todoCounter: HTMLSpanElement = document.getElementById("todo-counter");
  const doneCounter: HTMLSpanElement = document.getElementById("done-counter");
  todoCounter.textContent = taskList
    .filter((task) => task.status == "todo")
    .length.toString();
  doneCounter.textContent = taskList
    .filter((task) => task.status == "todo")
    .length.toString();
};

/** Highlights the active filter button. */
const activateFilterButton = (clickedButton: HTMLButtonElement): void => {
  filterButtons.forEach((button: HTMLButtonElement) => {
    button.classList.toggle("filter-active", button === clickedButton);
  });
};

/**
 * Retrieves the JWT from localStorage.
 * If not found, redirects the user to the login page.
 * @returns {string|null} The JWT, or null if redirected.
 */
const getToken = (): string | null => {
  const token: string | null = localStorage.getItem("userToken");
  if (!token) {
    console.error("No session token found. Redirecting to login.");
    const baseUrl: string = `${window.location.origin}`;
    window.location.href = `${baseUrl}/pages/login.html`;
    return null;
  }
  return token;
};

/**
 * Logs the user out by clearing the token and redirecting to the login page.
 */
const handleLogout = (): void => {
  console.log("Logging out user...");
  localStorage.removeItem("userToken");
  const baseUrl: string = `${window.location.origin}`;
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
const printTask = (_id: string, taskName: string, status: string): void => {
  let taskArticle: HTMLElement = document.createElement("article");
  taskArticle.className = "todo-article";
  taskArticle.id = _id;
  taskArticle.innerHTML = `
    <div class="task-header" id="${_id}-task-header">
      <div class="status-icon ${status}" id="${_id}-icon"></div>
      <h3 class="task-name" id="${_id}-task-name">${taskName}</h3>
    </div>
    <button class="delete-button" id="${_id}-delete-button"></button>`;

  // Determine the target section
  const container: HTMLDivElement =
    status === "todo" ? todoContainer : doneContainer;
  container.appendChild(taskArticle);

  // Trigger CSS animation
  requestAnimationFrame((): void => {
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

const getTasks = async (filterStatus = "all"): Promise<void> => {
  const token: string | null = getToken();
  if (!token) return;

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
    let filteredTaskList: Task[] = filterTasks(filterStatus);

    filteredTaskList.forEach((task) =>
      printTask(task._id, task.title, task.status)
    );

    printCounters();
  } catch (error) {
    console.error("Failed in getTasks:", error);
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
const assignStatus = (taskArticle: HTMLElement, _id: string): void => {
  const statusIcon: HTMLElement | null = document.getElementById(`${_id}-icon`);

  if (statusIcon) {
    statusIcon.addEventListener(
      "click",
      async (event: Event): Promise<void> => {
        event.preventDefault();

        const oldStatus: TaskStatus = statusIcon.classList.contains("todo")
          ? "todo"
          : "done";
        const newStatus: TaskStatus = oldStatus === "todo" ? "done" : "todo";

        try {
          // Wait for the backend update to be successful before changing the UI
          const _updatedTask: Promise<Task> = await updateTaskInApi(_id, {
            status: newStatus,
          });

          // 1. Update the local state (taskList array) to match the change
          const taskIndex: number = taskList.findIndex(
            (task) => task._id === _id
          );
          if (taskIndex !== -1) taskList[taskIndex].status = newStatus;

          // 2. Perform the visual DOM manipulation
          taskArticle.classList.remove("article-show"); // Start fade-out
          statusIcon.classList.replace(oldStatus, newStatus);

          const oldContainer: HTMLDivElement =
            oldStatus === "todo" ? todoContainer : doneContainer;
          const newContainer: HTMLDivElement =
            newStatus === "todo" ? todoContainer : doneContainer;

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
          requestAnimationFrame((): void => {
            taskArticle.classList.add("article-show");
          });

          printCounters();
        } catch (error) {
          // 400, 500, or network error
          console.error("Error on updating task:", error);
          alert("There was an error saving the state. Try it again later");
          // Opcional: Revertir la interfaz a la antigua si lo deseas.
        }
      }
    );
  } else {
    // Manejo de error si el ID está mal.
    console.error(`Element with ID ${_id}-icon not founded.`);
  }
};
