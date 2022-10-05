require('dotenv-safe').config()
const express = require('express')
const { createConfiguration, DefaultApi, PerclScript, GetSpeech, Redirect, Pause, Play, Say, Hangup } = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

router = express.Router()
let retries = 0

router.post('/accountLookup', (req, res) => {
    if (!accounts.get(req.param('acct')) && retries < 2) {
        retries++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/accountLookupAudio?audio=accountNotFound.wav` }),
                    new Redirect({ actionUrl: `${host}/accountNumberPrompt` })
                ]
            }).build()
        )
    } else if (retries >= 2) {
        retries = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/accountLookupAudio?audio=maxRetry.wav` }),
                    new Pause({ length: 100 }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    } else {
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Redirect({ actionUrl: `${host}/accountRead?acct=${req.param('acct')}` })
                ]
            }).build()
        )
    }
})

router.get('/accountLookupAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/accountLookup/${req.param('audio')}`
    res.download(file)
})

module.exports = router
