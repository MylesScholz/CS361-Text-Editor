console.log('Document page JavaScript loaded.')

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
