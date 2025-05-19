const smsController = require('../controllers/smsController');
const smsService = require('../services/smsService');
const SmsModel = require('../models/smsModel');

jest.mock('../services/smsService');
jest.mock('../models/smsModel');

describe('smsController.sendSms', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        to: '+573001234567',
        body: 'Hola desde el test',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    SmsModel.fromRequest.mockReturnValue({
      isValid: jest.fn().mockReturnValue(true),
      toServiceFormat: jest.fn().mockReturnValue(req.body),
    });
  });

  it('debe enviar SMS correctamente', async () => {
    smsService.sendSms.mockResolvedValue({
      sid: 'sms123',
      status: 'sent',
      success: true,
    });

    await smsController.sendSms(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'SMS enviado correctamente',
      data: {
        sid: 'sms123',
        status: 'sent',
      },
    });
  });

  it('debe retornar 400 si los campos son inválidos', async () => {
    SmsModel.fromRequest.mockReturnValueOnce({
      isValid: () => false,
    });

    await smsController.sendSms(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Faltan campos requeridos: to, body',
    });
  });

  it('debe llamar a next(error) si ocurre error inesperado', async () => {
    const error = new Error('Error de envío');
    smsService.sendSms.mockRejectedValue(error);

    await smsController.sendSms(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
