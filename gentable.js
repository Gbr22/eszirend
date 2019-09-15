
const fs = require("fs");

module.exports = function(svg,dom){
    let lines = svg.querySelectorAll("line");
    let props = {}
    let texts = svg.querySelectorAll("text");
    let class_text = null;
    let table_date = null;
    for (let i=0; i < texts.length; i++){
        if (class_text == null ||
        parseFloat(texts[i].getAttribute("font-size")) > parseFloat(class_text.getAttribute("font-size")))
        {
            class_text = texts[i];
        }
        
        if (texts[i].innerHTML.indexOf("Órarend") != -1 && table_date == null){
            table_date = texts[i];
        }
    }
    props.header = table_date.innerHTML;
    props.class = class_text.innerHTML;
    let timetable = []
    for (let i=0; i < 5; i++){
        let arr = [];
        for (let j=0; j < 15; j++){
            arr.push([]);
        }
        timetable.push(arr);
    }
    props.width = 0;
    props.width = parseFloat(lines[1].getAttribute("x1")) - parseFloat(lines[0].getAttribute("x1"));
    props.startX = parseFloat(lines[0].getAttribute("x1"))-props.width;
    
    let leftline = lines[0];
    let leftlines = [];
    for (let i=0; i < lines.length; i++){
        if (parseFloat(lines[i].getAttribute("x1")) < parseFloat(leftline.getAttribute("x1"))){
            leftline = lines[i];
        }
    }
    for (let i=0; i < lines.length; i++){
        if (lines[i].getAttribute("x1") == leftline.getAttribute("x1")){
            leftlines.push(lines[i]);
        }
    }
    props.height = parseFloat(leftlines[1].getAttribute("y1")) - parseFloat(leftlines[0].getAttribute("y1"));
    props.startY = parseFloat(lines[0].getAttribute("y1"))-props.height;

    let classes = svg.querySelectorAll("rect");
    for (let i=0; i < classes.length; i++){
        let e = classes[i];
        let x = (parseFloat(e.getAttribute("x"))-props.startX )/props.width;
        x = Math.floor(x);
        let y = (parseFloat(e.getAttribute("y"))-props.startY )/props.height;
        y = Math.floor(y);
        
        let text = e.querySelector("title").innerHTML.split("\n");
        thisclass = {
            subject:text[0],
            classroom:text[text.length-1],
            teacher:text[text.length-2],
            group:"all",
            x: ((parseFloat(e.getAttribute("x"))-props.startX - x*props.width)/props.width*100),
            width:parseFloat(e.getAttribute("width"))/props.width*100,
            classLength:Math.floor(parseFloat(e.getAttribute("height"))/props.height)
        }
        if (text.length > 3){
            thisclass.group = text[text.length-3];
        }
        if (text.length)
        timetable[x][y-2].push(thisclass);
    }
    
    props.timetable = timetable;
    
    console.log("done",props.class);
    return props;
}