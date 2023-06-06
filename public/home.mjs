import { getUserCookie, extractCookie } from "/cookies.mjs";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Home page JavaScript loaded.");

  getUserCookie();

  const newDocButton = document.getElementById("create-document-button");
  newDocButton.addEventListener("click", () => {
    const userCookie = extractCookie("userCookie")
    location.href = `/document?id=${userCookie}`
  })
});
