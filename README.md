### What

A simple node server which ping COWIN api and gets information about vaccination slots in Kolkata

### Telegram Integration

In order to use it for yourself you need to register a Telegram Bot and get the Token. Also the `CHANNEL_ID` is required to
send message to a channel.

You should put

```
CHANNEL_TOKEN = <TELEGRAM BOT TOKEN>
CHANNEL_ID = <YOUR TELEGRAM CHANNEL ID>
```

in a .env file

### Where

I am using for `Kolkata`, but you can change it for the region you want by changing the `district_id` in the URL.

```
https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=725&date=${nextBestDateFormatted}

```

### Frequency

It will ping at a staggered interval of 15~30 MINUTES.

### How to run

```
npm install
npm start
```

Also if you want to run with pm2

```
pm2 start
```
