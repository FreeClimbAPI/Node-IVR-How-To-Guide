require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = freeclimbSDK(accountId, apiKey)

router = express.Router()

router.post('/accountRead', (req, res) => {
    account = accounts.get(req.param('acct'))

    if (account.open) {
        if (account.frequentBuyer) {
            res.status(200).json(
                freeclimb.percl.build(
                    freeclimb.percl.play(`${host}/accountReadAudio?audio=platinumAccount.wav`),
                    freeclimb.percl.pause(100),
                    freeclimb.percl.redirect(`${host}/transfer`)
                )
            )
        } else {
            res.status(200).json(
                freeclimb.percl.build(
                    freeclimb.percl.say(
                        `Welcome back ${account.name}, I've found your most recent order from ${account.mostRecentOrderDate}, please hold while I connect you with a customer service representative. `
                    ),
                    freeclimb.percl.pause(100),
                    freeclimb.percl.redirect(`${host}/transfer`)
                )
            )
        }
    } else {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(`${host}/accountReadAudio?audio=closedAccount.wav`),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    }
})

router.get('/accountReadAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/accountRead/${req.param('audio')}`
    res.download(file)
})

module.exports = router
