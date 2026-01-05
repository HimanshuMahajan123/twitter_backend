import mailgen from "mailgen";
import nodemailer from "nodemailer";

//Nodemailer transporter configuration ( nodemailer talks to SMTP server(we used mailtrap as a fake SMTP server for dev/testing))
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

//Generic email sending function : Takes structured email content → converts it to HTML + text → sends it using SMTP
//sending email is always an async function
const sendEmail = async (options) => {
  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "Twitter Clone",
      link: "http://twitterClone.com",
    },
  });

  //Plain text : For old email clients, spam safety
  //HTML : For buttons, styles, branding
  //SMTP sends both, client chooses what it can render.
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  //standard mail object for SMTP
  const mail = {
    from: "Twitter Clone <noreply@twitterClone.com>",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mail);
    console.log("Email sent successfully to " + options.email);
  } catch (error) {
    console.error("Error sending email to " + options.email + ": ", error);
  }
};

//Email verification mail content genrator
const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Mailgen! We're very excited to have you on board.",
      action: {
        instructions: "To get started with your account , please click here : ",
        button: {
          color: "#22BC66",
          text: "Verify your account",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

//Forgot password mail content genrator
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset your password.",
      action: {
        instructions: "Click the button below to proceed.",
        button: {
          color: "#FF0000",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
