//https://devdylansiot.us/createWebhook/799750528
//twitch event trigger follow -F https://devdylansiot.us/eventsub/ -s aievrpovfnarlhihesw9zvirpnn0dn
//const { exec } = require('child_process'); //incase I decide to use it later.
require('dotenv').config()
const moment = require('moment');
const axios = require('axios')
const crypto = require('crypto')
const express = require('express')
const bodyParser = require('body-parser');
const https = require('https')

let clientId = process.env['TWITCH_CLIENT_ID']  // these are packed this way so they can go into the webhook params.can't use .env. need .env[]
let authToken = process.env['TWITCH_ACCESS_TOKEN']
let hostURL = process.env['HOSTURL_TUNNEL_URL']
let CLIENT_SECRET = process.env['TWITCH_API_SECRET']
const espControllerOn = process.env.ESP_RELAY_CONTROLLER_ON;
const espControllerOFF = process.env.ESP_RELAY_CONTROLLER_OFF;
const port = process.env.PORT;

const app = express()

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))

app.post('/createWebhook/:type/:broadcasterId', (req, res) => {
    let now = moment();
    var createWebHookParams = {
        host: "api.twitch.tv",
        path: "helix/eventsub/subscriptions",
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Client-ID": clientId,
            "Authorization": "Bearer " + authToken
        }
    }
    var createWebHookBody = {
        "type": req.params.type,
        "version": "1",
        "condition": {
            "broadcaster_user_id": req.params.broadcasterId
        },
        "transport": {
            "method": "webhook",
            "callback": hostURL + "/notification",
            "secret": CLIENT_SECRET
        }
    }
    var responseData = ""
    var webhookReq = https.request(createWebHookParams, (result) => {
        result.setEncoding('utf8')
        result.on('data', function (d) {
            responseData = responseData + d
        })
            .on('end', function (result) {
                var responseBody = JSON.parse(responseData)
                res.send(responseBody)
            })
    })
    webhookReq.on('error', (e) => { console.log("Error") })
    webhookReq.write(JSON.stringify(createWebHookBody))
    webhookReq.end()
    console.log("accepted and processed a webhook subscription request for type: " + req.params.type + " tied to broadcasterID : " + req.params.broadcasterId + " at : " + (now.format()))
})

function verifySignature(messageSignature, messageID, messageTimestamp, body) {
    let message = messageID + messageTimestamp + body
    let signature = crypto.createHmac('sha256', CLIENT_SECRET).update(message) // Remember to use the same secret set at creation
    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

    return expectedSignatureHeader === messageSignature
}

app.post('/notification', (req, res) => {
    console.log("Verifying signature....")
    let now = moment();
    if (!verifySignature(req.header("Twitch-Eventsub-Message-Signature"),
        req.header("Twitch-Eventsub-Message-Id"),
        req.header("Twitch-Eventsub-Message-Timestamp"),
        req.rawBody)) {
        res.status(403).send("Forbidden") // Reject requests with invalid signatures
        console.log("failed to verify signature...at : " + (now.format()))
    } else {
        console.log("verified signature! at : " + (now.format()))
        //let notification = JSON.parse(req.body);
        if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
            //console.log(req.body.challenge)
            res.send(req.body.challenge) // Returning a 200 status with the received challenge to complete webhook creation flow
            console.log("successfully triggered in webhook_callback_verification")
        } else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {

            console.log(req.body)//no need to parse this, already parsed at pass to method from initial app.use() Parsing this will break things.
            /* 
            //this is a example of how it will send the req.bod
            {
              subscription: {
                id: '*********',
                status: 'enabled',
                type: 'channel.update',
                version: '1',
                condition: { broadcaster_user_id: '*******' },
                transport: {
                  method: 'webhook',
                  callback: '***********'
                },
                created_at: '*********',
                cost: 1
              },
              event: {
                broadcaster_user_id: '*********',
                broadcaster_user_login: '*********',
                broadcaster_user_name: '*********',
                title: 'Coding a Nerfgun controlled by twitch eventsub que for a friend..',
                language: 'en',
                category_id: '',
                category_name: '',
                is_mature: true
              }
            }
            */
            if (typeof req.body.subscription.type !== "undefined") {

                if (typeof req.body.event.bits !== "undefined") {
                    let totalbits = Number(req.body.event.event.bits);
                    if (req.body.subscription.type === "channel.cheer" && totalbits > 90) {
                        console.log("turning on relay due to cheer")
                        axios.get(espControllerOn).then((response) => { console.log(response.data) })
                        setTimeout(() => { axios.get(espControllerOFF).then((response) => { console.log(response.data) }) }, 6000);
                        res.send("turning on relay due to cheer") // Default .send is a 200 status
                        console.log("")
                    }
                }

                if (req.body.subscription.type === "channel.update") { //used for testing on live channel
                    console.log("turning on relay due to channel update")
                    axios.get(espControllerOn).then((response) => { console.log(response.data) })
                    setTimeout(() => { axios.get(espControllerOFF).then((response) => { console.log(response.data) }) }, 6000);
                    res.send(" turning on relay due to channel update") // Default .send is a 200 status
                    console.log("")
                }

                else if (req.body.subscription.type === "stream.online") { //used for testing on live channel
                    console.log("turning on relay due to stream online")
                    axios.get(espControllerOn).then((response) => { console.log(response.data) })
                    setTimeout(() => { axios.get(espControllerOFF).then((response) => { console.log(response.data) }) }, 6000);
                    res.send(" turning on relay due to stream online ") // Default .send is a 200 status
                } else
                    res.send("  no action taken for this event.  ") // Default .send is a 200 status
                console.log("no action taken for this event.")
                console.log("")
            }
        }
    }
})

const server = app.listen(port, () => {
    let now = moment();
    console.log(`Twitch EventSub express for IOT running on : ` + hostURL + ` using ` + port + ` at : ` + (now.format()));
})
server.timeout = 6000;                                 //sets idle out timer for requests