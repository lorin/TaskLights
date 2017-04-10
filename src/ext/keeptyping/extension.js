// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
//var blink = require('node-blink1');
var date = require('date');
var lastCodingTime = 0;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "keeptyping" is now active!');
    
vscode.workspace.onDidChangeTextDocument(e => editing());
//one minute check once
    var check = setInterval(function(){
        var now = Date.now();
        var diff = now - lastCodingTime;
        //console.log("now: " + now);
        //console.log("lastCodingTime: " + lastCodingTime);
        //console.log("diff: " + diff);
        if (diff > 60 * 1000){
            editOff();
        } else {
            editOn();
        }
    }, 60 * 1000);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    /*
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed
       //editor.onDidChangeActiveTextEditor(editOn);
        
    });
    
    context.subscriptions.push(disposable);
    */

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function editOn() {
    console.log("Keep typing! ");
    //blink.fadeToRGB(1000, 0, 255, 0);
    //vscode.window.showInformationMessage('Keep typing!');
}

function editOff() {
    console.log("Don't stop typing! ");
    //blink.fadeToRGB(1000, 255, 0, 0);
    //vscode.window.showInformationMessage('Don\'t stop typing!');
}

function editing(){
    lastCodingTime = Date.now();
    //console.log(lastCodingTime);
}