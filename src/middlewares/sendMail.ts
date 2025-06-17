import nodemailer, { Transporter } from 'nodemailer';

const transport: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS as string,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD as string,
    },
});

export default transport;
