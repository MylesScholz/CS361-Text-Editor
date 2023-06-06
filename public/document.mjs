import { getUserCookie } from "/cookies.mjs";

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
  #docid; // the document ID

  /**
   * Creates a document from the dom IDs of its title and body
   *
   * @param {domElement} fileNameID the dom element that contains the title
   *  (should be a text input)
   * @param {domElement} docID the dom element that contains the document body
   *  (should be content-editable element)
   */
  constructor(fileName, doc, docid) {
    this.#fileName = fileName;
    this.#doc = doc;
    this.#mode = Document.WYSIWYG;
    this.#docid = docid;
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

  async backup() {
    console.log("backing up document.")

    const response = await fetch(`/document/backup?docid=${this.#docid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: this.title,
        content: this.htmlText,
      })
    })
    console.log(`Backup performed: ${response}`)
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

function periodicSave(document) {
  const backupFrequency = 30 * 1000

  console.log("starting backups.")

  function autobackup(document) {
    console.log("autobackup...")
    document.backup();
    setTimeout(() => {
      autobackup(document)
    }, backupFrequency);  
  }

  setTimeout(() => autobackup(document), backupFrequency)
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Document page JavaScript loaded.");

  getUserCookie().catch((e) => console.log("Could not access cookie"));

  const docid = document.getElementById("docid").innerText;
  const title = document.getElementById("title");
  const doc = document.getElementById("document");

  const workingDoc = new Document(title, doc, docid);

  periodicSave(workingDoc);

  const saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", (e) => {
    workingDoc
     .backup()
     .catch((e) => console.log(`backup error: ${e}`))
  });

  const exportButton = document.getElementById("export-button");
  exportButton.addEventListener("click", (e) => workingDoc.download(e));

  const modeButton = document.getElementById("mode-button");
  modeButton.addEventListener("click", (e) => workingDoc.swapModes(e));

  const boldButton = document.getElementById("bold-button");
  boldButton.addEventListener("click", (e) => wrapSelection("b"));

  const italicButton = document.getElementById("italic-button");
  italicButton.addEventListener("click", (e) => wrapSelection("em"));

  const ulButton = document.getElementById("underline-button");
  ulButton.addEventListener("click", (e) => wrapSelection("u"));

  const cboldButton = document.getElementById("remove-bold-button");
  cboldButton.addEventListener("click", (e) => unwrapSelection("b"));

  const citalicButton = document.getElementById("remove-italic-button");
  citalicButton.addEventListener("click", (e) => unwrapSelection("em"));

  const culButton = document.getElementById("remove-underline-button");
  culButton.addEventListener("click", (e) => unwrapSelection("u"));

  const titleButton = document.getElementById("title-button");
  titleButton.addEventListener("click", (e) => replaceSelectionLines("h1"));

  const stitleButton = document.getElementById("subtitle-button");
  stitleButton.addEventListener("click", (e) => replaceSelectionLines("h3"));

  const unorderedListButton = document.getElementById("unordered-list-button");
  unorderedListButton.addEventListener("click", (e) => {
    replaceSelectionLines("li")
    surroundSelection("ul")
  });

  const orderedListButton = document.getElementById("ordered-list-button");
  orderedListButton.addEventListener("click", (e) => {
    replaceSelectionLines("li")
    surroundSelection("ol")
  });

  const ctitleButton = document.getElementById("remove-title-button");
  ctitleButton.addEventListener("click", (e) => replaceSelectionLines("div"));

  const cstitleButton = document.getElementById("remove-subtitle-button");
  cstitleButton.addEventListener("click", (e) => replaceSelectionLines("div"));

  const removeUnorderedListButton = document.getElementById("remove-unordered-list-button");
  removeUnorderedListButton.addEventListener("click", (e) => removeList("ul"));

  const removeOrderedListButton = document.getElementById("remove-ordered-list-button");
  removeOrderedListButton.addEventListener("click", (e) => removeList("ol"));

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

  percolateStyleTags()
  selection.collapse(selectionRange.startContainer)
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

  percolateStyleTags()
  selection.collapse(selectionRange.startContainer)
}

function replaceSelectionLines(tag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  let commonAncestor = selectionRange.commonAncestorContainer
  if (commonAncestor.nodeType == Node.TEXT_NODE) {
    commonAncestor = commonAncestor.parentElement
  }
  let queue = [commonAncestor]

  while (queue.length > 0) {
    let v = queue.shift()

    if (v.nodeType == Node.ELEMENT_NODE && v.matches("div, h1, h2, h3, h4, h5, h6, p, ul, ol, li")) {
      const range = document.createRange()
      range.selectNodeContents(v)
      range.surroundContents(document.createElement(tag))
      v.replaceWith(...v.childNodes)
    } else if (v.nodeType == Node.TEXT_NODE && v.textContent != "") {
      const range = document.createRange()
      range.selectNode(v)
      range.surroundContents(document.createElement(tag))
    } else {
      v.childNodes.forEach((childNode) => {
        queue.push(childNode)
      })
    }
  }

  percolateStyleTags()
  selection.collapse(selectionRange.startContainer)
}

function surroundSelection(tag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  const range = document.createRange()
  range.selectNodeContents(selectionRange.commonAncestorContainer)
  range.surroundContents(document.createElement(tag))

  selection.collapse(selectionRange.startContainer)
}

function removeList(listTag) {
  const selection = document.getSelection();
  // Note: getRangeAt(0) converts the selection to a Range. There can
  // technically be multiple ranges in the selection, but very few browsers
  // support that. In practice, the Range at index 0 is the only Range in the
  // selection.
  const selectionRange = selection.getRangeAt(0);

  const closestList = selectionRange.startContainer.parentElement.closest(listTag)
  const listExtract = document.createDocumentFragment()

  let commonAncestor = selectionRange.commonAncestorContainer
  if (commonAncestor.nodeType == Node.TEXT_NODE) {
    commonAncestor = commonAncestor.parentElement
  }
  let queue = [commonAncestor]
  while (queue.length > 0) {
    let v = queue.shift()

    if (v.nodeType == Node.ELEMENT_NODE && v.matches("li") && selectionRange.intersectsNode(v)) {
      const range = document.createRange()
      range.selectNodeContents(v)
      range.surroundContents(document.createElement("div"))
      listExtract.appendChild(range.extractContents())
      v.remove()
    } else {
      v.childNodes.forEach((childNode) => {
        queue.push(childNode)
      })
    }
  }
  closestList.after(listExtract)

  if (closestList.children.length == 0) {
    closestList.remove()
  }

  selection.collapse(selectionRange.startContainer)
}
