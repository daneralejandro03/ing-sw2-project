const emailController = require('../controllers/emailController');
const emailService = require('../services/emailService');
const EmailModel = require('../models/emailModel');

// ✅ Mock del cliente de Azure Communication Email
jest.mock('@azure/communication-email', () => {
  return {
    EmailClient: jest.fn().mockImplementation(() => ({
      beginSend: jest.fn().mockResolvedValue({
        pollUntilDone: jest.fn().mockResolvedValue({
          status: 'sent',
          id: 'email-message-id-123',
        }),
      }),
    })),
  };
});

// ✅ Mocks de tus dependencias
jest.mock('../services/emailService');
jest.mock('../models/emailModel');

describe('emailController.sendEmail', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        address: 'test@example.com',
        subject: 'Hola',
        plainText: 'Mensaje',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Simula EmailModel
    EmailModel.fromRequest.mockReturnValue({
      isValid: jest.fn().mockReturnValue(true),
      address: req.body.address,
      toServiceFormat: jest.fn().mockReturnValue(req.body),
    });
  });

  it('debe enviar correo correctamente', async () => {
    emailService.sendEmail.mockResolvedValue({
      success: true,
      status: 'sent',
      messageId: '123',
    });

    await emailController.sendEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Correo enviado correctamente',
      data: {
        messageId: '123',
        status: 'sent',
      },
    });
  });

  it('debe retornar advertencia si el correo está suprimido', async () => {
    emailService.sendEmail.mockResolvedValue({
      success: false,
      status: 'suppressed',
      messageId: null,
      reason: 'Destinatario suprimido',
    });

    await emailController.sendEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'warning',
      message: 'Destinatario suprimido',
      data: {
        address: req.body.address,
        status: 'suppressed',
      },
    });
  });

  it('debe retornar 400 si los campos están incompletos', async () => {
    EmailModel.fromRequest.mockReturnValueOnce({
      isValid: () => false,
    });

    await emailController.sendEmail(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Faltan campos requeridos: address, subject, plainText',
    });
  });

  it('debe llamar next(error) si ocurre un error inesperado', async () => {
    const error = new Error('Falla del servicio');
    emailService.sendEmail.mockRejectedValue(error);

    await emailController.sendEmail(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
