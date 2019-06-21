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
        xhttp.send();
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

window.onpopstate = function(event) {
    console.log("pop",window.location);
    if (window.location.hash == ""){
        console.log("mainpage");
        loadMainPage();
    } else if (window.location.hash.indexOf("#class/") == 0){
        openTable(window.location.hash.replace("#class/","") );
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
    loadingTable = false;
    document.getElementById("loader").classList.add("hidden");
    window.location.hash = "class/"+id;
    console.log(json);
    
    document.getElementById("content").innerHTML = ``;

    let time = document.createElement("div");
    time.setAttribute("id","time");
    for (let i=0; i < 14; i++){
        let time_e = document.createElement("div");
        time_e.classList.add("time_e");
        time_e.innerHTML = `
            <a>${i}</a>
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
                let colors = {
                    "Inf.":"#0099ff",
                    "Körny.":"#00ff99",
                    "Csop1":"#0066cc",
                    "Csop2":"#ff5050",
                    "Közg.":"#ffcccc",
                    "Ügyv.":"#ccffcc"
                }
                class_elem.style.backgroundColor = colors[class_.group];
                class_elem.innerHTML = `
                <a class="className">${class_.subject}</a>
                <a class="classRoom">${formatClassRoom(class_.classroom)}</a>
                <a class="teacher">${shorten(class_.teacher)}</a>
                <a class="group">${(class_.group).replace("all","").replace("Angol ABC","A").replace("Német ABC","N")
                    .replace("ABC szöv","/")}</a>
                `;
                class_elem.classList.add("class");
                
                class_elem.style.width = `calc(${class_.width}% - var(--padding))`;
                class_elem.style.setProperty("--height",class_.classLength);
                class_elem.style.left = class_.x+"%";
                row.appendChild(class_elem);
            }
            
            
            
        }

        cont.appendChild(elem);

        //document.getElementById("actionbar").classList.add("show");
        scrollToPosition();
    }
    {
        let elem = document.createElement("div");
        elem.classList.add("day");
        cont.appendChild(elem);
    }
    
}
function loadMainPage(){
    //document.getElementById("actionbar").classList.remove("show");
    document.getElementById("content").innerHTML = "";
    for (let i=0; i < classes.length; i++){
        let elem = document.createElement("span");
        elem.classList.add("classSelector");
        elem.innerHTML = "<a>"+classes[i].display+"</a>";
        let id = classes[i].id;
        elem.onclick = function(){
            openTable(id);
        }
        document.getElementById("content").appendChild(elem);
    }
}
(async ()=>{
    classes = await fetchJSON("classes.json");
    loadMainPage();
})()