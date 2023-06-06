import { getUserCookie, extractCookie } from "/cookies.mjs";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Home page JavaScript loaded.");

  // ensures user cookie is loaded
  getUserCookie();

  const newDocButton = document.getElementById("create-document-button");
  newDocButton.addEventListener("click", async () => {
    const userCookie = extractCookie("userCookie");

    // creates a new document on the server, and gets its id
    const request = await fetch(`/document/new?userid=${userCookie}`, {
      method: "POST",
    });
    const data = await request.json();
    const docid = data.docid;

    // sets the location to the new document
    location.href = `/document?docid=${data.docid}`;
  });

  const openDocButton = document.getElementById("open-document-button");
  openDocButton.addEventListener("click", () => {
    const userCookie = extractCookie("userCookie");

    // sets the location to the selectFile endpoint (sending the userCookie so
    // that user files can be found)
    location.href = `/selectFile?userid=${userCookie}`;
  });
});
