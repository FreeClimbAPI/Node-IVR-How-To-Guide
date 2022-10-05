require('dotenv-safe').config()
const express = require('express')
const {
    createConfiguration,
    DefaultApi,
    PerclScript,
    GetSpeech,
    Redirect,
    Pause,
    Play,
    Say,
    Hangup
} = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

router = express.Router()

router.post('/accountRead', (req, res) => {
    account = accounts.get(req.param('acct'))

    if (account.open) {
        if (account.frequentBuyer) {
            res.status(200).json(
                new PerclScript({
                    commands: [
                        new Play({ file: `${host}/accountReadAudio?audio=platinumAccount.wav` }),
                        new Pause({ length: 100 }),
                        new Redirect({ actionUrl: `${host}/transfer` })
                    ]
                }).build()
            )
        } else {
            res.status(200).json(
                new PerclScript({
                    commands: [
                        new Say({
                            text: `Welcome back ${account.name}, I've found your most recent order from ${account.mostRecentOrderDate}, please hold while I connect you with a customer service representative. `
                        }),
                        new Pause({ length: 100 }),
                        new Redirect({ actionUrl: `${host}/transfer` })
                    ]
                }).build()
            )
        }
    } else {
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/accountReadAudio?audio=closedAccount.wav` }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    }
})

router.get('/accountReadAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/accountRead/${req.param('audio')}`
    res.download(file)
})

module.exports = router
