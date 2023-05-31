console.log("Document page JavaScript loaded.");

/**
 * Downloads a file onto the client's computer
 *
 * @parem {string} fileName the name of the file to save.
 * @parem {string} text the body text of the file.
 * @parem {string} fileType the MIME type of the file.
 * @parem {string} fileExt the file extension to save as.
 *
 * Files are saved as fileName.fileExt, so a file with no "." is currently
 * not possible.
 */
function downloadFile(
  fileName,
  text,
  fileType = "text/plain",
  fileExt = "txt"
) {
  var a = window.document.createElement("a");
  a.href = window.URL.createObjectURL(new Blob([text]), {
    type: fileType,
  });
  a.download = `${fileName}.${fileExt}`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** @class Document class representing a document */
class Document {
  #doc; // the document DOM element
  #fileName; // the DOM element that holds the file name

  constructor(docID, fileNameID) {
    this.#doc = document.getElementById(docID);
    this.#fileName = document.getElementById(fileNameID);
  }

  get title() {
    return this.#fileName.value;
  }

  get rawText() {
    return this.#doc.innerText;
  }

  get htmlText() {
    return this.#doc.innerHTML;
  }

  download() {
    downloadFile(this.title, this.htmlText);
  }
}

const workingDoc = new Document("document", "title", "text/html", ".html");

function saveDocument() {
  workingDoc.download();
}
