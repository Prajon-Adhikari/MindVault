import { transporter } from "@/lib/mailer";

export async function sendRemainder(email: string, otp: string) {
  await transporter.sendMail({
    from: `"MindVault" <${process.env.MY_GMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Verification Code</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
}

export async function sendPracticeReminder(
  email: string,
  userName: string,
  topicName: string,
  reminderTime: string,
  topicUrl: string,
) {
  await transporter.sendMail({
    from: `"MindVault" <${process.env.MY_GMAIL}>`,
    to: email,
    subject: `Time to practice ${topicName}!`,
    text: `Hello ${userName},

It's time for your daily practice.

Topic: ${topicName}
Reminder time: ${reminderTime}

Open your topic: ${topicUrl}

Keep learning and stay consistent!

MindVault`,
    html: `
      <div style="max-width:560px;margin:30px auto;padding:28px;font-family:Arial,sans-serif;color:#334155;border:1px solid #e2e8f0;border-radius:14px">
        <h2 style="color:#0f172a">Time to practice!</h2>
        <p>Hello ${escapeHtml(userName)},</p>
        <p>It's time to continue working towards your learning goals.</p>
        <div style="background:#f8fafc;padding:18px;border-radius:10px">
          <p style="color:#64748b;margin:0">Today's topic</p>
          <h3>${escapeHtml(topicName)}</h3>
          <p>Reminder time: <strong>${escapeHtml(reminderTime)}</strong></p>
        </div>
        <p style="margin-top:24px">
          <a href="${escapeHtml(topicUrl)}"
             style="background:#0f172a;color:white;padding:12px 20px;text-decoration:none;border-radius:8px">
            Open Topic
          </a>
        </p>
        <p style="font-size:12px;color:#94a3b8;margin-top:28px">
          You received this email because you enabled daily practice reminders in MindVault.
        </p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
