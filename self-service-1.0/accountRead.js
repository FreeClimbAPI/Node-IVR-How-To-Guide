require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()

router.post('/accountRead', (req, res) => {
    account = accounts.get(req.param('acct'))

    if (account.open) {
        if (account.frequentBuyer) {
            res.status(200).json(
                freeclimb.percl.build(
                    freeclimb.percl.say("Welcome back platinum member, please wait while we connect you with a customer service representative."),
                    freeclimb.percl.pause(100),
                    freeclimb.percl.redirect(`${host}/transfer`)
                )
            )
        } else {
            res.status(200).json(
                freeclimb.percl.build(
                    freeclimb.percl.say(`Welcome back ${account.name}, I've found your most recent order from ${account.mostRecentOrderDate}, please hold while I connect you with a customer service representative. `),
                    freeclimb.percl.pause(100),
                    freeclimb.percl.redirect(`${host}/transfer`)
                )
            )
        }
    } else {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say("This account appears to be closed please wait while we transfer you to an operator for asistance"),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    }

})

module.exports = router