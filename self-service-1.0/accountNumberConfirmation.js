require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()

let confirmNumberErrCount = 0
let retries = 0

router.post('/confirmAccountNumberPrompt', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/confirmAccountNumber?acct=${req.param('acct')}`, {
                prompts: [
                    freeclimb.percl.say(
                        `You entered ${req.param(
                            'acct'
                        )} is that correct? Press 1 to confirm your account number or 2 to try again`
                    )
                ],
                maxDigits: 1,
                minDigits: 1,
                flushBuffer: true
            })
        )
    )
})

router.post('/confirmAccountNumber', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const menuOpts = new Map([
        [
            '1',
            {
                script: 'proceeding to account number lookup.',
                redirect: `${host}/accountLookup?acct=${req.param('acct')}`
            }
        ],
        [
            '2',
            {
                script: 'Ok',
                redirect: `${host}/accountNumberPrompt`
            }
        ],
        ['0', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
    ])
    if ((!digits || !menuOpts.get(digits)) && confirmNumberErrCount < 3) {
        confirmNumberErrCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Error'),
                freeclimb.percl.redirect(
                    `${host}/confirmAccountNumberPrompt?acct=${req.param('acct')}`
                )
            )
        )
    } else if (confirmNumberErrCount >= 3 || retries >= 2) {
        confirmNumberErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Please wait while we connect you to an operator'),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    } else {
        confirmNumberErrCount = 0
        if (digits === '2') {
            retries++ // retries tracked separately from input errors
        } else if (digits === '1') {
            retries = 0
        }
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(menuOpts.get(digits).script),
                freeclimb.percl.redirect(menuOpts.get(digits).redirect)
            )
        )
    }
})

module.exports = router
