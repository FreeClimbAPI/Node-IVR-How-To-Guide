let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
  jest.resetModules()
  const { app } = require('./index')
  const supertest = require('supertest')
  request = supertest(app)
})

describe('POST /confirmAccountNumberPrompt', () => {
  it('returns the percl commands for the account number confirmation menu getdigits including redirect and prompt', async () => {
    const res = await request.post('/confirmAccountNumberPrompt?acct=111222')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        GetDigits: {
          actionUrl: `${host}/confirmAccountNumber?acct=111222`,
          flushBuffer: true,
          maxDigits: 1,
          minDigits: 1,
          prompts: [
            {
              Say: {
                loop: 1,
                text:
                  'You entered 111222 is that correct? Press 1 to confirm your account number or 2 to try again'
              }
            }
          ]
        }
      }
    ])
  })
})

describe('POST /confirmAccountNumber', () => {
  it('returns an error when no menu options are selected', async () => {
    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Error'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
        }
      }
    ])
  })

  it('returns transfer to operator if max err limit reached', async () => {
    for (let i = 0; i <= 1; i++) {
      await request
        .post('/confirmAccountNumber?acct=111222')
        .type('form')
        .send({ digits: '' })
    }

    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Error'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
        }
      }
    ])
  })

  it('returns transfer to operator if max err limit reached', async () => {
    for (let i = 0; i < 3; i++) {
      await request
        .post('/confirmAccountNumber?acct=111222')
        .type('form')
        .send({ digits: '' })
    }

    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Please wait while we connect you to an operator'
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

  it('returns transfer to operator if max retry limit reached', async () => {
    for (let i = 0; i < 2; i++) {
      await request
        .post('/confirmAccountNumber?acct=111222')
        .type('form')
        .send({ digits: '2' })
    }

    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '2' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Please wait while we connect you to an operator'
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

  it('returns redirect to account number lookup on input of number 1', async () => {
    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '1' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'proceeding to account number lookup.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/accountLookup?acct=111222`
        }
      }
    ])
  })

  it('returns redirect to account number entry on in input of number 2', async () => {
    const res = await request
      .post('/confirmAccountNumber?acct=111222')
      .type('form')
      .send({ digits: '2' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Ok'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/accountNumberPrompt`
        }
      }
    ])
  })
})
