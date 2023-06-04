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

// Function that wraps the current selection with a given tag (string)
function wrapSelection(tag) {
  const selection = document.getSelection()
  // Note: getRangeAt(0) converts the selection to a Range. There can technically be multiple ranges in the selection,
  // but very few browsers support that. In practice, the Range at index 0 is the only Range in the selection.
  const selectionRange = selection.getRangeAt(0)

  if (selectionRange.commonAncestorContainer == selectionRange.startContainer) {
    // The selection is within one element; simply surround the range with the tag
    selectionRange.surroundContents(document.createElement(tag))
  } else {
    // The selection spans multiple elements
    // Surround the text in the first node of the selection offset by the starting offset of the selection
    const startNodeSubrange = document.createRange()
    startNodeSubrange.selectNode(selectionRange.startContainer)
    startNodeSubrange.setStart(selectionRange.startContainer, selectionRange.startOffset)
    startNodeSubrange.surroundContents(document.createElement(tag))

    // Surround the text in the last node of the selection offset by the offset of the end of the selection
    const endNodeSubrange = document.createRange()
    endNodeSubrange.selectNode(selectionRange.endContainer)
    endNodeSubrange.setEnd(selectionRange.endContainer, selectionRange.endOffset)
    endNodeSubrange.surroundContents(document.createElement(tag))

    // For each of the remaining nodes, which are entirely contained in the range, recursively wrap the text with the tag

  }
}

// Recursive function that wraps all text under a given node with a given tag (string)
function wrapTextInNode(node, tag) {
  // Stop the recursion at the level of text nodes, excluding empty text nodes
  if (node.nodeType == Node.TEXT_NODE && node.textContent != "") {
    // Wrap text in tags
    const range = document.createRange()
    range.selectNodeContents(node)
    range.surroundContents(document.createElement(tag))
    return
  }

  // Recursive call
}

// Function that percolates style tags down to the lowest possible level
function percolateStyleTags() {
  const documentElement = document.getElementById("document")

}

// Recursive helper function that percolates a given tag down from a given node
// node is assumed to have a parent
function percolateTagInNode(node, tag) {
  if (node.nodeType != Node.ELEMENT_NODE) {
    // Base case
    return
  }
  const children = node.children

  if (node.tagName.toLowerCase() == tag && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      let child = children.item(i)

      if (child.hasChildNodes() && child.tagName.toLowerCase() != tag) {
        const range = document.createRange()
        range.selectNodeContents(child)
        range.surroundContents(document.createElement(tag))
      }
    }

    for (let i = 0; i < children.length; i++) {
      percolateTagInNode(children.item(0), tag)
    }

    const range = document.createRange()
    range.selectNodeContents(node)
    const nodeContents = range.extractContents()

    node.replaceWith(nodeContents)
    return
  }

  for (let i = 0; i < children.length; i++) {
    percolateTagInNode(children.item(0), tag)
  }
}
