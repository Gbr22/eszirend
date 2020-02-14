if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() { console.log("Service Worker Registered"); });
}



window.location.hash = "";

var loadingTable = false;

function fetchJSON(url){
    return new Promise(function(resolve,reject){
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            
                resolve(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.open("GET", url, true);
        try {
            xhttp.send();
        } catch(err) {
            reject("Failed to send request");
        }
        
    })
}
let classes = [];
let daynames = ["Hétfő","Kedd","Szerda","Csütörtök","Péntek"];
let settings = {
    padding:"5px"
}
let pos = (new Date()).getDay();
if (pos > 4){
    pos = 0;
}
let className = "";
let prevScroll = 0;
let scrolling = false;

function scrollToPosition(){
    let days = document.getElementsByClassName("day");
    for (let i=0; i < days.length; i++){
        days[i].classList.remove("show");
    }
    try {
        days[pos].classList.add("show");
    }catch(err){

    }
    
    document.documentElement.style.setProperty('--table-scroll-index', pos);
    /*let width = parseFloat(window.getComputedStyle(document.getElementById("day0")).width.replace("px"));
    document.getElementById("window").scroll({
        top:0,
        left:pos*width,
        behavior: 'smooth'
    });*/
}

let loop = function(){
    if (document.getElementById("dayswrap") != undefined){
        let precent = document.getElementById("dayswrap").scrollLeft / document.getElementById("dayswrap").scrollWidth
        let pos = document.getElementById("daynames_wrap").scrollWidth * precent * -1;
        document.getElementById("daynames_wrap").style.transform = "translateX("+pos+"px)";
    }

    if (vueData.isOnline != navigator.onLine){
        vueData.isOnline = navigator.onLine;
    }

    requestAnimationFrame(loop);
}


function openThing(){
    history.pushState({},"");
}
window.onpopstate = function(event) {
    console.log("pop",window.location);

    if (vueData.helpOpen){
        vueData.helpOpen = false;
    }
    else if (vueData.classViewOpen){
        vueData.classViewOpen = false;
    }
    else if (vueData.tableMode){
        vueData.tableMode = false;
    }

};
function getFirstLetter(word){
    let doubleLetters = ["Cs","Dz","Dzs","Gy","Ly","Ny","Sz","Ty","Zs"];
    let wasDoubleLetter = false;
    for (let i_=0; i_ < doubleLetters.length; i_++){
        if (word.indexOf(doubleLetters[i_]) == 0){
            word = doubleLetters[i_];
            wasDoubleLetter = true;
            break;
        }
    }
    if (!wasDoubleLetter){
        word = word[0];
    }
    return word;
}
function isBigRow(row){
    if (row.length >= 3){
        let smallList = ["angol","német","Angol nyelv","Német nyelv","Magyar nyelv szövegértés"];
        let allis = true;
        for (let i=0; i < row.length; i++){
            let _class = row[i];

            let contains = false;
            for (let j=0; j < smallList.length; j++){
                if ( _class.subject.indexOf(smallList[j]) != -1){
                    contains = true;
                }
            }
            if (!contains){
                allis = false;
                break;
            }
        }
        
        return allis;

    }
    return false;
}
function getBiggestClassHeight(row){
    let h = -Infinity; //height
    for (let i = 0; i < row.length; i++) {
        const e = row[i];
        if (e.classLength > h){
            h = e.classLength;
        }
    }
    return h;
}
var times = [
    {//0
        start:"7:00",
        length: 45
    },
    {//1
        start:"7:50",
        length: 45
    },
    {//2
        start:"8:45",
        length: 45
    },
    {//3
        start:"9:40",
        length: 45
    },
    {//4
        start:"10:35",
        length: 45
    },
    {//5
        start:"11:35",
        length: 45
    },
    {//6
        start:"12:35",
        length: 45
    },
    {//7
        start:"13:30",
        length: 45
    },
    {//8
        start:"14:20",
        length: 45
    },
    {//9
        start:"15:10",
        length: 45
    },
    {//10
        start:"16:00",
        length: 45
    },
    {//11
        start:"16:50",
        length: 45
    },
    {//12
        start:"17:40",
        length: 45
    },
    {//13
        start:"18:30",
        length: 45
    },
];
function assignCopy(src) {
    return Object.assign({}, src);
}
function getHourInfo(hour){
    let formatMinute = function(m){
        if (m < 10){
            return "0"+m;
        } else {
            return ""+m;
        }
    }

    let info = assignCopy(times[hour]);
    info.start_hour = parseFloat(info.start.split(":")[0] );
    info.start_minute = parseFloat(info.start.split(":")[1] );
    info.start_in_minutes = info.start_hour*60 + info.start_minute;
    info.end_in_minutes = info.start_in_minutes+info.length;
    info.end_hour = Math.floor(info.end_in_minutes/60);
    info.end_minute = info.end_in_minutes - info.end_hour*60;
    info.end = info.end_hour+":"+formatMinute(info.end_minute);
    return info;
}

let currentTable = null;



function loadMainPage(){
    console.log("loading mainpage");
    vueData.tableMode = false;
}



let vueData = {
    daynames,
    isOnline:navigator.onLine,
    tableMode:false,
    currentTable:null,
    versionSelectOpen:false,
    helpOpen:false,
    classView:null,
    classViewOpen:false,
    versions:[],
    selectedVersion: {
        text:"",
        tables:[]
    }
    
}
function formatClassRoom(string_){
    let s = string_.split(" /max")[0]; 
    let num = s.split(" ")[0];
    s=num;
    if (string_.indexOf("(IA)") != -1){
        s+=`<i class="material-icons">cast</i>`;
    }
    if (string_.indexOf("gépterem") != -1){
        s+=`<i class="material-icons">desktop_windows</i>`;
    }

    return s;
}
function getColor(group){
    let color = null;
    let aliases = {
        "Informatika":"inf",
        "Mechatronika":"mechatro",
        "Környezetvédelem":"körny",
        "Ügyvitel":"ügyv",
        "Közgazdaság":"közg",
        "Csoport 1":"csop1",
        "Csoport 2":"csop2",

        "Infó":"inf",
        "Körny":"körny",
    }
    let colors = {
        "inf":"#0099ff",
        "körny":"#00ff99",
        "csop1":"#1a8cff",
        "csop2":"#ff6666",
        "közg":"#ffcccc",
        "ügyv":"#ccffcc",
        "mechatro":"#94b8b8",
    }
    for (p in aliases){
        if (group.indexOf(p) != -1 || group.indexOf(p.toLowerCase()) != -1){
            return colors[aliases[p]];
        }
    }
}
function formatGroup(g,classname){
    let shorts = {
        "Angol":"Ang",
        "Német":"Ném",
        "Környezetvédelem":"♻️",
        "Informatika":"🖱️",
        "Mechatronika":"🛠️",
        "Ügyvitel":"Ügyv",
        "Közgazdaság":"Közg",
        "Csoport":"Csop"
    }
    
    let out = (g).replace("all","").replace(classname+" ","");;
    for (p in shorts){
        out = out.replace(p,shorts[p]);
        out = out.replace(p.toLowerCase(),shorts[p]);
    }
    function trimToLang(langGroup){
        let index = out.indexOf(langGroup)
        if (index != -1){
            out = out.slice(index,index+langGroup.length+1);
        }
    }
    trimToLang("Ang");
    trimToLang("Ném");
    if (out.indexOf("mindennapos") != -1){
        out = "";
    }
    
    return out;
}
function shortenName(class_){
    let name = class_.teacher;
    if (class_.width <= 30){
        name = name.split(" ");
        for (let l=0; l < name.length; l++){
            name[l] = getFirstLetter(name[l]);
        }
        return name.join(" ");
    }
    let nameArr = name.split(" ");
    let index = nameArr.length-1;
    while(nameArr.join(" ").length > 15){
        if (index == -1){
            break;
        }
        
        nameArr[index] = getFirstLetter(nameArr[index]);
        index--;
        
    }
    name = nameArr.join(" ");
    return name;
}
var app = new Vue({
    el: '#app',
    data: vueData,
    mounted(){
        loop();
    },
    methods:{
        openClass(class_,yIndex){
            console.log(class_,yIndex);

            let classStart = yIndex+1;
            let classEnd = yIndex+1;
            let hour = classStart; //Hour display string
            
            if (class_.classLength > 1){
                classEnd += class_.classLength-1;
                hour += "-"+classEnd;
            }

            hour+=". óra";
            
            vueData.classView = {
                class:class_,
                hour,
                start:getHourInfo(classStart).start,
                end:getHourInfo(classEnd).end,
            };
            vueData.classViewOpen = true;

            
            openThing();
        },
        shortenName,
        getBiggestClassHeight,
        formatGroup,
        getColor,
        isBigRow,
        formatClassRoom,
        openThing,
        getClassViewColor(){
            let default_ = '#e4e4e4';
            if (!this.classView){
                return default_;
            }
            return getColor(this.classView.class.group) || default_;
        },
        formatVersionText(v){
            return v.text.replace(v.info,"").replace("()","").trim();
        },
        isKing(classname){
            let yr = (9+Math.floor((((new Date()) - new Date("2018. 09. 01")) / 1000 / 60 / 60 / 24 / 365)));
            return classname.startsWith(yr) && classname.endsWith("B");
        },
        selectVersion(v){
            this.selectedVersion = v;
            this.versionSelectOpen = false
        },
        async openTable(tableInfo){
            
            if (loadingTable){
                return;
            }


            let version = this.selectedVersion;
            let id = tableInfo.id;
        
        
            let url = "/tables/"+id.toString().replace("*","star")+".json";
        
            if (version.current){
                url = "/api/current/"+tableInfo.class;
            }
        
            loadingTable = true;
            document.getElementById("loader").classList.remove("hidden");
            let json = await fetchJSON(url);
            this.currentTable = json;

            this.tableMode = true;
            loadingTable = false;

            document.getElementById("loader").classList.add("hidden");
            openThing();
            
        
            
            
        }
    }
});

(async ()=>{
    let versions = await fetchJSON("tables.json");
    vueData.versions = versions;
    let selectedVersion;
    
    for (let v of versions){
        if (v.current){
            selectedVersion = v;
        }
    }

    vueData.selectedVersion = selectedVersion;

    loadMainPage();
})();