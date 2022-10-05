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

describe('POST /mainMenuPrompt', () => {
  it('returns the percl commands for the main manu getdigits including redirect and prompt', async () => {
    const res = await request.post('/mainMenuPrompt')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        GetDigits: {
          actionUrl: `${host}/mainMenu`,
          flushBuffer: true,
          maxDigits: 1,
          minDigits: 1,
          prompts: [
            {
              Say: {
                loop: 1,
                text:
                  'Press 1 for existing orders, 2 for new orders, or 0 to speak to an operator'
              }
            }
          ]
        }
      }
    ])
  })
})

describe('POST /mainMenu', () => {
  it('returns the percl command for redirect to /transfer when sent with digit "0" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '0' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting you to an operator'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/transfer`
        }
      }
    ])
  })

  it('returns the percl command for redirect to /endCall when sent with digit "1" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '1' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to existing orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/accountNumberPrompt`
        }
      }
    ])
  })

  it('returns the percl command for redirect to /endCall when sent with digit "2" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '2' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to new orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/transfer`
        }
      }
    ])
  })

  it('returns the percl command for redirect back to mainMenuPrompt when sent with invalid digits', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '7' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Error, please try again'
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
          text:
            'Thank you for calling the Node self service IVR , have a nice day!'
        }
      },
      {
        Hangup: {}
      }
    ])
  })
})
