import express from "express";
import fs from "fs";
//import env from "../../env.json" assert { type: "json" };
//import env from "../../env.json";
const env = JSON.parse(fs.readFileSync("../../env.json", "utf8"));
import twilio from "twilio";
import sendgrid from "@sendgrid/mail";

let twilioRoute = express.Router();

let accountSid = env.twilioAccountSID;
let authToken = env.twilioAuthToken;
let twilioSendgridKey = env.twilioSendgridKey;
sendgrid.setApiKey(twilioSendgridKey);

let client = twilio(accountSid, authToken);

twilioRoute.post("/sendMessage", async (req, res) => {
  try {
    let { notificationMethod, contactInfo, name, date, lineup, location, linkToTickets } = req.body;
    console.log(linkToTickets);
    let messageBody = `
    Hey there!
    
    I thought you might be interested in this concert with a lineup featuring: ${lineup}. The event will be hosted by ${name} on ${date} in ${location}.
    
    You can purchase tickets here: ${linkToTickets}.
    
    Hope to see you there!`;
    let emailMessageBody = `
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <div
          data-role="module-unsubscribe"
          class="module"
          role="module"
          data-type="unsubscribe"
          style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;"
          data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"
        >
          <p style="font-size:16px; line-height:24px;">
            Hey there!
          </p>
          <p style="font-size:16px; line-height:24px;">
            I thought you might be interested in this concert with a lineup featuring: ${lineup}. The event will be hosted by ${name} on ${date} in ${location}.
          </p>
          <p style="font-size:16px; line-height:24px;">
            You can purchase tickets here: <a href="${linkToTickets}" style="font-family:sans-serif;text-decoration:none;">${linkToTickets}</a>.
          </p>
          <p style="font-size:16px; line-height:24px;">
            Hope to see you there!
          </p>
        </div>
      </body>
    </html>`;
    console.log(linkToTickets);
    let message;
    if (notificationMethod === "email") {
      const msg: sendgrid.MailDataRequired = {
        to: contactInfo,
        from: "nd596@drexel.edu",
        subject: `Invitation to ${lineup} concert`,
        text: emailMessageBody,
        html: emailMessageBody,
      };
      message = await sendgrid.send(msg);
    } else if (notificationMethod === "sms") {
      message = await client.messages.create({
        body: messageBody,
        from: env.twilioNumber,
        to: contactInfo,
      });
    }
    console.log(message);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default twilioRoute;
