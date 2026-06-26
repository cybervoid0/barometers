// The Resend client is created at module load from `process.env`, so each test
// resets the module registry and re-imports with the desired env/mock.

describe('sendEmail', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    process.env = OLD_ENV
    jest.restoreAllMocks()
  })

  it('skips (no-op) when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY
    // Mock the SDK so importing the module never loads the real `resend`
    // (its transitive deps need web APIs absent from jsdom). The client stays
    // null here anyway because no key is set.
    const send = jest.fn()
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
    }))

    const { sendEmail } = await import('../email')
    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' })

    expect(result).toEqual({ sent: false, skipped: true })
    expect(send).not.toHaveBeenCalled()
  })

  it('sends via Resend and forwards the idempotency key', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.EMAIL_FROM = 'Shop <noreply@example.com>'
    const send = jest.fn().mockResolvedValue({ data: { id: 'email_1' }, error: null })
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
    }))

    const { sendEmail } = await import('../email')
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 's',
      html: '<p>h</p>',
      idempotencyKey: 'order-confirmation/1',
    })

    expect(result).toEqual({ sent: true })
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Shop <noreply@example.com>',
        to: 'a@b.com',
        subject: 's',
        html: '<p>h</p>',
      }),
      { idempotencyKey: 'order-confirmation/1' },
    )
  })

  it('returns an error result (does not throw) when Resend reports an error', async () => {
    process.env.RESEND_API_KEY = 're_test'
    const send = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
    }))

    const { sendEmail } = await import('../email')
    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' })

    expect(result.sent).toBe(false)
    expect(result.error).toBe('boom')
  })

  it('returns an error result (does not throw) when the SDK throws', async () => {
    process.env.RESEND_API_KEY = 're_test'
    const send = jest.fn().mockRejectedValue(new Error('network down'))
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
    }))

    const { sendEmail } = await import('../email')
    const result = await sendEmail({ to: 'a@b.com', subject: 's', html: '<p>h</p>' })

    expect(result.sent).toBe(false)
    expect(result.error).toBe('network down')
  })
})
