console.log("Document page JavaScript loaded.");
// List of style tags in the order in which they will be nested from outermost
// to innermost
const styleTags = ["b", "em", "u"];

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

/**
 * @class Document class representing a document
 */
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

  /**
   * @getter title gets the title as a string
   */
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

  /**
   * Swap the modes of the document between WYSIWYG editing and markup editing
   */
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

/**
 * Helper function that toggles between "Swap to Markup" and "Swap to WYSIWYG"
 */
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

  const boldButton = document.getElementById("boldButton");
  boldButton.addEventListener("click", (e) => wrapSelection("b"));

  const italicButton = document.getElementById("italicButton");
  italicButton.addEventListener("click", (e) => wrapSelection("em"));

  const ulButton = document.getElementById("ulButton");
  ulButton.addEventListener("click", (e) => wrapSelection("u"));

  const cboldButton = document.getElementById("cboldButton");
  cboldButton.addEventListener("click", (e) => unwrapSelection("b"));

  const citalicButton = document.getElementById("citalicButton");
  citalicButton.addEventListener("click", (e) => unwrapSelection("em"));

  const culButton = document.getElementById("culButton");
  culButton.addEventListener("click", (e) => unwrapSelection("u"));

  const titleButton = document.getElementById("titleButton");
  titleButton.addEventListener("click", (e) => wrapSelection("h1"));

  const stitleButton = document.getElementById("stitleButton");
  stitleButton.addEventListener("click", (e) => wrapSelection("h2"));

  const ctitleButton = document.getElementById("ctitleButton");
  ctitleButton.addEventListener("click", (e) => unwrapSelection("h1"));

  const cstitleButton = document.getElementById("cstitleButton");
  cstitleButton.addEventListener("click", (e) => unwrapSelection("h2"));

  const toggle = modeButtonToggle();
  modeButton.innerText = toggle.next().value;
  modeButton.addEventListener(
    "click",
    (e) => (modeButton.innerText = toggle.next().value)
  );
});

/**
 * Function that wraps the current selection with a given tag (string)
 *
 * @param {string} tag the html tag to wrap (e.g. "b", "h2")
 */
function wrapSelection(tag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  if (selectionRange.commonAncestorContainer == selectionRange.startContainer) {
    // The selection is within one element; simply surround the range with the
    // tag
    selectionRange.surroundContents(document.createElement(tag));
  } else {
    // The selection spans multiple elements
    // The selection may cover part of the node it starts in.
    // Create a subrange selecting this partially selected node.
    const startNodeSubrange = document.createRange();
    startNodeSubrange.selectNode(selectionRange.startContainer);
    startNodeSubrange.setStart(
      selectionRange.startContainer,
      selectionRange.startOffset
    );

    // The selection may cover part of the node it ends in.
    // Create a subrange selecting this partially selected node.
    const endNodeSubrange = document.createRange();
    endNodeSubrange.selectNode(selectionRange.endContainer);
    endNodeSubrange.setEnd(
      selectionRange.endContainer,
      selectionRange.endOffset
    );

    // For each of the remaining nodes, which are entirely contained in the
    // range, wrap the text with the tag
    const commonAncestor = selectionRange.commonAncestorContainer;
    let processedChildren = [
      startNodeSubrange.startContainer,
      endNodeSubrange.endContainer,
    ];
    wrapTextInNode(commonAncestor, tag, processedChildren, selectionRange);

    // Wrap the starting and ending nodes with the tag.
    // The starting and ending nodes will always be text nodes.
    const startWrapper = document.createElement(tag);
    startNodeSubrange.surroundContents(startWrapper);
    const endWrapper = document.createElement(tag);
    endNodeSubrange.surroundContents(endWrapper);
  }

  percolateStyleTags();
}

/**
 * Helper function that wraps all text under a given node with a given tag
 * (string) using DFS
 *
 * @param {string} tag the html tag to wrap (e.g. "b", "h2")
 *
 */
function wrapTextInNode(node, tag, processedChildren, range) {
  let stack = [node];
  while (stack.length > 0) {
    let v = stack.pop();

    if (!processedChildren.includes(v) && range.intersectsNode(v)) {
      processedChildren.push(v);

      if (v.nodeType == Node.TEXT_NODE && v.textContent != "") {
        // Wrap text in tags
        const range = document.createRange();
        range.selectNode(v);
        range.surroundContents(document.createElement(tag));
      }

      v.childNodes.forEach((childNode) => {
        stack.push(childNode);
      });
    }
  }
}

/**
 * Function that percolates style tags down to the lowest possible level
 */
function percolateStyleTags() {
  const documentElement = document.getElementById("document");

  for (let tag of styleTags) {
    percolateTagInNode(documentElement, tag);
  }
}

/**
 * Helper function that percolates a given tag down from a given node
 *
 * @param {string} tag the html tag to wrap. Assumed to be an element tag
 */
function percolateTagInNode(node, tag) {
  let queue = [node];
  while (queue.length > 0) {
    let v = queue.shift();

    v.childNodes.forEach((childNode) => {
      queue.push(childNode);
    });

    if (v.nodeName.toLowerCase() == tag) {
      let textOnly = true;
      v.childNodes.forEach((childNode) => {
        if (childNode.nodeType != Node.TEXT_NODE) {
          textOnly = false;
        }
      });

      v.childNodes.forEach((childNode) => {
        if (
          childNode.hasChildNodes() &&
          childNode.nodeName.toLowerCase() != tag
        ) {
          const range = document.createRange();
          range.selectNodeContents(childNode);
          range.surroundContents(document.createElement(tag));
        }

        if (
          childNode.nodeType == Node.TEXT_NODE &&
          childNode.textContent != "" &&
          !textOnly
        ) {
          const range = document.createRange();
          range.selectNode(childNode);
          range.surroundContents(document.createElement(tag));
        }
      });

      if (!textOnly) {
        v.replaceWith(...v.childNodes);
      }
    }
  }
}

/**
 * Function that removes a tag from the selection, given a style tag string
 *
 * @param {string} tag the html tag to remove. Assumed to be a style tag
 */
function unwrapSelection(tag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  let processedNodes = [];
  let stack = [selectionRange.commonAncestorContainer];
  while (stack.length > 0) {
    let v = stack.pop();

    if (!processedNodes.includes(v) && selectionRange.intersectsNode(v)) {
      if (v.nodeType == Node.TEXT_NODE) {
        let closestTag = v.parentElement.closest(tag);
        if (closestTag != null) {
          closestTag.replaceWith(...closestTag.childNodes);
        }
      }

      v.childNodes.forEach((childNode) => {
        stack.push(childNode);
      });
    }
  }

  percolateStyleTags();
}

function wrapSelectionLines(tag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  const closestLineElement = selectionRange.startContainer.parentElement.closest("div, h1, h2, h3, h4, h5, h6, p, ul, ol, li")
  console.log(closestLineElement)
}
