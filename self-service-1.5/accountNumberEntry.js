require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()
let acctMenuErrCount = 0

router.post('/accountNumberPrompt', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getSpeech(
                `${host}/accountNumber`,
                freeclimb.enums.grammarFileBuiltIn.ANY_DIG,
                {
                    grammarType: freeclimb.enums.grammarType.BUILTIN,
                    prompts: [
                        freeclimb.percl.say('Please enter or say your six digit account number')
                    ]
                }
            )
        )
    )
})

router.post('/accountNumber', (req, res) => {
    const getSpeechResponse = req.body
    const input = getSpeechResponse.recognitionResult
    const response = input ? input.replace(/\s+/g, '') : null
    if ((!response || response.length < 6) && acctMenuErrCount < 2) {
        acctMenuErrCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Error'),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/accountNumberPrompt`)
            )
        )
    } else if (acctMenuErrCount >= 2) {
        acctMenuErrCount = 0
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
        acctMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/confirmAccountNumberPrompt?acct=${response}`)
            )
        )
    }
})
module.exports = router
