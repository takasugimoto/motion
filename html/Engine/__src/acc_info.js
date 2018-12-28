exports.accInfo = (function() {
    /*
     * Begin of your Personium app configurations
     */
    var appCellUrl = 'https://mydata.takky.org/motion/'; // for example: https://demo.personium.io/appCellName/ or https://appCellName.demo.personium.io/
    var appUserId = 'tokenAcc';
    var appUserPass = 'password';
    //var appUserId = 'me';
    //var appUserPass = 'personium';
    /*
     * End of your Personium app configurations
     */


    /*
     * Don't modify anything from here on
     */
    var accInfo = {};
    accInfo.APP_CELL_URL = appCellUrl;
    accInfo.APP_CELL_ADMIN_INFO = {
        cellUrl: appCellUrl,
        userId: appUserId,
        password: appUserPass
    };

    return accInfo;
}());
