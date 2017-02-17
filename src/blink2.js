var Blink1 = require('node-blink1');
var color = require('onecolor');
var moment = require('moment');
var schedule = require('node-schedule');
var later = require("later");
var commandLineArgs = require('command-line-args');
var fs = require('fs');
var path = require('path');
var lame = require('lame');
var Speaker = require('speaker');
var childProcess = require('child_process');

/**
 * onecolor usage example:
 * get RGB hex and then implicitly convert it to HSL and set lightness.
 * -> Can use "red(), green(), blue(), hue(), saturation(), lightness(), value(), alpha()" getters/setters
 *
 * var cc = new color.RGB(255, 0, 0).
 * ligtness(0.5). // Implicit conversion to HSL
 * hex(); // "#800000"
 */

var palette = {
    "cadmiumlemon": "#FFE303",
    "darkolivegreen": "#556B2F",
    "cinnamon": "#7B3F00",
    "steelblue1": "#63B8FF",
    "skyblue1": "#87CEFF",
    "red": "#FF0000",
    "pink": "#FF00FF",
    "purple": '#C300C3',
    "cyan": "#00FFFF",
    "blue": "#0000FF",
    "light_blue": "#80D8FF",
    "green": "#00FF00",
    "yellow": "#FFEB3B",
    "amber": "#FFC107",
    "orange": "#FF9800",
    "deep_orange": "#FF3D00"
};

// create blink(1) object without serial number, uses first device:
var blink1 = new Blink1();
blink1.version(function (v) {
    console.log("Found blink1 with version", v);
});

// cleanup
function exitHandler(options, err) {
    if (err) {
        console.log(err.stack);
        process.exit();
    } else {
        console.log("closing");
        blink1.setRGB(0, 0, 0, function () {
            process.exit();
        });
        process.exit();
    }
}

var solidAlarm = {
    onInterval: function (start, sessionLength, lightness) {
        // console.log(new Date());
        var myColor = hexToR_G_B(Lightnen(generalGetColor(start, moment(), sessionLength * 60), lightness));
        var r = myColor[0];
        var g = myColor[1];
        var b = myColor[2];
        blink1.setRGB(r, g, b);
    },
    onEnd: function () {
        policeCar(5);
        blink1.setRGB(0, 0, 0);
    }
};

var pulseAlarm = {
    onInterval: function (start, sessionLength, lightness) {
        // console.log(new Date());
        Flashes(1, 1000, generalGetColor(start, moment(), sessionLength * 60), lightness);
    },
    onEnd: function () {
        blink1.setRGB(255, 0, 0, function () {
            blink1.fadeToRGB(10000, 0, 0, 0);
        });
    }

};


// do something when app is closing
process.on('exit', exitHandler.bind(null, {
    cleanup: true
}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
}));


/**
 * Will make a progress bar in stdout given the length in minutes
 * @param  {Number} length length of the progress bar in minutes
 */
var pbar = function(length){
    var ProgressBar = require('progress');
    var bar = new ProgressBar('TaskLights session [:bar] :percent', { incomplete: ' ', total: 60 });
    var timer = setInterval(function(){
    bar.tick();
      if (bar.complete) {
        console.log('\ncomplete\n');
        clearInterval(timer);
      }
    }, length * 1000);
}


const cli = commandLineArgs([{
    name: 'solid',
    alias: 's',
    type: Boolean
}, {
    name: 'linear',
    alias: 'l',
    type: Boolean
}, {
    name: 'exponential',
    alias: 'e',
    type: Boolean
}, {
    name: 'pomodoro',
    alias: 'p',
    type: Boolean
}, {
    name: 'tick',
    alias: 't',
    type: Boolean
}, {
    name: 'length',
    type: Number
}, {
    name: 'lightness',
    type: Number
},{
    name: 'help',
    alias: 'h',
    type: Boolean
},{
    name: 'message',
    alias: 'm',
    type: String
},{
    name: 'remote',
    alias: 'r',
    type: String
},{
    name: 'relax', //??
    alias: 'x',
    type: Boolean
},{
    name: 'asmr', //??
    alias: 'a',
    type: Boolean
}]);
const options = cli.parse();

if(options.pomodoro){
    pbar(25);
} else if (options.length) {
    pbar(options.length);
}

var lightness;
options.lightness != undefined ? lightness = options.lightness : lightness = 1;
if(options.help)
    manPage();
