require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const { createConfiguration, DefaultApi, PerclScript, Redirect, Pause, Play, Hangup } = require('@freeclimb/sdk')

const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))
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
        new PerclScript({
            commands: [
                new Play({ file: `${host}/indexAudio?audio=greeting.wav` }),
                new Pause({ length: 100 }),
                new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
            ]
        }).build()
    )
})

app.post('/transfer', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new Play({ file: `${host}/indexAudio?audio=transfer.wav` }),
                new Redirect({ actionUrl: `${host}/endCall` })
            ]
        }).build()
    )
})

app.post('/endCall', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new Play({ file: `${host}/indexAudio?audio=hangup.wav` }),
                new Hangup({})
            ]
        }).build()
    )
})

app.get('/indexAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/index/${req.param('audio')}`
    res.download(file)
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Starting server on port ${port}`)
    })
}

module.exports = { app }
