const cache_name = "cache-v1";

let cached_urls = [
    '/',
    '/?source=pwa&utm_source=pwa',
    '/main.css',
    '/main.js',
    '/icon.png',
    '/logo.png',
    "/tables.json"
]

function preCache(){
    return new Promise(function(resolve,reject){
        fetch('/tables.json').then(async function(response) {
            let json = await response.json();
            console.log("json",json);
            for (let i=0; i < json.length; i++){
                let id = json[i].id.toString();
                console.log(id);
                cached_urls.push("/tables/"+id+".json");
            }
            let cache = await caches.open(cache_name);
            let finished = 0;
            for (let i=0; i < cached_urls.length; i++){
                try {
                    let resp = await fetch(cached_urls[i]);
                    await cache.put(cached_urls[i],resp);
                } catch(err){
                    console.warn("Error caching "+cached_urls[i],err);
                    continue;
                }
                
            }
            resolve();
        })
        
    })
}

self.addEventListener('install', function(e) {
    
    e.waitUntil(preCache());
});

function fetchResource(req){
    return new Promise(function(resolve,reject){
        let timeout = setTimeout(function(){
            reject("Timed out");
        },400);
        fetch(req).then(function(response) {
            return caches.open(cache_name).then(function(cache) {
              cache.put(req, response.clone());
              resolve(response);
              clearTimeout(timeout);
            });  
        });
        
    })
}
self.addEventListener('fetch', function(event) {
    console.log("fetch",event.request.url);
   
    event.respondWith( fetchResource(event.request).catch(()=>{
        return caches.match(event.request);
    })
        
    );
});