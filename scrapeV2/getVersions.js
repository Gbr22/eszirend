let getInfo = require("./scrape");

module.exports = async function(){
    let info = (await getInfo()).viewer;
    
    let options = info.ttviewer_options;
    let menu = options.version_menu;

    let versions = [];

    menu = menu.flat();

    function changeFormat(obj,menuText){
        return {
            text: obj.text,
            current: obj.checked,
            info: obj.info,
            id: obj.onclick.obj,
            menuText:menuText
        }
    }

    for (let i=0; i < menu.length; i++){
        let item = menu[i];
        let isMenu = item.submenu ? true : false;

        if (!isMenu){
            versions.push(changeFormat(item));
        } else {
            for (let mItem of item.submenu.itemdata){
                versions.push(changeFormat(mItem, item.text));
            }
        }
    }

    return versions;
}