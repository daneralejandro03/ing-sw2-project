jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'SMxxxxxxxxxxxxxxxx',
        status: 'sent',
      }),
    },
  }));
});

const { sendSms } = require('../service/smsService');

describe('sendSms', () => {
  it('envía un SMS con éxito', async () => {
    const result = await sendSms('+1234567890', 'Hola mundo');
    expect(result.sid).toBeDefined();
    expect(result.status).toBe('sent');
  });
});
