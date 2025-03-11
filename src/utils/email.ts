import nodemailer from "nodemailer";

export const sendResetEmail = async (email: string, resetLink: string) => {
  console.log("sendResetEmail called with:", email, resetLink);

  console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
  console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // Use `true` for port 465, `false` for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Cuisine Cart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    console.log("Sending email with options:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Email sending failed.");
  }
};
