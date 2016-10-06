if (!process.env.token) {
	console.log('Error: Specify token in environment');
	process.exit(1);
}

var Botkit = require('Botkit');
var Schedule = require('node-schedule')

var os = require('os');
var RestaurantList = [
    'Subway',
    'Panda Express',
    'McDonald\'s',
    'Yoshinoya',
    'Soy',
    'Hawaiian BBQ',
    'Taco Bell',
    'Valcano Sushi']
var nowChoice;
var generated = false;

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.on('direct_mention', function(bot, message) {
    bot.reply(message, getNowChoice());
});

controller.hears(['new'], ['message_received'], function(bot, message) {
    generated = false;
    bot.reply(message, 'Oh I get a new one.');
});



var j = Schedule.scheduleJob('0 15,23 * * *', function() {
    nowChoice = pickupRestaurant();
});

var randomSeq = []
function pickupRestaurant() {
    generated = true;

    if (randomSeq.length <= 0) {
        randomSeq = RestaurantList.slice()
    }
    
    var remainCount = randomSeq.length
    var r = Math.floor(Math.random()*remainCount);
    var tmp = randomSeq[r];
    randomSeq[r] = randomSeq[remainCount-1]
    randomSeq[remainCount - 1] = tmp;
    console.log(randomSeq);

    randomSeq.pop();
    return randomSeq.pop();
}

function getNowChoice() {
    if (!generated) {
        nowChoice = pickupRestaurant();
    }

    return nowChoice;
}
