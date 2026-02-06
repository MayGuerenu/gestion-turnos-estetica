import { api, setToken } from "./api.js";

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const msg = document.querySelector("#msg");

function setMsg(text) {
  if (msg) msg.textContent = text || "";
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    try {
      const res = await api("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      window.location.href = "/dashboard.html";
    } catch (err) {
      setMsg(err.message);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    try {
      await api("/api/auth/register", { method: "POST", body: { email, password } });
      window.location.href = "/";
    } catch (err) {
      setMsg(err.message);
    }
  });
}
