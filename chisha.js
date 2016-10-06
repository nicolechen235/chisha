var Botkit = require('Botkit');
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

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: "xoxb-88090889617-diF9tdAA2r1hUbSEzNNXQmN1"
}).startRTM();

controller.on('direct_mention', function(bot, message) {
    bot.reply(message, getRestaurantName());
});

var randomSeq = []

function getRestaurantName() {
    if (randomSeq.length <= 0) {
        randomSeq = RestaurantList.slice()
    }
    var remainCount = randomSeq.length
    var r = Math.floor(Math.random()*remainCount);
    var tmp = randomSeq[r];
    randomSeq[r] = randomSeq[remainCount-1]
    randomSeq[remainCount - 1] = tmp;
    console.log(randomSeq);
    return randomSeq.pop()
}

