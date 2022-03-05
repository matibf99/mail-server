import fastify from "fastify"
import nodemailer from "nodemailer"
import { google } from "googleapis"
import { Telegraf } from 'telegraf'
import "dotenv/config";


const app = fastify()
const OAuth2 = google.auth.OAuth2;
/* Telegram Bot */
const bot = new Telegraf('5256578702:AAFGoTODIUA7L7CT8vwbtKo0OZwmgN0Hh4o')

/* Bot config*/
bot.on('text', (ctx) => {
    // Using context shortcut
    ctx.reply(`Hola, soy el bot IotUnaj`)
})

bot.start('text',(ctx)=>{
    ctx.reply(`Hola, soy el bot IotUnaj`)
})

bot.launch()

/* Google config data for Gmail */
const googleConfig = {
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
};

/* OAuth Client for Gmail */
const OAuth2Client = new OAuth2(
    googleConfig.clientId, 
    googleConfig.clientSecret
);

/* Set refresh token */
OAuth2Client.setCredentials( 
    { refresh_token: googleConfig.refreshToken }
);

app.route({
    method: "GET",
    url: "/",
    schema: {},
    handler: async (request, reply) => {
        reply.send({
            "status": 200,
            "message": "success"
        })
    }
})

app.route({
    method: "POST",
    url: "/mail", 
    schema: {},
    handler: async (request, reply) => {

    console.log("Sending mail...")

	/* Getting access token */
    const accessToken = await OAuth2Client.getAccessToken();
    
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: googleConfig.user,
            clientId: googleConfig.clientId,
            clientSecret: googleConfig.clientSecret,
            refreshToken: googleConfig.refreshToken,
            accessToken: accessToken.token
        },
    });

    let info = await transport.sendMail({
        from: `"IoT Sur" <${process.env.USER}>`,
        to: `${request.body.to}`,
        subject: "Tiene una nueva alerta. IoT Sur", // Subject line
        html: `<b>Se ha activado la alarma.</b>\n\n<p>El tópico <b>${request.body.topic}</b> alcanzó un valor de <b>${request.body.value}</b></p>`, // html body
    });

    if (info.accepted) {
        reply.send({
            "status": 200,
            "message": "success"
        })

        console.log("Success")
    } else {
        reply.send({
            "status": 500,
            "message": "error"
        })

        console.error("Error")
    }

}});

app.listen(8990, '0.0.0.0', (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Server listening on ${address}`)
})