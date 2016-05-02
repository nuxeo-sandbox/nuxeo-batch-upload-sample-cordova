document.addEventListener('deviceready', function () {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        console.info('The File APIs are fully supported in this browser.');
    } else {
        console.error('The File APIs are not fully supported in this browser.');
    }
}, false);

function processInputFile() {
    var url = cordova.file.applicationDirectory + '/www/img/engie-cofely.png';

    window.resolveLocalFileSystemURL(url, function (fileEntry) {
            fileEntry.file(function (file) {
                // Overriding localURL attribute with absolute file path
                file.localURL = fileEntry.toURL();

                // Overriding type attribute as it is otherwise empty
                file.type = 'image/png';

                uploadFileToNuxeoPlatform(file)
            })
        }
    );
}


function uploadFileToNuxeoPlatform(file) {
    var nuxeo = new Nuxeo({
        baseURL: 'http://engie.cloud.nuxeo.com/nuxeo/',
        auth: {
            method: 'basic',
            username: 'Administrator',
            password: 'Administrator'
        }
    });

    var blob = new Nuxeo.Blob({content: file});

    nuxeo
        .batchUpload()
        .upload(blob)
        .then(function (response) {
            console.info('Response received.');
            var batchBlob = response.blob;
            if (batchBlob instanceof Nuxeo.BatchBlob) {
                console.info('BatchBlob is: ' + JSON.stringify(batchBlob));
            }
        })
        .catch(function (error) {
            console.error("An error occurred uploading blob: " + error.message);
        });
}