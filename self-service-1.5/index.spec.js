let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /inComingCall', () => {
    it('return the percl commands for the into script, pause and redirect', async () => {
        const res = await request.post('/incomingCall')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Welcome to the Node self service IVR.'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/mainMenuPrompt`
                }
            }
        ])
    })
})

describe('POST /transfer', () => {
    it('return the percl commands for transfer script and redirect', async () => {
        const res = await request.post('/transfer')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'there are no operators available at this time'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/endCall`
                }
            }
        ])
    })
})

describe('POST /endCall', () => {
    it('return the percl commands for end call script and hangup', async () => {
        const res = await request.post('/endCall')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Thank you for calling the Node self service IVR , have a nice day!'
                }
            },
            {
                Hangup: {}
            }
        ])
    })
})
