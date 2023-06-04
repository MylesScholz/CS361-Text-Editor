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
  static WYSIWYG = Symbol("WYSIWYG editing mode");
  static MARKUP = Symbol("Markup editing mode");

  #fileName; // the DOM element that holds the file name
  #doc; // the document DOM element
  #mode; // Whether the document is in WYSIWYG mode, or markup (html) mode

  /**
   * Creates a document from the dom IDs of its title and body
   *
   * @param {domElement} fileNameID the dom element that contains the title
   *  (should be a text input)
   * @param {domElement} docID the dom element that contains the document body
   *  (should be content-editable element)
   */
  constructor(fileName, doc) {
    this.#fileName = fileName;
    this.#doc = doc;
    this.#mode = Document.WYSIWYG;
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

  swapModes() {
    if (this.#mode == Document.WYSIWYG) {
      this.#doc.innerText = this.#doc.innerHTML;
      this.#mode = Document.MARKUP;
    } else if (this.#mode == Document.MARKUP) {
      this.#doc.innerHTML = this.#doc.innerText;
      this.#mode = Document.WYSIWYG;
    } else {
      console.log(`Invalid mode detected: ${this.#mode}`);
    }
  }
}

function* modeButtonToggle() {
  while (true) {
    yield "Swap to Markup";
    yield "Swap to WYSIWYG";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("title");
  const doc = document.getElementById("document");

  const workingDoc = new Document(title, doc);

  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", (e) => workingDoc.download(e));

  const modeButton = document.getElementById("modeButton");
  modeButton.addEventListener("click", (e) => workingDoc.swapModes(e));

  const toggle = modeButtonToggle();
  modeButton.innerText = toggle.next().value;
  modeButton.addEventListener(
    "click",
    (e) => (modeButton.innerText = toggle.next().value)
  );
});
