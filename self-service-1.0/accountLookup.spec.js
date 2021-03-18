let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /acccountLookup', () => {
    it('returns an error when the account number given does not match any known account number', async () => {
        const res = await request.post('/accountLookup?acct=000000')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Sorry, we couldnt find that account number.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns a redirect /transfer when the number of lookup retries has exceeded the limit', async () => {
        for (let i = 0; i < 2; i++) {
            await request.post('/accountLookup?acct=000000')
        }
        const res = await request.post('/accountLookup?acct=000000')
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

    it('returns a redirect /accountRead when the account number matches a known account', async () => {
        const res = await request.post('/accountLookup?acct=111222')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/accountRead?acct=111222`
                }
            }
        ])
    })
})
