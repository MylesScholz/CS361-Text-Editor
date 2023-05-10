const express = require('express')
const { engine } = require('express-handlebars')

const port = process.env.port || 3000
const app = express()

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.set(express.json())

app.use(express.static('src'))

/* Insert middleware here */

app.get('*', (req, res, next) => {
    console.log('Path that does not exist was requested.')
    res.status(404).render('404Page')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})