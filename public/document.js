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

  /**
   * Creates a document from the dom IDs of its title and body
   *
   * @param {string} docID the dom ID of the element that contains the document
   *  body (should be content-editable element)
   * @param {string} fileNameID the dom ID of the element that contains the
   *  title (should be a text input)
   */
  constructor(docID, fileNameID) {
    this.#doc = document.getElementById(docID);
    this.#fileName = document.getElementById(fileNameID);
  }

  /** @getter title gets the title as a string */
  get title() {
    return this.#fileName.value;
  }

  /**
   * @getter gets the raw text of the document body
   *  (without HTML tags)
   */
  get rawText() {
    return this.#doc.innerText;
  }

  /**
   * @getter gets the HTML of the document body
   */
  get htmlText() {
    return this.#doc.innerHTML;
  }

  /**
   * Downloads the document
   */
  download() {
    downloadFile(this.title, this.htmlText, "text/html", "html");
  }
}

const workingDoc = new Document("document", "title");

/**
 * function to save document that can be called as an onClick event handler
 */
function saveDocument() {
  workingDoc.download();
}
