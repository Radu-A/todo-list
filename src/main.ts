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
  __v: number;
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
const filterTasks = (filterStatus = "all"): object[] => {
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
