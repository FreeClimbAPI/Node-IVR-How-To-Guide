require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()
let retries = 0

router.post('/accountLookup', (req, res) => {
    if (!accounts.get(req.param('acct')) && retries < 2) {
        retries++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(`${host}/accountLookupAudio?audio=accountNotFound.wav`),
                freeclimb.percl.redirect(`${host}/accountNumberPrompt`)
            )
        )
    } else if (retries >= 2) {
        retries = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(
                    `${host}/accountLookupAudio?audio=maxRetry.wav`
                ),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    } else {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/accountRead?acct=${req.param('acct')}`)
            )
        )
    }
})

router.get('/accountLookupAudio',function(req,res) {
    const file = `${__dirname}/audioFiles/accountLookup/${req.param('audio')}`
    res.download(file)
})



module.exports = router
