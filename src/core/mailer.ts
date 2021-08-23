import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "23df49b1ad02d5",
    pass: "678621c2d90b22",
  },
});

export default transport;
