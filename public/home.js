console.log('Home page JavaScript loaded.')

createDocumentButton = document.getElementById('create-document-button')
createDocumentButton.onclick = () => {
    location.href = '/document'
}
