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
var manuallyReset = false;

var controller = Botkit.slackbot({
    debug: true
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.on('direct_mention', function(bot, message) {
    if (message.text.indexOf('new') == -1 && message.text.indexOf('shutdown')) {        
        bot.reply(message, getNowChoice());
    }
});

controller.hears(['new'], 'direct_message,direct_mention,mention', function(bot, message) {
    if (!manuallyReset) {
        generated = false;
        manuallyReset = true;
        bot.reply(message, 'Oh I get a new one.');
        bot.reply(message, 'Try ' + getNowChoice());

    }
    else {
        bot.reply(message, 'Just GO ' + getNowChoice());

        date = new Date();
        hour = date.getHours();
        bot.reply(message, 'You can reset until ' + (hour > 15 ? 23 : 15) + ':00.');
    }

});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});

var j = Schedule.scheduleJob('0 15,23 * * *', function() {
    manuallyReset = false;
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

    return randomSeq.pop();
}

function getNowChoice() {
    if (!generated) {
        nowChoice = pickupRestaurant();
    }

    return nowChoice;
}
