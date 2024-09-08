import { createTransport } from "nodemailer";

const mailSender = async(email, subject, message) => {
    try {
        const transporter = createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: 'hhchoksi.976@gmail.com',
                pass: 'rqwdwngpphnryebp'
            }
        });
        
        const info = await transporter.sendMail({
            from: 'hhchoksi.976@gmail.com',
            to: email,
            subject,
            text: message,
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send email');
    }
};

export default mailSender;