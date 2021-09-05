import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "react.petchat.mailer@gmail.com",
    pass: "89neteso",
  },
});

export default transport;
