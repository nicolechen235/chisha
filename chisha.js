if (!process.env.token) {
	console.log('Error: Specify token in environment');
	process.exit(1);
}

var Botkit = require('Botkit');
var Schedule = require('node-schedule')

var os = require('os');
var RestaurantList = [
    'Subway',
    'Panda Express']
    // 'McDonald\'s',
    // 'Yoshinoya',
    // 'Soy',
    // 'Hawaiian BBQ',
    // 'Taco Bell',
    // 'Valcano Sushi']
var nowChoice;
var generated = false;
var manuallyReset = false;
var superuser = false;

var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.on('direct_mention,mention,direct_message', function(bot, message) {
    if (message.text.length == 0) {
        bot.reply(message, getNowChoice());
    }
    else {
        var msg_text = message.text.trim();

        if (msg_text.indexOf('sudo') == 0) {
            superuser = true;
        }
        else {
            superuser = false;
        }

    }
});

// liu hao is stupid, hahaha
controller.hears(['stupid'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, '<@liu462>');
});

controller.hears(['new'], 'direct_message,direct_mention,mention', function(bot, message) {
    if (superuser || !manuallyReset) {
        generated = false;
        manuallyReset = true;
        bot.reply(message, 'Oh I got a new one.');
        bot.reply(message, 'Try ' + getNowChoice());
    }
    else {
        bot.reply(message, 'Just GO ' + getNowChoice());

        date = new Date();
        hour = date.getHours();
        bot.reply(message, 'You can reset after ' + (hour > 15 ? 23 : 15) + ':00.');
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
    generated = false;
    getNowChoice();
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
    console.log("Remain sequence:" + randomSeq);

    return randomSeq.pop();
}

function getNowChoice() {
    if (!generated) {
        tmpPick = pickupRestaurant();
        // this can happen when a new sequence start, 
        // and generate a new one just as same as the last one in last sequence
        while (tmpPick == nowChoice) {
            randomSeq.push(tmpPick);
            tmpPick = pickupRestaurant();
        } 

        nowChoice = tmpPick;
    }

    return nowChoice;
}
