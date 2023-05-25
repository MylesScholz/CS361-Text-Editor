console.log("Document page JavaScript loaded.");

/*
 * Downloads a file onto the client's computer
 *
 * @parem string fileName:  - the name of the file to save.
 * @parem text: string - the body text of the file.
 * @parem fileType: string - the MIME type of the file.
 * @parem fileExt: string - the file extension to save as.
 *
 * Files are saved as {fileName}.{fileExt}, so a file with no "." is currently
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

/* @class Document - class representing a document */
class Document {
  #doc; // the document DOM element
  #fileName; // the DOM element that holds the file name

  constructor(docID, fileNameID) {
    this.#doc = document.getElementById(docID);
    this.fileName = document.getElementById(fileNameID);
  }

  get rawText() {
    return this.#doc.innerText;
  }

  get htmlText() {
    return this.#doc.innerHTML;
  }

  downloadText() {
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob([this.rawText]), {
      type: "test/plain",
    });
    a.download = "your_file.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function saveDocument() {
  const regexp = /.*?\>(.*)\<\/.*/g; // accursed regex to extract children
  const serializer = new XMLSerializer(); // for serializing DOM objects to text

  const doc = document.getElementById("document");
  const articleHTML = serializer.serializeToString(doc);

  // removes the outer <article> tag from string
  const fileHTML = [...articleHTML.matchAll(regexp)][0][1];

  // this is a hack to download files, by adding a download link to the DOM,
  // clicking it through JS, and then removing it. It works on firefox though...
  var a = window.document.createElement("a");
  a.href = window.URL.createObjectURL(new Blob([fileHTML]), {
    type: "test/plain",
  });
  a.download = "your_file.txt";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
}
