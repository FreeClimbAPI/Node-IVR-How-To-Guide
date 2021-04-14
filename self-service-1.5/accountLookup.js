require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = freeclimbSDK(accountId, apiKey)

router = express.Router()
let retries = 0

router.post('/accountLookup', (req, res) => {
    if (!accounts.get(req.param('acct')) && retries < 2) {
        retries++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Sorry, we couldnt find that account number.'),
                freeclimb.percl.redirect(`${host}/accountNumberPrompt`)
            )
        )
    } else if (retries >= 2) {
        retries = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(
                    'Max retry limit reached, please wait while we connect you to an operator'
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

module.exports = router
