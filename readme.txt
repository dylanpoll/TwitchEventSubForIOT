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