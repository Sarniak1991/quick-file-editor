const electron = require('electron');
const path = require('path');
const fs = require('fs');

const {dialog, globalShortcut, app} = electron.remote;

let pathToFile = "";
let textBuffer = "";
let published = "";

const publishedArea = document.getElementById("published");
const bufferedArea = document.getElementById("edit");
const filePathValue = document.getElementById("currentFilePath");
const backToEditButton = document.getElementById("back-to-edit-button");
const publishTextButton = document.getElementById("publish-text-button");
const clearPublishedButton = document.getElementById("clear-published-text-button");
const selectFileButton = document.getElementById("select-file-button");
const newFileButton = document.getElementById("new-file-button");


backToEditButton.addEventListener('click', function (event) {
    publishedBackToBuffor();
});

publishTextButton.addEventListener('click', function (event) {
    textBuffer = bufferedArea.value;
    publish(pathToFile, textBuffer)
});

publishTextButton.addEventListener('keyup', function (event) {
    if(event.shiftKey){
        textBuffer = bufferedArea.value;
        publish(pathToFile, textBuffer);
    }
});

clearPublishedButton.addEventListener('click', function(event) {
    clearPublishedText();
});

selectFileButton.addEventListener('click', function (event) {
   selectFilePath();
});

newFileButton.addEventListener('click', function (event) {
   newFile()
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+B': 'Ctrl+B', () => {
    textBuffer = bufferedArea.value;
    publish(pathToFile, textBuffer);
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+P': 'Ctrl+P', () => {
    publishedBackToBuffor();
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+E': 'Ctrl+E', () => {
    clearPublishedText();
});



function clearPublishedText() {
    if( !path ) {
        alert("Select file first");
        return false;
    }

    publishedArea.value = "";
    published = "";
    saveToFile(path, "");
}

function publishedBackToBuffor(){
    bufferedArea.value = publishedArea.value;
    textBuffer = publishedArea.value;
    publishedArea.value = '';
    published = '';
}

function selectFilePath() {
    dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: 'Text', extensions: ['html', 'txt']},
            ]
        }
        ).then(result => {

        if (undefined == result.filePath) {
            console.log('Button clicked, but no file created');
            return;
        }

        if ("txt" === result.filePath.split('.').pop()){
            document.getElementById('currentFileType').innerText = 'txt';
        } else if ("html" === result.filePath.split('.').pop()){
            document.getElementById('currentFileType').innerText = 'html';
        } else {
            console.log("Error occured: " + err.message);
            return;
        }
        pathToFile = result.filePaths[0];
        filePathValue.innerText = result.filePaths[0];
    })
}

function publish(path, content){
    if( !path ) {
        alert("Select file first");
        return false;
    }

    publishedArea.value = content;
    published = content;
    saveToFile(path, content);
}

function saveToFile(path, content) {

    fs.writeFile(path, content, (err) => {
        if (err) {
            console.log("Error occured: " + err.message);
        }
    });
}

function newFile() {

    let content;
    let contentTxt = "";
    let contentHtml = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>QuickTexter</title> <link rel="stylesheet" href="../main.css"></head><body></body></html>';

    const options = {
        defaultPath: app.getPath('documents') + '/',
        filters: ['html', 'txt']
    };
    dialog.showSaveDialog(options).then(
        result => {

            if (undefined == result.filePath) {
                console.log('Button clicked, but no file created');
                return;
            }

            if ("txt" === result.filePath.split('.').pop()){
                document.getElementById('currentFileType').innerText = 'txt';
                content = contentTxt;
            } else if ("html" === result.filePath.split('.').pop()){
                document.getElementById('currentFileType').innerText = 'html';
                content = contentHtml;
            } else {
                console.log("Error occured: " + err.message);
                return;
            }

            filePathValue.innerText = result.filePath;
            pathToFile = result.filePath;
            fs.writeFile(result.filePath, content, (err) => {
                if (err) {
                    console.log("Error occured: " + err.message);
                    return;
                }

                alert("File created successfuly: " + result.filePath);
            });


        }
    );
}
