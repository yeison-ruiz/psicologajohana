const nodemailer = require("nodemailer");
require('dotenv').config({ path: '.env.local' });

async function testGmail() {
  console.log('Testing Gmail with:', process.env.GMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test Psicoconnect" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Test de Conectividad Gmail 🚀",
      text: "Si recibes esto, el sistema de correos de Psicoconnect está funcionando correctamente con Gmail.",
      html: "<b>Si recibes esto, el sistema de correos de Psicoconnect está funcionando correctamente con Gmail. 🚀</b>",
    });
    console.log("Email enviado con éxito:", info.messageId);
  } catch (error) {
    console.error("Error al enviar email:", error);
  }
}

testGmail();
