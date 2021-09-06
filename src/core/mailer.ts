import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "react.petchat.mailer@gmail.com",
    pass: "##SJO00a7", // Please, don't hijack my email
  },
});

export default transport;
