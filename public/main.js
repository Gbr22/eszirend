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
    /* if (document.getElementById("dayswrap") != undefined){
        let precent = document.getElementById("dayswrap").scrollLeft / document.getElementById("dayswrap").scrollWidth
        let pos = document.getElementById("daynames_wrap").scrollWidth * precent * -1;
        document.getElementById("daynames_wrap").style.transform = "translateX("+pos+"px)";
    } */

    if (vueData.isOnline != navigator.onLine){
        vueData.isOnline = navigator.onLine;
    }

    let selectedDay = getSelectedDay();
    if (selectedDay != null){
        vueData.selectedDay = selectedDay;
    }

    let e = document.getElementById("dayswrap");
    if (e != null){
        vueData.dayViewScroll = (e.scrollWidth/e.scrollLeft);
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
    tableTypes:{
        class:{
            name:"Osztályok",
            versions:[]
        },
        teacher:{
            name:"Tanárok",
            versions:[]
        }
    },
    tableType:"class",
    daynames,
    selectedDay:0,
    isOnline:navigator.onLine,
    tableMode:false,
    currentTable:null,
    versionSelectOpen:false,
    helpOpen:false,
    classView:null,
    classViewOpen:false,
    versions:[],
    dayViewScroll:0,
    selectedVersion: {
        text:"",
        tables:[]
    },
    days:[
        {
            short:"H",
            full:"Hétfő"
        },
        {
            short:"K",
            full:"Kedd"
        },
        {
            short:"Sz",
            full:"Szerda"
        },
        {
            short:"Cs",
            full:"Csütörtök"
        },
        {
            short:"P",
            full:"Péntek"
        }
    ]
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

function timeAgo(date){
    const intervals = [
        { label: 'éve', seconds: 31536000 },
        { label: 'hónapja', seconds: 2592000 },
        { label: 'napja', seconds: 86400 },
        { label: 'órája', seconds: 3600 },
        { label: 'perce', seconds: 60 },
        { label: 'másodperce', seconds: 0 }
    ];
      
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const interval = intervals.find(i => i.seconds < seconds);
    const count = Math.floor(seconds / interval.seconds);
    return `${count} ${interval.label}`;
}

function changeToDay(day,instant){
    let e = document.getElementById("dayswrap");
    let options = {left:e.scrollWidth/5*day};
    if (!instant){
        options.behavior='smooth';
    }
    e.scrollTo(options);
}
function getSelectedDay(){
    let e = document.getElementById("dayswrap");
    if (e != null){
        return Math.round(e.scrollLeft/(e.scrollWidth/5));
    }
    return null;
}
function getSelectedFor(tableType){
    

    
    let type = vueData.tableTypes[tableType];
    let versions = type.versions;

    function getCurrent(){
        for (let v of versions){
            if (v.current){
                return v;
            }
        }
    }

    if (!vueData.selectedVersion){
        return getCurrent();
    }

    let id = vueData.selectedVersion.id;
    for (let v of versions){
        if (v.id == id){
            return v;
        }
    }
    return getCurrent();
}

function changeTableMode(selectType){
    vueData.tableType = selectType;
    let versions = vueData.tableTypes[selectType].versions;
    vueData.versions = versions;

    vueData.selectedVersion = getSelectedFor(selectType);
}
var app = new Vue({
    el: '#app',
    data: vueData,
    mounted(){
        loop();
    },
    methods:{
        timeAgo,
        changeToDay,
        isSelectedDay(index){
            return index == this.selectedDay;
        },
        getSelectedFor,
        changeTableMode,
        openClass(class_,yIndex){
            console.log(class_,yIndex);

            let classStartI = yIndex;
            let classEndI = yIndex;

            if (class_.classLength > 1){
                classEndI += class_.classLength-1;
            }

            let classStart = this.currentTable.hourLabels[classStartI];
            let classEnd = this.currentTable.hourLabels[classEndI];

            let hour = classStart.hour; //Hour display string
            if (class_.classLength > 1){
                hour+="-"+classEnd.hour;
            }

            hour+=". óra";
            
            let startTime = classStart.label.split("-")[0].trim();
            let endTime = classEnd.label.split("-")[1].trim();

            vueData.classView = {
                class:class_,
                hour,
                start:startTime,
                end:endTime,
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
        timeSince(){
            let units = [
                {
                    divide:60
                }
            ]
        },
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
            if (classname == undefined){
                return false;
            }
            let yr = (9+Math.floor((((new Date()) - new Date("2018. 09. 01")) / 1000 / 60 / 60 / 24 / 365)));
            return classname.startsWith(yr) && classname.endsWith("B");
        },
        selectVersion(v){
            this.selectedVersion = v;
            this.versionSelectOpen = false
        },
        async openTable(tableInfo,mode){

            if (mode == undefined){
                mode = this.tableType;
            }
            
            console.log("opening..");

            if (loadingTable){
                return;
            }


            let version = this.selectedVersion;
            let id = tableInfo.id;
        
            
        
            let url = `/api/table/${mode}/${id}`;
        
            if (version.current){
                url = `/api/current/${mode}/${tableInfo.display}`;
            }
        
            loadingTable = true;
            document.getElementById("loader").classList.remove("hidden");
            let json = await fetchJSON(url);
            json.tableType = mode;
            this.currentTable = json;

            let today = (new Date()).getDay()-1;

            this.tableMode = true;

            Vue.nextTick(function(){
                changeToDay(vueData.selectedDay || today,true);
            });
            document.documentElement.scrollTop = 0;
            loadingTable = false;

            document.getElementById("loader").classList.add("hidden");
            openThing();
            
        
            
            
        }
    }
});


(async ()=>{
    Promise.all([fetchJSON("tables.json"),fetchJSON("teachers.json")]).then(function(values){
        vueData.tableTypes.class.versions = values[0];
        vueData.tableTypes.teacher.versions = values[1];
        {
            let versions = vueData.tableTypes.teacher.versions;
            for (let v of versions){
                v.tables.sort(function(a,b){
                    return a.display.localeCompare(b.display);
                })
            }
        }

        changeTableMode("class");

        loadMainPage();
    })

    
})();