else if(options.solid)
    linear(options.length, solidAlarm, 1, lightness);
else if(options.linear)
    linear(options.length, pulseAlarm, 60, lightness);
else if(options.exponential)
    exponential(options.length);
else if(options.pomodoro)
    pomodoro(lightness);
else if(options.relax) //??
    relax(options.length);


// If settings.json files update empty options
if( fs.existsSync("settings.json") )
{
    var obj = JSON.parse(fs.readFileSync("settings.json"), 'utf8');
    console.log( obj )
    if( options.remote == undefined )
        options.remote = obj.remote
}

var directory = path.join(__dirname,"/logs");
var gitDirectory = path.join(directory, ".git");
var dataFile = path.join(directory, "pomodoro.json");
var gh_pages = path.join(directory, "www")

// Save message to repo.
if( options.remote )
{
    // starting a new repo
    if( !fs.existsSync( gitDirectory ) )
    {
        require('simple-git')()
            .clone(options.remote,directory, function (err) 
            {
                // done.
              commitLogMessage();
           });
    }
    else
    {
        // update repo and when there are changes, pull changes
        require('simple-git')(directory)
           .pull(function(err, update) 
           {
              if(update && update.summary.changes) 
              {
                console.log( "pulled latest")
              }
              commitLogMessage();
           });

        if( !fs.existsSync( gh_pages ) ){
            var gruntLocalPath = path.join(__dirname,"/node_modules/.bin/grunt");
            if(process.platform === 'win32')
                childProcess.execSync(`copy /Y heatmap_template\* logs && cd logs && move /Y gitignore .gitignore && npm install && ${gruntLocalPath} mustache_render && ${gruntLocalPath} gh-pages && git pull`);
            else
                childProcess.execSync(`cp -r heatmap_template/* logs && cd logs && mv gitignore .gitignore && npm install && ${gruntLocalPath} mustache_render && ${gruntLocalPath} gh-pages && git pull`);
        }
    }
}

function commitLogMessage() 
{
    if( options.message == undefined )
        options.message = "no goal specified";

    if( !fs.existsSync(dataFile) )
    {
        var obj = {}
        fs.writeFileSync(dataFile, JSON.stringify(obj, null, 2));
    }
    console.log( "Writing log mesage")
    var obj = JSON.parse(fs.readFileSync(dataFile), 'utf8');
    var seconds = Math.floor((new Date).getTime()/1000);
    delete options["remote"];
    obj[seconds] = options;


    fs.writeFile(dataFile, JSON.stringify(obj, null, 2), function(err) 
    {
        require('simple-git')(directory)
            .add('.')
            .commit(options.message)
            .push('origin', 'master');
    });

    // childProcess.execSync('cp -r heatmap_template/{,.??}* logs && cd logs && npm install && grunt mustache_render && grunt gh-pages && git pull');

}

//******************************** PATTERNS **********************************↓
/**
 * Simulating police car lights
 * @param  {number} sessionLength [seconds]
 */
function policeCar(sessionLength) {
    var r = 255;
    var b = 0;
    var rbbr = "rb";
    var pulse = setInterval(function () {
        //blink1.fadeToRGB(10, r, 0, b);
        blink1.setRGB(r, 0, b);
        if (rbbr === "rb") {
            r -= 255;
            b += 255;
            if (b === 255) {
                rbbr = "br";
            }
        } else {
            r += 255;
            b -= 255;
            if (r === 255) {
                rbbr = "rb";
            }
        }
    }, 100);

    var now = moment();
    schedule.scheduleJob(now.add(sessionLength, 's').toDate(), function () {
        clearInterval(pulse);
        blink1.setRGB(0, 0, 0);
    });
}



/**
 * Fades color from #000000 to Hex color and back to #000000 for n times
 * @param {int} n        number of pulses
 * @param {int} fadeMillis speed of pulses, ms
 * @param {String} color    Hex
 * @param {Number} lightness color's lightness will be this percentage of initial lightness - use 0 (off)-1
 * @param {Number} ledn choose led number [optional]
 */
function Flashes(n, fadeMillis, color, lightness, ledn) {
    // default value: lightness = 1
    lightness = typeof lightness !== 'undefined' ? lightness : 1;

    var r = hexToR_G_B(Lightnen(color, lightness))[0];
    var g = hexToR_G_B(Lightnen(color, lightness))[1];
    var b = hexToR_G_B(Lightnen(color, lightness))[2];

    if (n === 0) //base case
        return;

    blink1.fadeToRGB(fadeMillis, r, g, b, ledn, function () {
        blink1.fadeToRGB(fadeMillis, 0, 0, 0, ledn, function () {
            Flashes(n - 1, fadeMillis, color, lightness, ledn);
        });
    });
}



