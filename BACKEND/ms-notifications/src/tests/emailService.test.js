const emailService = require('../services/emailService');
const { EmailClient } = require('@azure/communication-email');

jest.mock('@azure/communication-email');

describe('EmailService', () => {
  const mockPoller = {
    pollUntilDone: jest.fn().mockResolvedValue({
      status: 'sent',
      id: 'email-message-id-123',
    }),
  };

  const mockBeginSend = jest.fn().mockResolvedValue(mockPoller);

  beforeEach(() => {
    EmailClient.mockImplementation(() => ({
      beginSend: mockBeginSend,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe enviar email correctamente', async () => {
    const result = await emailService.sendEmail({
      address: 'test@example.com',
      subject: 'Test Subject',
      plainText: 'Texto de prueba',
    });

    expect(result).toEqual({
      status: 'sent',
      messageId: 'email-message-id-123',
      success: true,
    });

    expect(mockBeginSend).toHaveBeenCalled();
    expect(mockPoller.pollUntilDone).toHaveBeenCalled();
  });

  it('debe detectar supresión de destinatario', async () => {
    const suppressedError = new Error('EmailDroppedAllRecipientsSuppressed');
    suppressedError.code = 'EmailDroppedAllRecipientsSuppressed';
    mockBeginSend.mockRejectedValueOnce(suppressedError);

    const result = await emailService.sendEmail({
      address: 'suppressed@example.com',
      subject: 'No se enviará',
      plainText: 'Contenido',
    });

    expect(result).toEqual({
      status: 'suppressed',
      messageId: null,
      success: false,
      reason:
        'El destinatario está en la lista de supresión y el correo no fue enviado.',
    });
  });

  it('debe lanzar error desconocido si ocurre excepción diferente', async () => {
    const error = new Error('Ocurrió un error inesperado');
    mockBeginSend.mockRejectedValueOnce(error);

    await expect(
      emailService.sendEmail({
        address: 'fail@example.com',
        subject: 'Falla',
        plainText: 'Algo salió mal',
      })
    ).rejects.toThrow('Error al enviar el correo: Ocurrió un error inesperado');
  });
});
