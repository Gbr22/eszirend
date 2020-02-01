let HOST = "https://eszi.edupage.org";
let CONNECT_MOBILE = HOST+"/connect_mobile.php";

var rp = require('request-promise');
var request = require('request');
var xmldoc = require('xmldoc');

let DEFAULT_FORM = {
    lang:"hu",
    os:"android",
    version:"2019.5.49",
    osversion:"AND 32,0,0,225",
}
let DEFAULT_HEADERS = {
    'Referer': 'app:/EdupageMobile.swf'
}


function createGuest(){
    return new Promise(function(resolve,reject){
        let form = Object.assign(DEFAULT_FORM, {
            akcia:"createGuestAccount",
            typ:"Student",
            email:"test@example.com"
        });
        request({
            headers:Object.assign(DEFAULT_HEADERS, {
                'Content-Type':'application/x-www-form-urlencoded',
            }),
            uri: `${CONNECT_MOBILE}`,
            form:form,
            method: 'POST',
        }, function (error, response, body){
            if (error){
                reject(error);
            }
            resolve(JSON.parse(body));
        });
    })
    
}
function parseLogin(xml){
    var document = new xmldoc.XmlDocument(xml);
    let obj = document.attr;
    obj.appdata = JSON.parse(obj.appdata);
    return obj;
}
function loginNewGuest(){
    return new Promise(function(resolve,reject){
        createGuest().then(function(resp){
            login(resp.data.login,resp.data.heslo).then(function(body){
                resolve(parseLogin(body));
            })
        })
    });
}
function login(m,h){
    return new Promise(function(resolve,reject){
        let form = Object.assign(DEFAULT_FORM, {
            m:m,
            h:h
        });
        request({
            headers:Object.assign(DEFAULT_HEADERS, {
                'Content-Type':'application/x-www-form-urlencoded',
            }),
            uri: `${HOST}/login/eauth`,
            form:form,
            method: 'POST',
        }, function (error, response, body){
            if (error){
                reject(error);
            }
            resolve(body);
        });
    });
}




module.exports = {
    createGuest,
    login,
    loginNewGuest
}