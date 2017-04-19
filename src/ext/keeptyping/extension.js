// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var date = require('date');
var request = require("request");
var Promise = require('promise');

var lastCodingTime = 0;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "keeptyping" is now active!');
   
    vscode.workspace.onDidChangeTextDocument(e => editing());
    //one minute check once
    var now = Date.now();
    var diff = now - lastCodingTime;
    if (diff > 10 * 1000){
        editOff();
    } else {
        editOn();
    }

    var check = setInterval(function(){
        var now = Date.now();
        var diff = now - lastCodingTime;
        //console.log("now: " + now);
        //console.log("lastCodingTime: " + lastCodingTime);
        //console.log("diff: " + diff);
        if (diff > 10 * 1000){
            editOff();
        } else {
            editOn();
        }
    }, 10 * 1000);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    /*
    var disposable = vscode.commands.registerCommand('extension.sayHello', function (sessionLength) {
        // The code you place here will be executed every time your command is executed
       //editor.onDidChangeActiveTextEditor(editOn);
       setTimeout(
        function(){
            clearInterval(check);
        } , sessionLength * 60 * 1000);
 
    });
    
    context.subscriptions.push(disposable);
    */
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    return new Promise(
        function(resolve, reject){
            request.post('http://localhost:5000/Blink/off', function(err,res,body){
                console.log("Closing! ");
            });
        }
    );
    
}
exports.deactivate = deactivate;

function editOn() {
    request.post('http://localhost:5000/Blink/editOn', function(err,res,body){
        // callback
        console.log("Keep typing! ");
    }); 

}

function editOff() {
    request.post('http://localhost:5000/Blink/editOff', function(err,res,body){
        // callback
        console.log("Don't stop typing! ");
    });
}

function editing(){
    lastCodingTime = Date.now();
    //console.log(lastCodingTime);
}