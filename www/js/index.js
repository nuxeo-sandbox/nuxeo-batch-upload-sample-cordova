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
              file.localURL = fileEntry.toURL();
              var reader = new FileReader();
            	reader.onloadend = function (evt) {
            		var blob = new Blob([evt.target.result]);
            		var nuxeoBlob = new Nuxeo.Blob({content: blob, name: file.name, mimeType: 'image/png'});
            		uploadFileToNuxeoPlatform(nuxeoBlob);
            	};
              reader.readAsArrayBuffer(file);
            })
        }
    );
}

function uploadFileToNuxeoPlatform(blob) {
    var nuxeo = new Nuxeo({
        baseURL: 'http://engie.cloud.nuxeo.com/nuxeo/',
        auth: {
            method: 'basic',
            username: 'Administrator',
            password: 'Administrator'
        }
    });
    nuxeo
        .batchUpload()
        .upload(blob)
        .then(function (response) {
          return nuxeo.operation('Document.Create')
         .params({
           type: 'Picture',
           name: 'My image',
           properties: 'dc:title=My image \ndc:description=Image uploaded via cordova-plugin-file.'
         })
         .input('/default-domain/workspaces/Installations')
         .execute()
         .then(function(doc) {
           console.info("Empty document created: "+JSON.stringify(doc));
           console.info("Url to the document: http://engie.cloud.nuxeo.com/nuxeo/nxdoc/default/"+doc.uid+"/view_documents");
           return nuxeo.operation('Blob.AttachOnDocument')
             .param('document', doc.path)
             .input(response.blob)
             .execute({ schemas: ['dublincore', 'file']});
         })
       }).then(function(res){
          console.info("File uploaded and attached to document");
        })
        .catch(function (error) {
            console.error("An error occurred uploading blob: " + error.message);
        });
}
