require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const freeclimbSDK = require('@freeclimb/sdk')

const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)
const mainMenuRoutes = require('./mainMenu')
const accountNumberEntryRoutes = require('./accountNumberEntry')
const accountNumberConfirmationRoutes = require('./accountNumberConfirmation')
const accountLookupRoutes = require('./accountLookup')
const accountReadRoutes = require('./accountRead')

app.use('/', mainMenuRoutes)
app.use('/', accountNumberEntryRoutes)
app.use('/', accountNumberConfirmationRoutes)
app.use('/', accountLookupRoutes)
app.use('/', accountReadRoutes)

app.post('/incomingCall', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.play(`${host}/indexAudio?audio=greeting.wav`),
            freeclimb.percl.pause(100),
            freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
        )
    )
})

app.post('/transfer', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.play(`${host}/indexAudio?audio=transfer.wav`),
            freeclimb.percl.redirect(`${host}/endCall`)
        )
    )
})

app.post('/endCall', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.play(`${host}/indexAudio?audio=hangup.wav`),
            freeclimb.percl.hangup()
        )
    )
})

router.get('/indexAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/index/${req.param('audio')}`
    res.download(file)
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Starting server on port ${port}`)
    })
}

module.exports = { app }
