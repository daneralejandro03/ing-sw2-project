jest.mock('@azure/communication-email', () => ({
  EmailClient: jest.fn().mockImplementation(() => ({
    beginSend: jest.fn().mockResolvedValue({
      pollUntilDone: jest.fn().mockResolvedValue({ status: 'Succeeded' }),
    }),
  })),
}));

const fs = require('fs');
jest.mock('fs');

const path = require('path');
fs.readFileSync.mockReturnValue("<html>{{subject}} - {{plainText}}</html>");

const { sendEmail } = require('../service/emailService');

describe('sendEmail', () => {
  it('envía un correo con éxito', async () => {
    const result = await sendEmail('test@example.com', 'Asunto', 'Contenido');
    expect(result.status).toBe('Succeeded');
  });
});
