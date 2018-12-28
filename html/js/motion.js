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
        $("#entitylist").html(_html.join("<br>"));
}
