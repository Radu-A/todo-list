// ==================
// VARIABLES
// ==================
// RELATIVE
// const API_URL = "/api";
// LOCAL
const API_URL = "http://localhost:5000/api";
// KOYEB
// const API_URL = "https://zealous-odele-radu-a-2bb4e20d.koyeb.app/api";
// RENDER
// const API_URL = "https://todo-server-1zx1.onrender.com/api";

const emailAuthInput = document.getElementById("email-auth-input");
const passwordAuthInput = document.getElementById("password-auth-input");
const repeatAuthInput = document.getElementById("repeat-auth-input");
const nameAuthInput = document.getElementById("name-auth-input");
const authButton = document.getElementById("auth-button");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
// ...después de const registerForm = ...
const authHeader = document.querySelector(".auth-header");
const authSub = document.querySelector(".auth-sub");
const authArticle = document.querySelector(".auth-article"); // El formulario
const statusContainer = document.querySelector("#status-container");
const loadingSpinner = document.querySelector("#loading-spinner");
const errorIcon = document.querySelector("#error-icon");
const tryAgainButton = document.querySelector("#try-again-button");

// ==================
// VALIDATION HELPERS (Refactored)
// ==================

/**
 * Displays a validation error message after a specific input element.
 * @param {HTMLElement} inputElement - The input field to show the error under.
 * @param {string} message - The error message text.
 * @param {string} messageId - The unique ID for the error message element.
 */
const showValidationError = (inputElement, message, messageId) => {
  // Clear any existing message for this specific validation
  clearValidationError(messageId);

  const errorMessage = document.createElement("p");
  errorMessage.className = "validation-message";
  errorMessage.id = messageId;
  errorMessage.textContent = message;
  inputElement.after(errorMessage);
};

/**
 * Clears a specific validation error message by its ID.
 * @param {string} messageId - The ID of the error message element to remove.
 */
const clearValidationError = (messageId) => {
  const existingMessage = document.getElementById(messageId);
  if (existingMessage) {
    existingMessage.remove();
  }
};

// ==================
// NAME VALIDATION (SYNC)
// ==================
const checkName = (name) => {
  // Regex: Min 3 chars, letters only, accents/ñ allowed.
  const regEx = /^[\p{L}\s]{3,20}$/u;
  return regEx.test(name);
};

/**
 * Validates the name input field. Displays an error if invalid.
 * @returns {boolean} True if valid, false if invalid.
 */
const nameValidation = () => {
  clearValidationError("name-validation-message");
  const name = nameAuthInput.value.trim();

  if (!name || !checkName(name)) {
    showValidationError(
      nameAuthInput,
      "Name must be 3-20 characters and contain only letters.",
      "name-validation-message"
    );
    return false;
  }
  return true;
};

// ==================
// EMAIL VALIDATION (ASYNC)
// ==================
const checkEmail = (email) => {
  // Robust email regex
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regEx.test(email);
};

/**
 * Validates the email input field. Checks format (sync) and existence (async).
 * @returns {Promise<boolean>} True if valid and available, false otherwise.
 */
const emailValidation = async () => {
  clearValidationError("email-validation-message");
  const email = emailAuthInput.value.trim();

  // 1. Format validation (Sync)
  if (!email || !checkEmail(email)) {
    showValidationError(
      emailAuthInput,
      "The email account is not valid.",
      "email-validation-message"
    );
    return false;
  }

  // 2. Existence check (Async) - Only on registration page
  if (registerForm) {
    const emailExists = await searchEmail(email);

    if (emailExists === true) {
      showValidationError(
        emailAuthInput,
        "This email address is already registered.",
        "email-validation-message"
      );
      return false;
    }
  }
  return true;
};

// ==================
// SEARCH EMAIL (ASYNC)
// ==================
/**
 * Checks the backend to see if an email address is already registered.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if the email exists, false otherwise.
 */
