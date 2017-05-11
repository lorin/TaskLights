// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var date = require('date');
var request = require("request");
var Promise = require('promise');
//record the time of last editing
var lastEditingTime = 0;
//set Interval to check if have edited
var check;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    
    var start = vscode.commands.registerCommand('extension.start', startFunc);
    var close = vscode.commands.registerCommand('extension.close', closeFunc);

    context.subscriptions.push(start);
    context.subscriptions.push(close);
 
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    return new Promise(
        function(resolve, reject){
            closeFunc();
        }
    );
}
exports.deactivate = deactivate;

function startFunc() {
    console.log('Congratulations, your extension "keeptyping" is now active!');
   
    vscode.workspace.onDidChangeTextDocument(e => editing());
    //one minute check once
    var now = Date.now();
    var diff = now - lastEditingTime;
    if (diff > 10 * 1000){
        editOff();
    } else {
        editOn();
    }

    check = setInterval(function(){
        var now = Date.now();
        var diff = now - lastEditingTime;
        //console.log("now: " + now);
        //console.log("lastEditingTime: " + lastEditingTime);
        //console.log("diff: " + diff);
        if (diff > 10 * 1000){
            editOff();
        } else {
            editOn();
        }
    }, 10 * 1000);
}

function editOn() {
    request.post('http://localhost:5000/Blink/editOn', function(err,res,body){
        console.log("Keep typing! ");
    }); 

}

function editOff() {
    request.post('http://localhost:5000/Blink/editOff', function(err,res,body){
        console.log("Don't stop typing! ");
    });
}

function editing() {
    lastEditingTime = Date.now();
    //console.log(lastEditingTime);
}

function closeFunc() {
    request.post('http://localhost:5000/Blink/off', function(err,res,body){
                console.log("Closing! ");
    });
    clearInterval(check);
}