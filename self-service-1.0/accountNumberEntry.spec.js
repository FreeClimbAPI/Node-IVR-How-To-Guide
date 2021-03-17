const { app } = require('./index')
const supertest = require('supertest')
const request = supertest(app)

require('dotenv-safe').config()

const host = process.env.HOST

describe('POST /accountNumberPrompt', () => {
    it('returns the percl commands for the account number entry menu getdigits including redirect and prompt', async () => {
        const res = await request.post('/accountNumberPrompt')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/accountNumber`,
                    flushBuffer: true,
                    maxDigits: 6,
                    minDigits: 1,
                    prompts: [
                        {
                            Say: {
                                text:
                                    'Please Enter your account number'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /accountNumber', () => {
    it('returns an error when the number of digits input for the account number is incorrect', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ digits: '0' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Error, please enter your six digit account number or press 0 to speak with an operator'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns an error when no digits have been input', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ digits: '' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Error, please enter your six digit account number or press 0 to speak with an operator'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns a redirect to /transfer when the max number of retries has been reached', async () => {
        for (let i = 0; i <= 2; i++) {
            await request
                .post('/accountNumber')
                .type('form')
                .send({ digits: '' })
        }

        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ digits: '111222' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Max retry limit reached, please wait while we connect you to an operator'
                }
            }, 
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns a redirect to /accountNumberConfirmation on successful input of account number', async () => {

        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ digits: '111222' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
                }
            }
        ])
    })


})
