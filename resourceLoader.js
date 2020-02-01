const jsdom = require("jsdom");

const URL = require('url');

const fs = require("fs");

var crypto = require('crypto');

var hash = data => crypto.createHash('md5').update(data).digest('hex');

class CustomResourceLoader extends jsdom.ResourceLoader {
    fetch(url, options) {
      // Override the contents of this script to do something unusual.
      
      if (
          URL.parse(url).pathname.endsWith("css") ||
          URL.parse(url).pathname.endsWith("ga.js")
        ) {
        
        return Promise.resolve(Buffer.from(""));


      } else {
        //console.log(`Element '${options.element.localName}' is requesting the url ${url}`);


        let filename = "tmp/"+hash(url);

        if (fs.existsSync(filename)){
            //console.log("Serving file from cache");
            return Promise.resolve(fs.readFileSync(filename));
        } else {
            let result = super.fetch(url, options);

            result.then(function(d){
                fs.writeFileSync(filename,d);
            })
            

            return result;
        }


      }

      
    }
}
module.exports = {loader:CustomResourceLoader};