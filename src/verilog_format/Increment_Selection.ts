// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


/**
 * Support functions
 * Modified version of https://stackoverflow.com/questions/12504042/what-is-a-method-that-can-be-used-to-increment-letters
 */
function nextChar(c) {
    var isLowerCase = false;
    if (c == c.toLowerCase()) {
        isLowerCase = true;
    }
    var u = c.toUpperCase();
    if (same(u, 'Z')) {
        var txt = '';
        var i = u.length;
        while (i--) {
            txt += 'A';
        }
        return convertCase((txt + 'A'), isLowerCase);
    } else {
        var p = "";
        var q = "";
        if (u.length > 1) {
            p = u.substring(0, u.length - 1);
            q = String.fromCharCode(p.slice(-1).charCodeAt(0));
        }
        var l = u.slice(-1).charCodeAt(0);
        var z = nextLetter(l);
        if (z === 'A') {
            return convertCase(p.slice(0, -1) + nextLetter(q.slice(-1).charCodeAt(0)) + z, isLowerCase);
        } else {
            return convertCase(p + z, isLowerCase);
        }
    }
}

function nextLetter(l) {
    if (l < 90) {
        return String.fromCharCode(l + 1);
    }
    else {
        return 'A';
    }
}

function same(str, char) {
    var i = str.length;
    while (i--) {
        if (str[i] !== char) {
            return false;
        }
    }
    return true;
}

function convertCase(c, isLowerCase) {
    if (isLowerCase) {
        c = c.toLowerCase();
    }
    return c;
}

function getPaddingLength(st) {
    var counter = 0
    for (var i = 0, b = st.length; i < b; i++) {
        if (st[i] !== '0') {
            break;
        }
        counter++;
    }

    if (counter == st.length) {
        counter--;
    }

    if (counter > 0) {
        return st.length;
    }
    else {
        return 0;
    }
}

Number.prototype.pad = function (paddingLength) {
    var sign = Math.sign(this) === -1 ? '-' : '';
    var s = String(Math.abs(this));
    while (s.length < paddingLength) { s = "0" + s; }
    return sign + s;
}

export function doSelection(action) {
    const config = vscode.workspace.getConfiguration('increment-selection');

    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }

    var selections = editor.selections;
    if (config.topToBottom) {
        selections.sort((a, b) => a.start.compareTo(b.start));
    }
    var firstSelection = editor.document.getText(selections[0]);

    // If it is a number or nothing has been selected
    if (!isNaN(parseInt(firstSelection)) || firstSelection.length == 0) {

        //default behaviour if no selection are made
        if (firstSelection.length == 0) {
            firstSelection = "0"
        }

        var paddingLength = getPaddingLength(firstSelection);

        firstSelection = parseInt(firstSelection);

        editor.edit(function (edit) {
            selections.forEach(function (selection) {
                edit.replace(selection, String(
                    action === 'increment'
                        ? (firstSelection++).pad(paddingLength)
                        : (firstSelection--).pad(paddingLength)
                ));
            })
        });
    }
    else { // if it is a char
        editor.edit(function (edit) {
            selections.forEach(function (selection) {
                edit.replace(selection, String(firstSelection));
                firstSelection = nextChar(firstSelection);
            })
        });
    }
}

export function reverse(){
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }

    var content =[];
    var selections = editor.selections;
    selections.forEach(function (selection){
        content.push(editor.document.getText(selection));
    });

    editor.selections.reverse()
    selections = editor.selections;

    const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);

    var pairs = zip(selections, content)

    editor.edit(function (edit) {
        pairs.forEach(function (pair) {
            edit.replace(pair[0], pair[1]);
        })
    });
}


//---------------------------------------------------------------------------------------------


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
// export function Increment_Selection(context) {

//     // Use the console to output diagnostic information (console.log) and errors (console.error)
//     // This line of code will only be executed once when your extension is activated
//     // console.log('Congratulations, your extension "increment-selection" is now active!');

//     // The command has been defined in the package.json file
//     // Now provide the implementation of the command with  registerCommand
//     // The commandId parameter must match the command field in package.json
//     let incrementSelection = vscode.commands.registerCommand('extension.incrementSelection', function () {
//         doSelection('increment');
//     });

//     let decrementSelection = vscode.commands.registerCommand('extension.decrementSelection', function () {
//         doSelection('decrement');

//     });

//     let reverseSelection = vscode.commands.registerCommand('extension.reverseSelection', function () {
//         reverse();
//     });

//     context.subscriptions.push(incrementSelection, decrementSelection, reverseSelection);
// }
// exports.activate = activate;

// // this method is called when your extension is deactivated
// function deactivate() {
// }
// exports.deactivate = deactivate;
