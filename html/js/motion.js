var motion = {};

motion.getODataEntityList = function(token, colleciton, entity) {
        $.ajax({
                type: 'GET',
                url: Common.accessData.boxUrl + colleciton + "/" + entity,
                headers: {
                        'Accept':'application/json',
                        'Authorization':'Bearer ' + token,
                }
        }).done(function(entityList) {
                motion.getODataEntityListDisplay(entityList)
        }).fail(function(error) {
                console.log(error.responseJSON);
        });
}

motion.getODataEntityListDisplay = function(respons_json) {
        _html = [];
        respons_json.d.results.forEach(function( _resp ) {
                _html.push(_resp.no + " " + _resp.titel + " " + _resp.name);
        });
        $("#myContents").html(_html.join("<br>"));
}

motion.sendFileToServer = function (formData, status, cntentDir, collection, entity) {
    var _cntentDir = cntentDir;
    var _collection = collection;
    var _entity = entity;
    var fm_file = formData.get('file');
    var uploadURL = Common.accessData.boxUrl + _cntentDir + "/" + fm_file.name; //Upload URL
    var extraData ={}; //Extra Data.
    var jqXHR=$.ajax({
        xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener('progress', function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    //Set progress
                    status.setProgress(percent);
                }, false);
            }
            return xhrobj;
        },
        url: uploadURL,
        type: "PUT",
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + Common.accessData.token
        },
        contentType:false,
        processData: false,
        cache: false,
        data: formData,
        success: function(data){
            var odataInputURL = Common.accessData.boxUrl + _collection + "/" + _entity;
            var No = 6;
            var odataInput = "{" + "\"titel\": \"" + fm_file.name + "\", \"name\": \"" + fm_file.name + "\", \"no\": \"" + No + "\"}";
            $.ajax({
                type: "POST",
                url: odataInputURL,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + Common.accessData.token
                },
                data: odataInput
        }).done(function(respons) {
                status.setProgress(100);
            }).fail(function(error) {
                status.setProgress(0);
            });
            //$("#status1").append("File upload Done<br>");
        },
        error: function(){
            status.setProgress(0);
        }
    });

    status.setAbort(jqXHR);
}

var rowCount=0;
motion.createStatusbar = function (obj) {
     rowCount++;
     var row="odd";
     if(rowCount %2 ==0) row ="even";
     this.statusbar = $("<div class='statusbar "+row+"'></div>");
     this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
     this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
     this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
     this.abort = $("<div class='abort'>Abort</div>").appendTo(this.statusbar);
     obj.after(this.statusbar);

    this.setFileNameSize = function(name,size)
    {
        var sizeStr="";
        var sizeKB = size/1024;
        if(parseInt(sizeKB) > 1024)
        {
            var sizeMB = sizeKB/1024;
            sizeStr = sizeMB.toFixed(2)+" MB";
        }
        else
        {
            sizeStr = sizeKB.toFixed(2)+" KB";
        }

        this.filename.html(name);
        this.size.html(sizeStr);
    }
    this.setProgress = function(progress)
    {
        var progressBarWidth =progress*this.progressBar.width()/ 100;
        this.progressBar.find('div').animate({ width: progressBarWidth }, 10).html(progress + "% ");
        if(parseInt(progress) >= 100)
        {
            this.abort.hide();
        }
    }
    this.setAbort = function(jqxhr)
    {
        var sb = this.statusbar;
        this.abort.click(function()
        {
            jqxhr.abort();
            sb.hide();
        });
    }
}
motion.handleFileUpload = function (files,obj,contentdir,collection,entity) {
   for (var i = 0; i < files.length; i++)
   {
        var fd = new FormData();
        fd.append('file', files[i]);

        var status = new motion.createStatusbar(obj); //Using this we can set progress.
        status.setFileNameSize(files[i].name,files[i].size);
        motion.sendFileToServer(fd,status,contentdir,collection,entity);

   }
}
$(document).ready(function()
{
var obj = $("#dragandrophandler");
obj.on('dragenter', function (e)
{
    e.stopPropagation();
    e.preventDefault();
    $(this).css('border', '2px solid #0B85A1');
});
obj.on('dragover', function (e)
{
     e.stopPropagation();
     e.preventDefault();
});
obj.on('drop', function (e)
{

     $(this).css('border', '2px dotted #0B85A1');
     e.preventDefault();
     var files = e.originalEvent.dataTransfer.files;

     //We need to send dropped files to Server
     motion.handleFileUpload(files,obj,mlg.CONTENTDIR,mlg.COLLECTION,mlg.ENTITY);
});
$(document).on('dragenter', function (e)
{
    e.stopPropagation();
    e.preventDefault();
});
$(document).on('dragover', function (e)
{
  e.stopPropagation();
  e.preventDefault();
  obj.css('border', '2px dotted #0B85A1');
});
$(document).on('drop', function (e)
{
    e.stopPropagation();
    e.preventDefault();
});

});