/**
 * One pulse every five seconds
 * @param {int} n     number of pulses
 * @param {String} color Hex
 * @param {Number} lightness color's lightness will be this percentage of initial lightness - use 0 (off)-1
 * @param {Number} ledn choose led number [optional]
 */
function SlowPulse(n, color, lightness, ledn) {
    Flashes(n, 5000, color, lightness, ledn);
}



/**
 * One pulse every second
 * @param {int} n     number of pulses
 * @param {String} color Hex
 * @param {Number} lightness color's lightness will be this percentage of initial lightness - use 0 (off)-1
 * @param {Number} ledn choose led number [optional]
 */
function FastPulse(n, color, lightness, ledn) {
    Flashes(n, 1000, color, lightness, ledn);
}


//******************************** SCHEDULING **********************************↓
// TODO:    Ranking patters

/**
 * Exponentially activates during the given sessionLength
 * @param  {int} sessionLength     sessionLength in seconds(for now - because testing)
 */
function exponential(sessionLength) {
    var start = moment();
    var end = start.add(sessionLength, 's');
    var exp = 1.1;
    var count = Math.floor(Math.log(sessionLength) / Math.log(exp));
    console.log(count);

    while (Math.floor(exp) < sessionLength) {
        var now = moment();
        now.add(sessionLength - Math.floor(exp), 's');
        count -= 1;

        schedule.scheduleJob(now.toDate(), function () {
            Flashes(2, 200, generalGetColor(start, moment(), sessionLength), 1);
            // Flashes(2, 200, getColorExp(1.1, sessionLength, count), 1);
            console.log("Hi there!" + " Color: " + generalGetColor(start, moment(), sessionLength));
        });

        exp *= 1.1;
        console.log("Pulse at: " + now.toDate() + " Color: " + generalGetColor(start, now, sessionLength));
    }

    schedule.scheduleJob(end.toDate(), function () {
        // policeCar(5);        //I think this would work as well
        blink1.setRGB(255, 0, 0, function () {
            blink1.fadeToRGB(5000, 0, 0, 0);
        });
    });
}
// exponential(10);



//Note: sessionLength is changed to minutes!
function linear(sessionLength, alarm, reminderInterval, lightness) {
    var start = moment();
    var stop = moment().add(sessionLength, 'minutes');
    var sched;

    if (reminderInterval <= 60) {
        sched = later.parse.recur().every(reminderInterval).second();
    } else {
        sched = later.parse.recur().every(Math.floor(reminderInterval / 60)).minute();
    }

    var pulse = later.setInterval(function () {
        alarm.onInterval(start, sessionLength, lightness);
    }, sched);

    
    schedule.scheduleJob(stop.toDate(), function () {
        pulse.clear();
        alarm.onEnd();
    });
}


function sinusoidal(sessionLength) {
    //TODO?
}


//******************************** HELPER FUNCTIONS **********************************↓

/**
 * Assign Red, Green, Blue of a hex String to [R, G, B]
 * @param  {String} hex The hex value of color
 * @return {Array}     [Red, Green, Blue] of the color in RGB
 */
function hexToR_G_B(hex) {
    return [parseInt(hex.substring(1, 3), 16),
        parseInt(hex.substring(3, 5), 16),
        parseInt(hex.substring(5, 7), 16)
    ];
}


/**
 * Reduce RGBHex's lightness to this percentage - use 0 (off)-1
 * @param {String} RGBHex  hex color (RGB)
 * @param {Number} percent reducing lightness of color to this percentage
 * @return {String} color hex
 */
function Lightnen(RGBHex, percent) {
    var L = new color(RGBHex).lightness();
    var c = new color(RGBHex).lightness(L * percent).hex();
    return c;
}


/**
 * Generate a random Number between low and high
 * @param  {Number} low
 * @param  {Number} high
 * @return {Number}      A random Number between low and high
 */
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


/**
 * Pause the script for miliSeconds
 * @param  {Number} miliSeconds length of pause
 */
function sleep(miliSeconds) {
    return function () {
        var currentTime = new Date().getTime();
        while (currentTime + miliSeconds >= new Date().getTime()) { }
    }
}


