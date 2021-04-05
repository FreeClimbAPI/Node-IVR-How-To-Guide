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
                        freeclimb.percl.play(`${host}/accountNumberEntryAudio?audio=accountNumberPrompt.wav`)
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
                freeclimb.percl.play(`${host}/accountNumberEntryAudio?audio=shortError.wav`),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/accountNumberPrompt`)
            )
        )
    } else if (acctMenuErrCount >= 2) {
        acctMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(`${host}/accountNumberEntryAudio?audio=maxRetry.wav`),
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

router.get('/accountNumberEntryAudio',function(req,res) {
    const file = `${__dirname}/audioFiles/accountNumberEntry/${req.param('audio')}`
    res.download(file)
})
module.exports = router
