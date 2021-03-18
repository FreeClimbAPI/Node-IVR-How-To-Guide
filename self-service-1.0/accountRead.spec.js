let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /acccountRead', () => {
    it('returns an error message and transfer to redirect if the given account is closed', async () => {
        const res = await request.post('/accountRead?acct=333444')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        'This account appears to be closed please wait while we transfer you to an operator for asistance'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`,
                },
            },
        ])
    })

    it('returns the frequent buyer message and redirect to /transfer if the account is open and has the frequent buyer flag enabled', async () => {
        const res = await request.post('/accountRead?acct=111222')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        'Welcome back platinum member, please wait while we connect you with a customer service representative.'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`,
                },
            },
        ])
    })

    it('returns a last order message and redirect to /transfer if the account is open and has the frequent buyer flag disabled', async () => {
        const res = await request.post('/accountRead?acct=222333')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        "Welcome back Jane Smith, I've found your most recent order from March 30th 2020, please hold while I connect you with a customer service representative. "
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`,
                },
            },
        ])
    })
})
