import { extractCookie, getUserCookie } from "/cookies.mjs";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Select file page JavaScript loaded.");

  // ensures user cookie is loaded
  getUserCookie();

  const form = document.getElementById("openFileForm");
  const submit = document.getElementById("submitButton");
  submit.addEventListener("click", (e) => {
    const userCookie = extractCookie("userCookie");
    form.action = `/document/upload?userid=${userCookie}`;
  });
});
