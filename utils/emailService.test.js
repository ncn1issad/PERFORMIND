// tests/emailService.test.js

const nodemailer = require('nodemailer');
const config = require('../config/config');

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
    let mockSendMail;
    let mockTransporter;
    let emailService;

    beforeEach(() => {
        jest.resetModules();
        // Create a mock sendMail function that returns a resolved promise
        mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
        mockTransporter = { sendMail: mockSendMail };

        // Replace the transporter in the module with our mock
        nodemailer.createTransport.mockReturnValue(mockTransporter);
        emailService = require('../utils/emailService');
        emailService.setTransporter(mockTransporter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('sendVerificationEmail should call sendMail with correct parameters', async () => {
        // Arrange
        const user = {
            fullname: 'Test User',
            email: 'help2921@gmail.com'
        };
        const token = 'verification-token-123';
        const expectedVerificationUrl = `${config.appUrl}/users/verify/${token}`;

        // Act
        await emailService.sendVerificationEmail(user, token);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const emailArgs = mockSendMail.mock.calls[0][0];
        expect(emailArgs.from).toBe(config.email);
        expect(emailArgs.to).toBe(user.email);
        expect(emailArgs.subject).toBe('Verificare adresă de email');
        expect(emailArgs.html).toContain(user.fullname);
        expect(emailArgs.html).toContain(expectedVerificationUrl);
    });

    test('sendPasswordResetEmail should call sendMail with correct parameters', async () => {
        // Arrange
        const user = {
            fullname: 'Test User',
            email: 'help2921@gmail.com'
        };
        const token = 'reset-token-456';
        const expectedResetUrl = `${config.appUrl}/users/reset-password/${token}`;

        // Act
        await emailService.sendPasswordResetEmail(user, token);

        // Assert
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const emailArgs = mockSendMail.mock.calls[0][0];
        expect(emailArgs.from).toBe(config.email);
        expect(emailArgs.to).toBe(user.email);
        expect(emailArgs.subject).toBe('Resetare parolă');
        expect(emailArgs.html).toContain(user.fullname);
        expect(emailArgs.html).toContain(expectedResetUrl);
    });

    test('should handle errors when email sending fails', async () => {
        // Arrange
        mockSendMail.mockRejectedValue(new Error('Sending failed'));
        const user = { email: 'help2921@gmail.com', fullname: 'Test User' };

        // Act & Assert
        await expect(emailService.sendVerificationEmail(user, 'token'))
            .rejects.toThrow('Sending failed');
    });
});