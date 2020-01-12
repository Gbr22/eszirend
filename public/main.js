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
let daynames = ["Hétfő","Kedd","Szerda","Csütörtök","Péntek"]
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
var wasOnline = navigator.onLine;

let loop = function(){
    if (document.getElementById("dayswrap") != undefined){
        let precent = document.getElementById("dayswrap").scrollLeft / document.getElementById("dayswrap").scrollWidth
        let pos = document.getElementById("daynames_wrap").scrollWidth * precent * -1;
        document.getElementById("daynames_wrap").style.transform = "translateX("+pos+"px)";
    }

    if (wasOnline != navigator.onLine){
        if (navigator.onLine){
            document.getElementById("offline").setAttribute("class","");
        } else {
            document.getElementById("offline").setAttribute("class","show");
        }

        wasOnline = navigator.onLine;
    }

    requestAnimationFrame(loop);
}

loop();


window.onpopstate = function(event) {
    console.log("pop",window.location);
    if (window.location.hash == ""){
        console.log("mainpage");
        loadMainPage();
    } else if (window.location.hash.indexOf("#class/") == 0){
        openTable(window.location.hash.replace("#class/","") );
    }
    closeClassView();
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
    if (row.length >= 3 ){
        let smallList = ["Angol nyelv","Német nyelv","Magyar nyelv szövegértés"];
        let contains = false;
        for (let i=0; i < smallList.length; i++){
            if ( row[0].subject == smallList[i] ){
                contains = true;
            }
        }
        return contains;

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
document.getElementById("classViewCover").onclick = function(){
    closeClassView();
}
function closeClassView(){
    document.getElementById("classViewer").classList.remove("show");
    document.getElementById("classViewCover").classList.remove("show");
}
async function openTable(id){


    if (loadingTable){
        return;
    }

    for (let i=0; i < classes.length; i++){
        if (classes[i].id == id){
            className = classes[i].display;
        }
    }
    let url = "tables/"+id.toString().replace("*","star")+".json";
    loadingTable = true;
    document.getElementById("loader").classList.remove("hidden");
    let json = await fetchJSON(url);
    let display = json.class;
    loadingTable = false;
    document.getElementById("loader").classList.add("hidden");
    window.location.hash = "class/"+id;
    console.log(json);

    
    document.getElementById("info_class_name").innerHTML = json.class;
    document.getElementById("info_header").innerHTML = json.header;
    document.getElementById("tableinfo").classList.add("show");
    
    document.getElementById("content").innerHTML = ``;

    let time = document.createElement("div");
    time.setAttribute("id","time");
    for (let i=0; i < 13; i++){
        let time_e = document.createElement("div");
        time_e.classList.add("time_e");
        time_e.innerHTML = `
            <a>${i+1}</a>
        `;
        time.appendChild(time_e);
    }
    document.getElementById("content").appendChild(time);

    let window_ = document.createElement("div");
    window_.setAttribute("id","window");
    
    let dayswrap = document.createElement("div");
    dayswrap.setAttribute("id","dayswrap");
    
    window_.appendChild(dayswrap);
    document.getElementById("content").appendChild(window_);
    
    let cont = dayswrap; //container
    
    
    for (let i=0; i < json.timetable.length; i++){
        let t = json.timetable[i]; // t(his) day
        let elem = document.createElement("div");
        elem.classList.add("day");
        elem.setAttribute("id","day"+i);
        elem.innerHTML = `
            
            <a class="dayname">${daynames[i]}</a>
            
        `;
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
        for (let j =0; j < t.length; j++){
            //t[j] : row in day
            //type: Array
            
            let row = document.createElement("div");
            row.classList.add("row");
            elem.appendChild(row);
            let toosmall = false;
            
            
            
            if (isBigRow(t[j])){
                
                toosmall = true;

                
                let rowheight = getBiggestClassHeight(t[j]);
                
                

                row.classList.add("toosmall");
                let row_inner = document.createElement("span");
                row_inner.classList.add("row_inner");
                row_inner.style.setProperty("--height",rowheight);
                row.appendChild(row_inner);

                let row_inner_content = document.createElement("span");
                row_inner_content.classList.add("row_inner_content");
                row_inner.appendChild(row_inner_content);

                row = row_inner_content;
            }
            
            for (let k=0; k < t[j].length; k++){
                let class_ = t[j][k];
                let class_elem = document.createElement("span");
                if (toosmall){
                    class_elem.classList.add("toosmall");
                }
                function shorten(name){
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
                
                
                function formatGroup(g){
                    let shorts = {
                        "Angol":"Ang",
                        "Német":"Ném",
                        "Környezetvédelem":"♻️",
                        "Informatika":"🖱️",
                        "Ügyvitel":"Ügyv",
                        "Közgazdaság":"Közg",
                        "Csoport":"Csop"
                    }
                    console.log("display",display);
                    let out = (g).replace("all","")
                    .replace(display,"");
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
                function getColor(group){
                    let color = null;
                    let aliases = {
                        "Informatika":"inf",
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
                        "ügyv":"#ccffcc"
                    }
                    for (p in aliases){
                        if (group.indexOf(p) != -1 || group.indexOf(p.toLowerCase()) != -1){
                            return colors[aliases[p]];
                        }
                    }
                }
                if (getColor(class_.group)){
                    class_elem.style.backgroundColor = getColor(class_.group);
                }
                
                class_elem.innerHTML = `
                <a class="className">${class_.subject}</a>
                <a class="classRoom">${formatClassRoom(class_.classroom)}</a>
                <a class="teacher">${shorten(class_.teacher)}</a>
                <a class="group">${formatGroup(class_.group)}</a>
                `;
                class_elem.classList.add("class");
                
                class_elem.style.width = `calc(${class_.width}% - var(--padding))`;
                class_elem.style.setProperty("--height",class_.classLength);
                class_elem.style.left = class_.x+"%";

                class_elem.onclick = function(){
                    console.log(class_);
                    document.getElementById("class_subject").innerHTML = class_.subject;
                    document.getElementById("class_classroom").innerHTML = formatClassRoom(class_.classroom);
                    document.getElementById("class_group").innerHTML = class_.group;
                    let classStart = j+1;
                    let classEnd = j+1;
                    let hour = classStart; //Hour display string
                    
                    if (class_.classLength > 1){
                        classEnd += class_.classLength-1;
                        hour += "-"+classEnd;
                    }

                    hour+=". óra";
                    document.getElementById("class_teacher").innerHTML = class_.teacher;
                    document.getElementById("class_hour").innerHTML = hour;
                    document.getElementById("class_time").innerHTML = getHourInfo(classStart).start + " - " + getHourInfo(classEnd).end;
                    if (getColor(class_.group)){
                        document.getElementById("classViewer").style.backgroundColor = getColor(class_.group);
                    } else {
                        document.getElementById("classViewer").style.backgroundColor = "#e4e4e4";
                    }
                    
                    document.getElementById("classViewer").classList.add("show");
                    document.getElementById("classViewCover").classList.add("show");
                }

                row.appendChild(class_elem);
            }
            
            
            
        }

        cont.appendChild(elem);

        document.getElementById("actionbar").classList.add("show");
        scrollToPosition();
    }
    
}
function loadMainPage(){
    document.getElementById("actionbar").classList.remove("show");
    document.getElementById("tableinfo").classList.remove("show");
    
    document.getElementById("content").innerHTML = "";
    for (let i=0; i < classes.length; i++){
        let elem = document.createElement("span");
        elem.classList.add("classSelector");
        elem.setAttribute("data-id",classes[i].id);
        elem.innerHTML = "<a>"+classes[i].display+"</a>";
        let id = classes[i].id;
        elem.onclick = function(){
            openTable(id,classes[i].display);
        }
        document.getElementById("content").appendChild(elem);
    }
}
(async ()=>{
    classes = await fetchJSON("classes.json");
    loadMainPage();
})()


function toggleHelp(){
    document.getElementById("help_win").classList.toggle("hidden");
}