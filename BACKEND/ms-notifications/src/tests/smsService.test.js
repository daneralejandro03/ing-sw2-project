// ✅ 1. Primero declaramos el mock de poller y su método
const mockPoller = {
  pollUntilDone: jest.fn(),
};

// ✅ 2. Luego mockeamos EmailClient con jest.mock()
jest.mock('@azure/communication-email', () => {
  return {
    EmailClient: jest.fn().mockImplementation(() => ({
      beginSend: jest.fn().mockResolvedValue(mockPoller),
    })),
  };
});

// ✅ 3. Ahora importamos el servicio (después del mock)
const emailService = require('../services/emailService');
const { EmailClient } = require('@azure/communication-email');

describe('EmailService', () => {
  beforeEach(() => {
    mockPoller.pollUntilDone.mockReset();
  });

  it('debe enviar email correctamente', async () => {
    mockPoller.pollUntilDone.mockResolvedValueOnce({
      status: 'sent',
      id: 'email-message-id-123',
    });

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

    expect(EmailClient).toHaveBeenCalled();
    expect(mockPoller.pollUntilDone).toHaveBeenCalled();
  });

  it('debe detectar supresión de destinatario', async () => {
    const suppressedError = new Error('EmailDroppedAllRecipientsSuppressed');
    suppressedError.code = 'EmailDroppedAllRecipientsSuppressed';
    mockPoller.pollUntilDone.mockRejectedValueOnce(suppressedError);

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
    mockPoller.pollUntilDone.mockRejectedValueOnce(error);

    await expect(
      emailService.sendEmail({
        address: 'fail@example.com',
        subject: 'Falla',
        plainText: 'Algo salió mal',
      })
    ).rejects.toThrow('Error al enviar el correo: Ocurrió un error inesperado');
  });
});
