console.log("Document page JavaScript loaded.");
// List of style tags in the order in which they will be nested from outermost to innermost
const styleTags = ["b", "em", "u"]

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
    const startWrapper = document.createElement(tag)
    startNodeSubrange.surroundContents(startWrapper)

    // Surround the text in the last node of the selection offset by the offset of the end of the selection
    const endNodeSubrange = document.createRange()
    endNodeSubrange.selectNode(selectionRange.endContainer)
    endNodeSubrange.setEnd(selectionRange.endContainer, selectionRange.endOffset)
    const endWrapper = document.createElement(tag)
    endNodeSubrange.surroundContents(endWrapper)

    // For each of the remaining nodes, which are entirely contained in the range, wrap the text with the tag
    const commonAncestor = selectionRange.commonAncestorContainer
    let processedChildren = [startNodeSubrange.startContainer, endNodeSubrange.endContainer]
    wrapTextInNode(commonAncestor, tag, processedChildren, selectionRange)
  }

  percolateStyleTags()
}

// Helper function that wraps all text under a given node with a given tag (string) using DFS
function wrapTextInNode(node, tag, processedChildren, range) {
  let stack = [node]
  while (stack.length > 0) {
    let v = stack.pop()

    if (v.nodeType == Node.TEXT_NODE && v.textContent != "") {
      // Wrap text in tags
      const range = document.createRange()
      range.selectNode(v)
      range.surroundContents(document.createElement(tag))
    }

    if (!processedChildren.includes(v) && range.intersectsNode(v)) {
      processedChildren.push(v)

      v.childNodes.forEach((childNode) => {
        stack.push(childNode)
      })
    }
  }
}

// Function that percolates style tags down to the lowest possible level
function percolateStyleTags() {
  const documentElement = document.getElementById("document")

  for (let tag of styleTags) {
    percolateTagInNode(documentElement, tag)
  }
}

// Helper function that percolates a given tag down from a given node
// tag is assumed to be an element tag
function percolateTagInNode(node, tag) {
  let queue = [node]
  while (queue.length > 0) {
    let v = queue.shift()

    v.childNodes.forEach((childNode) => {
      queue.push(childNode)
    })

    if (v.nodeName.toLowerCase() == tag) {
      let textOnly = true
      v.childNodes.forEach((childNode) => {
        if (childNode.nodeType != Node.TEXT_NODE) {
          textOnly = false
        }
      })

      v.childNodes.forEach((childNode) => {
        if (childNode.hasChildNodes() && childNode.nodeName.toLowerCase() != tag) {
          const range = document.createRange()
          range.selectNodeContents(childNode)
          range.surroundContents(document.createElement(tag))
        }

        if (childNode.nodeType == Node.TEXT_NODE && childNode.textContent != "" && !textOnly) {
          const range = document.createRange()
          range.selectNode(childNode)
          range.surroundContents(document.createElement(tag))
        }
      })

      if (!textOnly) {
        v.replaceWith(...v.childNodes)
      }
    }
  }
}

// Function that removes a tag from the selection, given a style tag string
// tag is assumed to be a style tag
// Does not handle partially selected text
function unwrapSelection(tag) {
  const selection = document.getSelection()
  // Note: getRangeAt(0) converts the selection to a Range. There can technically be multiple ranges in the selection,
  // but very few browsers support that. In practice, the Range at index 0 is the only Range in the selection.
  const selectionRange = selection.getRangeAt(0)

  let processedNodes = []
  let stack = [selectionRange.commonAncestorContainer]
  while (stack.length > 0) {
    let v = stack.pop()

    if (!processedNodes.includes(v) && selectionRange.intersectsNode(v)) {
      if (v.nodeType == Node.TEXT_NODE) {
        let closestTag = v.parentElement.closest(tag)
        if (closestTag != null) {
          closestTag.replaceWith(...closestTag.childNodes)
        }
      }

      v.childNodes.forEach((childNode) => {
        stack.push(childNode)
      })
    }
  }

  percolateStyleTags()
}
