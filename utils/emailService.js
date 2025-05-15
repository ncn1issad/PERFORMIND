const nodemailer = require('nodemailer');
const config = require('../config/config'); // Create this file with your email settings

let transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred service
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});

exports.setTransporter = (newTransporter) => {
  transporter = newTransporter;
};

exports.sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${config.appUrl}/users/verify/${token}`;

  const mailOptions = {
    from: config.email,
    to: user.email,
    subject: 'Verificare adresă de email',
    html: `<p>Salut ${user.fullname},</p>
           <p>Te rugăm să confirmi adresa ta de email accesând acest link:</p>
           <a href="${verificationUrl}">Verifică adresa de email</a>
           <p>Link-ul expiră în 24 de ore.</p>`
  };

  return transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${config.appUrl}/users/reset-password/${token}`;

  const mailOptions = {
    from: config.email,
    to: user.email,
    subject: 'Resetare parolă',
    html: `<p>Salut ${user.fullname},</p>
           <p>Ai solicitat resetarea parolei. Accesează acest link pentru a seta o nouă parolă:</p>
           <a href="${resetUrl}">Resetează parola</a>
           <p>Link-ul expiră în 1 oră.</p>`
  };

  return transporter.sendMail(mailOptions);
};