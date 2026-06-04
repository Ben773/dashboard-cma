const http=require("http"),fs=require("fs"),path=require("path");
const dir=__dirname;
http.createServer((req,res)=>{
  let f=decodeURIComponent(req.url.split("?")[0]);
  if(f==="/"||f==="") f="/index.html";
  const p=path.join(dir,f);
  fs.readFile(p,(e,d)=>{
    if(e){res.writeHead(404);res.end("404");return;}
    const ext=path.extname(p);
    const ct=ext===".html"?"text/html":ext===".js"?"text/javascript":"text/plain";
    res.writeHead(200,{"Content-Type":ct+"; charset=utf-8"});
    res.end(d);
  });
}).listen(8777,()=>console.log("listening on 8777"));
