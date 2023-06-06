import { getUserCookie, extractCookie } from "/cookies.mjs";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Home page JavaScript loaded.");

  getUserCookie();

  const newDocButton = document.getElementById("create-document-button");
  newDocButton.addEventListener("click", async () => {
    const userCookie = extractCookie("userCookie");
    const request = await fetch(`/document/new?userid=${userCookie}`, {
      method: "POST",
    });
    const data = await request.json();
    const docid = data.docid;
    location.href = `/document?docid=${data.docid}`;
  });

  const openDocButton = document.getElementById("open-document-button");
  openDocButton.addEventListener("click", () => {
    const userCookie = extractCookie("userCookie");
    location.href = `/selectFile?userid=${userCookie}`;
  });
});
