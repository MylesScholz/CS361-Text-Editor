function saveDocument() {
  console.log("saving...");

  const doc = document.getElementById("document");
  console.log(doc.innerText);

  var a = window.document.createElement("a");
  a.href = window.URL.createObjectURL(new Blob([doc.innerText]), {
    type: "test/plain",
  });
  a.download = "your_file.txt";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
}
