const electron = require('electron');
const path = require('path');
const fs = require('fs');

const {dialog, globalShortcut, app} = electron.remote;

let pathToFile = "";
let textBuffer = "";
let published = "";


const autoPublishCheckbox = document.getElementById("auto-publish");
const publishedArea = document.getElementById("published");
const bufferedArea = document.getElementById("edit");
const filePathValue = document.getElementById("currentFilePath");
const backToEditButton = document.getElementById("back-to-edit-button");
const publishTextButton = document.getElementById("publish-text-button");
const clearPublishedButton = document.getElementById("clear-published-text-button");
const selectFileButton = document.getElementById("select-file-button");
const newFileButton = document.getElementById("new-file-button");


backToEditButton.addEventListener('click', function () {
    publishedBackToBuffor();
});

publishTextButton.addEventListener('click', function () {
    publish()
});

publishTextButton.addEventListener('keyup', function (event) {
    if(event.shiftKey){
        publish();
    }
});

autoPublishCheckbox.addEventListener('change', function() {
    console.log("changed");
    console.log(autoPublishCheckbox.innerText);
    if(this.checked) {
       console.log("Autopublish will be set");
       setAutoPublish();
   } else {
       console.log("Autopublish will be removed");
       disableAutoPublish();
   }
});

clearPublishedButton.addEventListener('click', function() {
    clearPublishedText();
});

selectFileButton.addEventListener('click', function () {
   selectFilePath();
});

newFileButton.addEventListener('click', function () {
   newFile()
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+B': 'Ctrl+B', () => {
    publish();
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+P': 'Ctrl+P', () => {
    publishedBackToBuffor();
});

globalShortcut.register(process.platform === 'darwin' ? 'Command+E': 'Ctrl+E', () => {
    clearPublishedText();
});


function setAutoPublish() {
    console.log("set auto-publish");
    bufferedArea.addEventListener("input", publish)
}

function disableAutoPublish() {
    console.log("disable auto-publish");
    bufferedArea.removeEventListener("input", publish);
}

function clearPublishedText() {
    if( !path ) {
        alert("Select file first");
        return false;
    }

    publishedArea.value = "";
    published = "";
    saveToFile(pathToFile, "");
}

function publishedBackToBuffor(){
    bufferedArea.value = publishedArea.value;
    textBuffer = publishedArea.value;
    publishedArea.value = '';
    published = '';
}

function isFileOfType(pathToFile, extension) {

    return extension === pathToFile.split('.').pop();
}

function getTxtContent(pathToFile) {
    fs.readFile(pathToFile, "utf8", function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data);
        return data;
    });
}

function readFileContent(pathToFile, callback) {

    if(isFileOfType(pathToFile, "txt")) {
        callback(getTxtContent(pathToFile));
        return;
    }
    if(isFileOfType(pathToFile, "html")) {
        callback(getHtmlContent(pathToFile));
        return;
    }

    throw new Error("[Error]: Couldn't read content of file " + pathToFile + " Extension not supported");
}

function selectFilePath() {
    dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: 'Text', extensions: ['html', 'txt']},
            ]
        }
        ).then(result => {
        console.log(result.filePaths);
        if (undefined == result.filePaths[0]) {
            console.log('Button clicked, but no file created');
            return;
        }

        if ("txt" === result.filePaths[0].split('.').pop()){
            document.getElementById('currentFileType').innerText = 'txt';
        } else if ("html" === result.filePaths[0].split('.').pop()){
            document.getElementById('currentFileType').innerText = 'html';
        } else {
            console.log("Error occured: " + err.message);
            return;
        }
        pathToFile = result.filePaths[0];
        filePathValue.innerText = result.filePaths[0];


        readFileContent(pathToFile, function (content) {
            bufferedArea.innerText = content;
        });
    })
}

function publish(){
    console.log("Publish");
    textBuffer = bufferedArea.value;

    if( !path ) {
        alert("Select file first");
        return false;
    }

    publishedArea.value = textBuffer;
    published = textBuffer;
    saveToFile(pathToFile, textBuffer);
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
