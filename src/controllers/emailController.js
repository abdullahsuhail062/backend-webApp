import { sendEmail } from '../config/email.js';
import asyncHandler from '../utils/asyncHandler.js';

export const sendContactEmail = asyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;

  await sendEmail({
    to,
    subject,
    html: `<div style="font-family:sans-serif"><p>${message}</p></div>`
  });

  res.json({ success: true, message: 'Email sent successfully' });
});