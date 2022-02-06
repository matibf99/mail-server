import fastify from "fastify"
import nodemailer from "nodemailer"
import "dotenv/config";

const app = fastify()

app.route({
    method: "POST",
    url: "/mail", 
    schema: {
        querystring: {
            to: { type: 'string' },
            topic: { type: 'string' },
            value: { type: 'string' }
        }
    },
    handler: async (request, reply) => {
    
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: `"IoT Sur" <${process.env.USER}>`,
        to: "iotsurrr@gmail.com",
        subject: "Tiene una nueva alerta. IoT Sur", // Subject line
        html: `<b>Se ha activado la alarma.</b>\n\n<p>El tópico <b>${request.body.topic}</b> alcanzó un valor de <b>${request.body.value}</b></p>`, // html body
    });

    if (info.accepted) {
        reply.send({
            "status": 200,
            "message": "success"
        })
    } else {
        reply.send({
            "status": 500,
            "message": "error"
        })
    }

}});

app.listen(3000, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Server listening on ${address}`)
})