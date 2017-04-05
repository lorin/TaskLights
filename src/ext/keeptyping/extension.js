// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
//var timediff = require('timediff');
var date = require('date');

const editor = vscode.window.activeTextEditor;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "keeptyping" is now active!');
    console.log(Date.now());
    var lastCodingTime = 0;

    while (vscode.window.onDidChangeActiveTextEditor){
        lastCodingTime = Date.now();
    }

    var check = setInterval(function(){
        var diff = Date.now() - lastCodingTime;
        if (diff > 1 * 60000){
            console.log("Don't stop typing! ");
        } else {
            console.log("Keep typing! ");
        }
    }, 1 * 60000);
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
    vscode.window.showInformationMessage('Keep typing!');
}

function editOff() {
    vscode.window.showInformationMessage('Don\'t stop typing!');
}