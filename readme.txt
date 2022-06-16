A simple Twitch eventSub that will be used to hook IOT devices to twitch to have responses to donations and other events.
there is logic within this repo that relates to a esp relay controller I have, but you can apply your own logic as needed.

to install : npm install
to run : node index.js

change the example.env to a .env and fill out your own info, twitch does require https. I don't recomend using ngrok but I see people use it for this often enough.

to get user broadcast id use the twitch cli and do:
twitch api get /users -q login=

To make a get request to create a webhook for subscription types by submitting a blank get request using :
https://YourURL.com/createWebhook/:type/:broadcasterId
replace type with the subscription type, example is channel.update, and the broadcastId with the channels you want to hook it into.

you can also send a self made webhook post to twitch directly using this link: https://api.twitch.tv/helix/eventsub/subscriptions

you will need to satisfy oauth2.0, you can use a service like 0auth and after you get the app approved on the twitch dev portal you can stop using it unless you need cheer or guarded event reactions. That will come soon. A streamlabs release will as well. also considering making a enroll portal that takes a broadcast ID and shoots out a get request for all sub types.

I reccomend using a Virtual Server / Port Forwarder or firewall gate that will allow connections based on the IP of the connections, that way you can host a VPS (easier for https and not exposing your home network) and connect this utility to a esp or arduino with wifi module directly by establishing your VPS as being allowed to call them. I would also **highly** recomend using a firewall on the host of the eventSub express instance that only allows usage of the port it is running on from your IP and twitch as a source..... imagine if someone knew your host url, they could enlist anyone they had the broadcasterId for into your instance, use a test twitch cli trigger and set off your iot devices.

TODO:
add subtype.env and fill it with all the sub types prefixed by incrimenting numbers. Add a route that will use /webhooksingleton/:CustomSetPassword/:broadcasterId and process a request to the(also add /:CustomSetPassword/ to this) /createWebhook/:type/:broadcasterId route attempting to applying all the subtypes in the subtype.env for that broadcasterId and log all the success/failures.

complete full oauth2.0 to enable cheer and other features other then the open sub calls.