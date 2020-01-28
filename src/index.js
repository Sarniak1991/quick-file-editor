const electron = require('electron');
const path = require('path');
const fs = require('fs');
const {dialog, globalShortcut: globalShortcut, app} = electron.remote;
const Store = require('./configStore');


let pathToFile = "";
let textBuffer = "";
let published = "";
const htmlTemplate = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>QuickTexter</title></head><body><span id="content"></span></body></html>';

const autoPublishCheckbox = document.getElementById("auto-publish");
const publishedArea = document.getElementById("published");
const bufferedArea = document.getElementById("edit");
const filePathValue = document.getElementById("currentFilePath");
const backToEditButton = document.getElementById("back-to-edit-button");
const publishTextButton = document.getElementById("publish-text-button");
const clearPublishedButton = document.getElementById("clear-published-text-button");
const selectFileButton = document.getElementById("select-file-button");
const newFileButton = document.getElementById("new-file-button");
const currentFileType = document.getElementById('currentFileType');


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

autoPublishCheckbox.addEventListener('change', switchAutoPublish);

clearPublishedButton.addEventListener('click', function() {
    clearPublishedText();
});

selectFileButton.addEventListener('click', function () {
   selectFilePath();
});

newFileButton.addEventListener('click', function () {
   newFile()
});

function switchAutoPublish() {
    if(this.checked) {
        console.log("Autopublish will be set");
        setAutoPublish();
    } else {
        console.log("Autopublish will be removed");
        disableAutoPublish();
    }
}

function setUpConfig(callback){
    callback(new Store({
        configName: 'user-preferences',
        defaults: {
            'globalShortKeys': {
                'publish': {
                    'mac': 'Command+P',
                    'win': 'Ctrl+P',
                },
                'backToBuffor': {
                    'mac': 'Command+D',
                    'win': 'Ctrl+D',
                },
                'clearPublished': {
                    'mac': 'Command+D',
                    'win': 'Ctrl+D',
                },
                'switchAutoPublish': {
                    'mac': 'Command+L',
                    'win': 'Ctrl+L',
                }
            }
        }
    }))
}

setUpConfig(registerGlobalShortKeys);

function registerGlobalShortKeys(configStore)
{
    console.log(configStore);
    let shortKeys = configStore.get('globalShortKeys');
    console.log(shortKeys);
    globalShortcut.register(process.platform === 'darwin' ? shortKeys['publish']['mac']: shortKeys['publish']['win'], () => {
        publish();
    });

    globalShortcut.register(process.platform === 'darwin' ?  shortKeys['backToBuffor']['mac']: shortKeys['backToBuffor']['win'], () => {
        publishedBackToBuffor();
    });

    globalShortcut.register(process.platform === 'darwin' ? shortKeys['clearPublished']['mac']: shortKeys['clearPublished']['win'], () => {
        clearPublishedText();
    });

    globalShortcut.register(process.platform === 'darwin' ? shortKeys['switchAutoPublish']['mac']: shortKeys['switchAutoPublish']['win'], () => {
        switchAutoPublish();
    });
}

function setAutoPublish() {
    console.log(configStore.get('test'));
    console.log("set auto-publish");
    bufferedArea.addEventListener("input", publish)
}

function disableAutoPublish() {
    console.log("disable auto-publish");
    bufferedArea.removeEventListener("input", publish);
}

function clearPublishedText() {
    if( !pathToFile ) {
        alert("Select file first");
        return false;
    }
    configStore.set('test2', '1');
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

            let filePath =  result.filePaths[0];
            pathToFile = result.filePaths[0]

            if ("txt" === filePath.split('.').pop()){
                fs.readFile(filePath, "utf8", function (err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log(data);
                    bufferedArea.value = data;
                });
                currentFileType.innerText = 'txt';

            } else if ("html" === filePath.split('.').pop()){
                fs.readFile(filePath, "utf8", function (err, data) {
                    if (err) {
                        throw err;
                    }
                    console.log(data);
                    bufferedArea.value = data.match('<body>(.*)</body>')[1];
                });
                currentFileType.innerText = 'html';
            } else {
                console.log("Error occured: " + err.message);
                return;
            }

            filePathValue.innerText = filePath;
    })
}

function publish(){
    console.log("Publish");
    textBuffer = bufferedArea.value;
    console.log("Publish path = " + path);

    if( !pathToFile) {
        console.log("Publish path = " + path);
        alert("Select file first");
        return false;
    }

    publishedArea.value = textBuffer;
    published = textBuffer;
    saveToFile(pathToFile, textBuffer);
}

function saveToFile(path, content) {

    if("txt" === currentFileType.innerText) {
        fs.writeFile(path, content, (err) => {
            if (err) {
                console.log("Error occured: " + err.message);
            }
        });
    } else if ("html" === currentFileType.innerText)  {
        content = includeContentInHtml(content);
        fs.writeFile(path, content, (err) => {
            if (err) {
                console.log("Error occured: " + err.message);
            }
        });
    } else {
        console.log("ERROR: not writeable format of the file");
    }
}

function includeContentInHtml(content) {
    return htmlTemplate.replace('<span id="content"></span>', content);
}

function newFile() {

    let content;
    let contentTxt = "";

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
                content = htmlTemplate;
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