/**
 * Finds out the needed color for exponential function, first 33.33% of the sessionLength Green,
 *  second 33.33% of the sessionLength Yellow, last 33.33% of the sessionLength Red
 *
 * @param {Number} double
 * @param {int} sessionLength in seconds
 * @return {hex} color needed for linear function
 */
function getColorExp(exp, sessionLength, count) {
    var n = Math.log(sessionLength) / Math.log(exp);
    if (count < n / 3) {
        return palette.green;
    } else if (count < 2 * n / 3) {
        return palette.yellow;
    } else {
        return palette.red;
    }
}


/**
 *  Finds out the needed color for all activation functions
 *  If called in linear: first 33.33% of the sessionLength Green, second 33.33% of the sessionLength Yellow, last 33.33%  of the sessionLength Red
 *  If called in exponential: the color will change exponentially from green to yellow, to red
 *
 * @param {moment} start a moment object
 * @param {moment} now a moment object
 * @param {int} sessionLength in seconds
 * @return {hex} color needed for linear function
 */
function generalGetColor(start, now, sessionLength) {
    if (now.diff(start, 'seconds') <= sessionLength / 3) {
        return palette.green;
    } else if (now.diff(start, 'seconds') <= 2 * sessionLength / 3) {
        return palette.yellow;
    } else {
        return palette.red;
    }
}


/**
 * Prints the man page to stdout
 */
function manPage() {
    const getUsage = require('command-line-usage')

    const sections = [{
        header: 'TaskLights Options',
        optionList: [{
            name: 'solid -s',
            description: 'Solid light alarm (have to specify --length)'
        }, {
            name: 'linear -l',
            description: 'Linear pulse alarm (have to specify --length)'
        }, {
            name: 'exponential -e',
            description: 'Exponential pulse alarm (have to specify --length)'
        },{
            name: 'pomodoro -p',
            description: 'Pomodoro alram (Don\'t need to specify --length)'
        },{
            name: 'length',
            description: 'The length of alarm'
        },{
            name: 'lightness (optional)',
            description: 'Lightness of the led. So e.g. if in a dark room can use 0.7 value'
        },{
            name: 'tick -t (optional)',
            description: 'Ticking sound when doing pomodoro'
        },{
            name: 'message -m (optional)',
            description: 'The message that will be recorded for FocusDash (If set up in settings.json)'
        },{
            name: 'ASMR -a (optional)', //??
            description: 'ASMR sound when having relax'
        },{
            name: 'relax -r', //??
            description: 'Relax mode'
        }]
    }, {
        content: 'Project home: [underline]{https://github.com/alt-code/TaskLights}'
    }]
    const usage = getUsage(sections)
    console.log(usage)
    process.exit(0);
}


//******************************** Testing **********************************↓

function pomodoro(lightness) {
    if(options.tick){
        fs.createReadStream("./assets/pomodoroTimer.mp3")
          .pipe(new lame.Decoder())
          .on('format', function (format) {
            this.pipe(new Speaker(format));
          });
    }
    linear(25, solidAlarm, 1, lightness);
}

function pomodoroT(lightness) {
    var sched = later.parse.recur().every(30).second();

    var pulse = later.setInterval(function () {
        pomodoro(lightness);
    }, sched);
}

/**
 * Prints the man page to stdout
 * @param {String} path of the audio
 * @param {int} sessionLength in minutes
 */
var stream;
function play_audio(sessionLength, songurl){ //??
    setTimeout(function(){
        stream.end();
        process.exit();
    },sessionLength * 60000); 
    
    stream = fs.createReadStream(songurl) 
    .pipe(new lame.Decoder())
    .pipe(new Speaker())
    .on('finish', function() {      
        play_audio(sessionLength, songurl);
    });
}

function relax(sessionLength) { 
    var songurl = "./assets/test4.mp3";
    console.log(moment());
    if (options.asmr){
        play_audio(sessionLength + 1/100, songurl); //close later than light
    }
    
    var lengthness;
    var sched2 = later.parse.recur().every(10).second();
    var pulse = later.setInterval(function () {
        if (options.lightness){
            Flashes(1, 5000, palette.skyblue1, lightness);
        } else {
            Flashes(1, 5000, palette.skyblue1, 1);
        }
    }, sched2);
    
    setTimeout(function(){
        pulse.clear();
        console.log(moment());
    },sessionLength * 60000);

}
