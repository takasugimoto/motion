var mlg = {};

mlg.PROFILE_TIMEOUT = 1000;

mlg.setRootUrl = function (cellUrl) {
    if (cellUrl) {
            mlg.rootUrl = cellUrl;
    } else {
            let hash = location.hash.substring(1);
            let params = hash.split("&");
            let arrParam = {};
            for (var i in params) {
                var param = params[i].split("=");
                arrParam[param[0]] = param[1];
            }
            if (arrParam["cell"]) {
                    mlg.rootUrl = arrParam["cell"];
            } else {
                    mlg.rootUrl = cellUrl;
            }
    }
}
mlg.motionLogout = function () {
    mlg.sendAccountNamePw("", "", "");
    $("#user_img").attr("src", "./img/melon.png");
    $("#user_name").html("ゲスト さん");
    $('#slideL').animate({'marginLeft':'0px'},0);
    mlg.dispLogin();
}
mlg.motionLogin = function () {
    // If there is id,password in the parameter, log in automatically
    let hash = location.hash.substring(1);
    let params = hash.split("&");
    let arrParam = {};
    for (var i in params) {
        var param = params[i].split("=");
        arrParam[param[0]] = param[1];
    }
    commdata = JSON.parse(sessionStorage.getItem("Common.accessData"));
    if (commdata) {
            mlg.access_token = commdata.token;
            $("*[name=select_locales]").val(commdata.locales);
    }
    if (mlg.access_token) {
        mlg.sendAccountNamePw(mlg.access_token, "", "");
        mlg.profileTimer();
    } else if (arrParam.id && arrParam.password) {
        // Try login with id, password
        $("#login_user").val(arrParam.id);
        $("#login_password").val(arrParam.password);
        mlg.sendAccountNamePw("", $("#login_user").val(), $("#login_password").val());
        mlg.profileTimer();
    } else if ($("#login_user").val() && $("#login_password").val()) {
        $("#login_error").html("");
        mlg.sendAccountNamePw("", $("#login_user").val(), $("#login_password").val());
        mlg.profileTimer();
    } else {
        mlg.dispLogin();
    }
    $('#slideL').addClass('off');
}
mlg.getCell = function (cellUrl) {
    if (!cellUrl) cellUrl = "https";

    return $.ajax({
        type: "GET",
        url: cellUrl,
        headers: {
            'Accept': 'application/json'
        }
    });
};
mlg.sendAccountNamePw = function(token, username, pw) {
    if (token) {
        access_token = "";
        refresh_token = "";
        commdata = JSON.parse(sessionStorage.getItem("Common.accessData"));
        if (commdata) {
            access_token = commdata.token;
            refresh_token = commdata.refToken;
        }
        _ajax = {
            type: "POST",
            url: mlg.rootUrl + '__token',
            processData: true,
            dataType: 'json',
            data: {
                    grant_type: "refresh_token",
                    refresh_token: refresh_token,
                    p_cookie: true
            },
            headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/x-www-form-urlencoded'
            }
        };
    } else {
        _ajax = {
                type: "POST",
                url: mlg.rootUrl + '__token',
                processData: true,
                dataType: 'json',
                data: {
                        grant_type: "password",
                        username: username,
                        password: pw,
                        p_cookie: true
                },
                headers: {
                        'Accept': 'application/json',
                        'content-type': 'application/x-www-form-urlencoded'
                }
        };
    }
    $.ajax( _ajax
    ).done(function (data) {
        mlg.getCell(mlg.rootUrl).done(function (cellObj) {
            ////data = JSON.parse(sessionStorage.getItem("sessionData"));
            mlg.unitUrl = cellObj.unit.url;
        }).fail(function (xmlObj) {
            var i = mlg.rootUrl.indexOf("/"); // first slash
            i = mlg.rootUrl.indexOf("/", i + 2);  // second slash
            mlg.unitUrl = mlg.rootUrl.substring(0, i + 1);
        }).always(function () {
            if (location.origin === undefined) {
                location.origin = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
            }
            //mlg.loadStyleSheet();
            mlg.loadScript();
            mlg.dispContent();
        });
    }).fail(function(){
        // login failed
        if (username) {
                $("#login_error").html("UserName もしくは Password が間違っています。");
        } else {
                mlg.access_token = "";
                try {
                    Common.accessData.access_token = "";
                    Common.accessData.token = "";
                    Common.accessData.refToken = "";
                    Common.accessData.expires = "";
                    Common.accessData.refExpires = "";
                    sessionStorage.setItem("Common.accessData", JSON.stringify(Common.accessData));
                } catch(e) {
                    sessionStorage.removeItem("Common.accessData");
                }
        }
        mlg.dispLogin();
    });
};
mlg.loadStyleSheet = function() {
    let head = document.getElementsByTagName('head')[0];
    let styleList = [
        homeAppUrl + appUseBox + "/html/css/common.css",
        homeAppUrl + appUseBox + "/html/css/personium.css"
    ];

    for (var i = 0; i < styleList.length; i++) {
        let link = document.createElement("link");
        link.href = styleList[i];
        link.rel = "stylesheet";
        link.type = "text/css";
        head.appendChild(link);
    }
}
mlg.loadScript = function(callback) {
    let head = document.getElementsByTagName('head')[0];
    let scriptList = [
        homeAppUrl + appUseBox + "/html/js/app.js",
        homeAppUrl + appUseBox + "/html/js/common.js",
        homeAppUrl + appUseBox + "/html/js/common_personium.js",
        homeAppUrl + appUseBox + "/html/js/motion.js"
    ];
    let i = 0;
    (function appendScript() {
        if (typeof scriptList[i] == "undefined") {
            if ((typeof callback !== "undefined") && $.isFunction(callback)) {
                callback();
            };
            return false;
        }
        let script = document.createElement('script');
        script.src = scriptList[i];

        head.appendChild(script);
        i++;
        script.onload = function (e) {
            appendScript();
        }
    })();
}
mlg.profileTimer = function() {
    mlg.rp_cnt = 0;
    mlg.checkProfileTimer = setInterval(mlg.refreshProfile, mlg.PROFILE_TIMEOUT);
}
mlg.refreshProfile = function() {
    try {
        if (Common.accessData.userName) {
                motion.getODataEntityList(Common.accessData.token, "contents", "content");
                $("#user_img").attr("src", Common.accessData.profile);
                if (!Common.accessData.locales == "ja") {
                        $("#user_name").html(Common.accessData.userName);
                } else {
                        $("#user_name").html(Common.accessData.userName + " さん");
                }
                clearInterval(mlg.checkProfileTimer);
        }
    } catch {
        mlg.rp_cnt += 1;
        if (mlg.rp_cnt > 5) {
                clearInterval(mlg.checkProfileTimer);
        }
    }
}
mlg.dispLogin = function() {
        $("#slideL").css("display", "none");
        $("#login").css("display", "block");
        $("#content").css("display", "none");
}
mlg.dispContent = function() {
        $("#slideL").css("display", "block");
        $("#login").css("display", "none");
        $("#content").css("display", "block");
}
