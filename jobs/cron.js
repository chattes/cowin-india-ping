var cron = require("node-cron");
const { addDays, format, getISODay } = require("date-fns");
const got = require("got");
const { delay, random } = require("lodash");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.CHANNEL_TOKEN, {
  polling: false,
});

const startJob = () => {
  if (!process.env.CHANNEL_TOKEN) {
    throw new Error("No Telegram Token found");
  }
  cron.schedule("*/10 * * * *", async () => {
    console.log("******************************************");
    console.log(`Job Starting... at ${new Date()}`);
    const randomDelay = Math.floor(Math.random() * 10) + 1;
    const aMinute = 1000 * 60;
    const wait = aMinute * randomDelay;
    console.log(
      `Adding a Delay of ${Math.floor(wait / (1000 * 60))} minutes...`
    );
    delay(async () => {
      await pingCowin();
      console.log(`Job Run done... at ${new Date()}`);
      console.log("*******************************************");
    }, wait);
  });
};

const getNextMonday = () => {
  let today = getISODay(new Date());
  let nextMondayDiff = 7 - (today - 1); // 1 is Monday
  let nextWeekStart = addDays(new Date(), nextMondayDiff);
  return format(nextWeekStart, "dd-MM-yyyy");
};

const pingCowin = async () => {
  try {
    let nextWeek = getNextMonday();

    console.log(`Setting up query for ${nextWeek}`);

    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=725&date=${nextWeek}`;
    const response = await got(url, {
      responseType: "json",
      resolveBodyOnly: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
      },
    }).json();

    const centers = response.centers;

    if (centers && centers.length > 0) {
      const centerLookUp = centers.filter((center) => {
        let sessionValid = false;
        const isPaid = center.fee_type === "Paid";
        const searchSessionResult = center.sessions.findIndex(
          (session) =>
            session.available_capacity > 0 &&
            session.vaccine === "COVISHIELD" &&
            session.min_age_limit === 18
        );
        if (searchSessionResult >= 0) {
          sessionValid = true;
        }
        return sessionValid && isPaid;
      });
      if (centerLookUp.length > 0) {
        console.log("Valid Center Found");
        const dateAvailable = centerLookUp[0].sessions[0].date;
        bot.sendMessage(
          process.env.CHANNEL_ID,
          `VACCINE AVAILABLE - ${dateAvailable}`
        );
        return;
      } else {
        console.log("No Center with Filter matched...");
      }
    }

    console.log("No Centers found");
  } catch (error) {
    console.error("An error has occured", error);
    bot.sendMessage(
      process.env.CHANNEL_ID,
      `An error has occured while getting Slots`
    );
  }
};

module.exports = {
  startJob,
};
