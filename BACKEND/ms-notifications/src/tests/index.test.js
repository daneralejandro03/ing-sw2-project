const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

jest.mock('../service/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ status: 'Succeeded' }),
}));

const { sendEmail } = require('../service/emailService');

app.post('/send-email', async (req, res) => {
  const { address, subject, plainText } = req.body;
  if (!address || !subject || !plainText) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const result = await sendEmail(address, subject, plainText);
  res.status(200).json({ status: result.status });
});

describe('POST /send-email', () => {
  it('responde con status 200 al enviar email', async () => {
    const res = await request(app).post('/send-email').send({
      address: 'test@example.com',
      subject: 'Prueba',
      plainText: 'Contenido de prueba',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Succeeded');
  });
});