const searchEmail = async (email) => {
  const data = { email: email };

  try {
    const response = await fetch(`${API_URL}/user/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // If server responds with 500 (DB Error)
    if (response.status === 500) {
      console.error("Server error during email check:", result.message);
      return false;
    }

    // If email exists (Status 200 and exists: true)
    if (result.exists === true) {
      return true;
    }

    // If email does NOT exist (Status 200 and exists: false)
    return false;
  } catch (error) {
    console.error("Network or parsing error:", error);
    // Network error handling: assume it doesn't exist if we can't confirm
    return false;
  }
};

// ==================
// PASSWORD VALIDATION (SYNC)
// ==================
const checkPassword = (password) => {
  // Regex: Min 8 chars, no spaces, 1 lowercase, 1 number, 1 special char.
  const regEx = /^(?!.*\s)(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[\S]{8,}$/;
  return regEx.test(password);
};

/**
 * Validates the password input field based on regex. Displays an error if invalid.
 * @returns {boolean} True if valid, false if invalid.
 */
const passwordValidation = () => {
  clearValidationError("password-validation-message");
  const password = passwordAuthInput.value;

  if (!password || !checkPassword(password)) {
    showValidationError(
      passwordAuthInput,
      "Password must be at least 8 characters, with one lowercase, one number, and one special character.",
      "password-validation-message"
    );
    return false;
  }
  return true;
};

// ==================
// REPEAT PASSWORD VALIDATION (SYNC)
// ==================
/**
 * Validates if the repeated password matches the original password.
 * @returns {boolean} True if matching, false otherwise.
 */
const repeatPasswordValidation = () => {
  clearValidationError("repeat-validation-message");
  const password = passwordAuthInput.value;
  const repeatPassword = repeatAuthInput.value;

  if (password != repeatPassword) {
    showValidationError(
      repeatAuthInput,
      "Passwords do not match.",
      "repeat-validation-message"
    );
    return false;
  }
  return true;
};

// ==================
// FORM SUBMISSION VALIDATION (ASYNC)
// ==================

/**
 * Runs all field validations and checks if all are valid.
 * @returns {Promise<boolean>} True if all fields are valid, False if there are errors.
 */
const formValidation = async () => {
  // Run sync validations first
  const isNameValid = registerForm ? nameValidation() : true;
  const isPasswordValid = passwordValidation();
  const isRepeatValid = registerForm ? repeatPasswordValidation() : true;

  // The email validation is ASYNC and must be awaited
  const isEmailValid = await emailValidation();

  if (registerForm) {
    return isNameValid && isEmailValid && isPasswordValid && isRepeatValid;
  }
  if (loginForm) {
    return isEmailValid && isPasswordValid;
  }
};

// ==================
// LOGIN (ASYNC)
// ==================
/**
 * Handles the login form submission.
 * Sends credentials to the server, saves the token, and redirects on success.
 * @returns {Promise<void>}
 */
const handleLogin = async () => {
  setAuthFormLoading(true);
  const data = {
    email: emailAuthInput.value,
    password: passwordAuthInput.value,
  };

  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Handle Auth Failure (401/500)
    if (!res.ok) {
      let errorMessage;
      try {
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Intenta leer el error como JSON (lo que esperamos)
        const errorData = await res.json();
        errorMessage = errorData.message;
      } catch (jsonError) {
        // 2. Si falla el JSON.parse() (porque es HTML/texto),
        //    usamos el texto de estado del servidor.
        //    Esto captura el "Unexpected token 'T'"
        errorMessage = `Server Error: ${res.status} (${res.statusText})`;
        // --- FIN DE LA CORRECCIÓN ---
      }

      // Lanza el error (ya sea el del JSON o el genérico)
      throw new Error(errorMessage || `HTTP Error: ${res.status}`);
    }

    // SUCCESS (Status 200)
    const result = await res.json();

    // Save token
    localStorage.setItem("userToken", result.token);

    // REDIRECT ON SUCCESS
    const baseUrl = `${window.location.origin}`;
    window.location.href = `${baseUrl}/index.html`;
  } catch (err) {
    console.error("Login failed or network error:", err.message);

    // ANTES: showLoginError(err.message);

    // AHORA: Llama a la nueva función de UI
    if (err.message.includes("Failed to fetch")) {
      showAuthFailure(
        "server",
        "Could not connect to the server. Please try again later."
      );
    } else {
      // Asume que es un error de autenticación (ej. "Invalid credentials")
      showAuthFailure("auth", err.message);
    }
  }
};

/**
 * Displays a general error message at the bottom of the login form.
 * @param {string} message - The error message to display.
 */
const showLoginError = (message) => {
  const existingMessage = document.getElementById("login-message");
  if (existingMessage) existingMessage.remove();

  const loginMessage = document.createElement("p");
  loginMessage.textContent = message;
  loginMessage.className = "validation-message";
  loginMessage.id = "login-message";
  if (loginForm) {
    loginForm.appendChild(loginMessage);
  } else {
    registerForm.appendChild(loginMessage);
  }
};

// ==================
// REGISTER (ASYNC)
// ==================
/**
 * Handles the registration form submission.
 * Creates a new user, then automatically calls handleLogin() on success.
 * @returns {Promise<void>}
 */
const handleRegister = async () => {
  setAuthFormLoading(true);
  const data = {
    username: nameAuthInput.value,
    email: emailAuthInput.value,
    password: passwordAuthInput.value,
  };

  try {
    const res = await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // 1. Check for non-2xx status codes (400, 409, 500)
    if (!res.ok) {
      let errorMessage;
      try {
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Intenta leer el error como JSON (lo que esperamos)
        const errorData = await res.json();
        errorMessage = errorData.message;
      } catch (jsonError) {
        // 2. Si falla el JSON.parse() (porque es HTML/texto),
        //    usamos el texto de estado del servidor.
        //    Esto captura el "Unexpected token 'T'"
        errorMessage = `Server Error: ${res.status} (${res.statusText})`;
        // --- FIN DE LA CORRECCIÓN ---
      }

      // Lanza el error (ya sea el del JSON o el genérico)
      throw new Error(errorMessage || `HTTP Error: ${res.status}`);
    }

    // 2. SUCCESS (Status 201)
    // Registration was successful, now automatically log the user in.
    await handleLogin();
    // The handleLogin() function will handle the successful redirect.
    // No further action is needed here.
  } catch (err) {
    console.error("Login failed or network error:", err.message);

    // ANTES: showLoginError(err.message);

    // AHORA: Llama a la nueva función de UI
    if (err.message.includes("Failed to fetch")) {
      showAuthFailure(
        "server",
        "Could not connect to the server. Please try again later."
      );
    } else {
      // Asume que es un error de autenticación (ej. "Invalid credentials")
      showAuthFailure("auth", err.message);
    }
  }
};

// ==================
// GOOGLE AUTH (NUEVO)
// ==================
/**
 * Se llama cuando Google devuelve las credenciales del usuario.
 * @param {object} response - El objeto de credenciales de Google.
 */
function handleGoogleCredentialResponse(response) {
  // 'response.credential' es el token de ID (JWT) de Google
  const googleToken = response.credential;

  // Enviar este token a nuestro backend para verificación y inicio de sesión/registro
  sendGoogleTokenToBackend(googleToken);
}

/**
 * Envía el token de Google al backend para procesarlo.
 * @param {string} token - El token de ID de Google.
 */
const sendGoogleTokenToBackend = async (token) => {
  // 1. INICIA EL ESTADO DE CARGA
  setAuthFormLoading(true);
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token }),
    });

    // Handle Auth Failure (401/404/500)
    if (!res.ok) {
      let errorMessage;
      try {
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Intenta leer el error como JSON (lo que esperamos)
        const errorData = await res.json();
        errorMessage = errorData.message;
      } catch (jsonError) {
        // 2. Si falla el JSON.parse() (porque es HTML/texto),
        //    usamos el texto de estado del servidor.
        //    Esto captura el "Unexpected token 'T'"
        errorMessage = `Server Error: ${res.status} (${res.statusText})`;
        // --- FIN DE LA CORRECCIÓN ---
      }

      // Lanza el error (ya sea el del JSON o el genérico)
      throw new Error(errorMessage || `HTTP Error: ${res.status}`);
    }

    // ÉXITO (Status 200)
    // El backend nos devuelve NUESTRO PROPIO TOKEN JWT
    const result = await res.json();

    // Guardamos NUESTRO token de servidor
    localStorage.setItem("userToken", result.token);

    // REDIRIGIMOS (igual que en handleLogin)
    const baseUrl = `${window.location.origin}`;
    window.location.href = `${baseUrl}/index.html`;
  } catch (err) {
    console.error("Google login failed:", err.message);

    // ANTES: showLoginError("Error al iniciar sesión con Google.");

    // AHORA: Llama a la nueva función de UI
    if (err.message.includes("Failed to fetch")) {
      showAuthFailure(
        "server",
        "Could not connect to Google's servers. Please try again."
      );
    } else {
      // Asume un error de autenticación o de token
      showAuthFailure("auth", err.message);
    }
  }
};

// ==================
// LOADING STATE
// ==================
/**
 * Gestiona la UI de autenticación para los estados de carga o reseteo.
 * @param {boolean} isLoading - True para mostrar carga, false para resetear al formulario.
 */
const setAuthFormLoading = (isLoading) => {
  if (isLoading) {
    // 1. Ocultar el formulario
    authArticle.classList.add("hidden");

    // 2. Mostrar el contenedor de estado
    statusContainer.classList.remove("hidden");

    // 3. Mostrar SÓLO el spinner
    loadingSpinner.classList.remove("hidden");
    errorIcon.classList.add("hidden");
    tryAgainButton.classList.add("hidden");

    // 4. Actualizar texto
    authHeader.textContent = "Just a second!";
    authSub.textContent = "Checking, please wait...";
  } else {
    // ESTADO DE RESETEO (para el botón "Try Again")
    // 1. Mostrar el formulario
    authArticle.classList.remove("hidden");

    // 2. Ocultar el contenedor de estado
    statusContainer.classList.add("hidden");

    // 3. Resetear textos (con soporte para ambas páginas)
    if (loginForm) {
      authHeader.textContent = "Hi there!";
      authSub.textContent = "Welcome to ToDo List, happy to see you!";
    } else {
      authHeader.textContent = "Create an Account";
      authSub.textContent = "It's free and only takes a minute.";
    }
  }
};

/**
 * Muestra un estado de error en la UI de autenticación.
 * @param {string} errorType - "auth" (login/pass) o "server" (caída de red/500).
 * @param {string} message - El mensaje de error específico a mostrar.
 */
const showAuthFailure = (errorType, message) => {
  // 1. Ocultar el formulario (por si acaso)
  authArticle.classList.add("hidden");

  // 2. Mostrar el contenedor de estado
  statusContainer.classList.remove("hidden");

  // 3. Mostrar SÓLO el icono de error y el botón
  loadingSpinner.classList.add("hidden");
  errorIcon.classList.remove("hidden");
  tryAgainButton.classList.remove("hidden");

  // 4. Actualizar textos (requisito 2 y 5)
  if (errorType === "auth") {
    authHeader.textContent = "Oops! Login Failed";
  } else {
    // 'server'
    authHeader.textContent = "Server Error";
  }
  authSub.textContent = message; // Muestra el mensaje de error específico
};

// ==================
// EVENT LISTENERS (ASYNC)
// ==================

if (nameAuthInput) {
  nameAuthInput.addEventListener("blur", () => {
    nameValidation();
  });
}

// Blur listener for email
emailAuthInput.addEventListener("blur", async () => {
  await emailValidation();
});

passwordAuthInput.addEventListener("blur", () => {
  passwordValidation();
});

if (repeatAuthInput) {
  repeatAuthInput.addEventListener("blur", () => {
    repeatPasswordValidation();
  });
}

// Form submission listener (login)
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (await formValidation()) {
      handleLogin();
    }
  });
}

// Form submission listener (register)
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (await formValidation()) {
      handleRegister();
    }
  });
}

// Listener para el botón "Try Again"
tryAgainButton.addEventListener("click", () => {
  setAuthFormLoading(false); // Resetea la UI al formulario
});
