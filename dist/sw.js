if(!self.define){let e,n={};const i=(i,s)=>(i=new URL(i+".js",s).href,n[i]||new Promise((n=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=n,document.head.appendChild(e)}else e=i,importScripts(i),n()})).then((()=>{let e=n[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(s,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(n[o])return;let d={};const c=e=>i(e,o),t={module:{uri:o},exports:d,require:c};n[o]=Promise.all(s.map((e=>t[e]||c(e)))).then((e=>(r(...e),d)))}}define(["./workbox-b994f779"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/browser-2bNP-TVo.js",revision:null},{url:"assets/index-CjXpT5ms.js",revision:null},{url:"assets/index-DXXdpsud.css",revision:null},{url:"index.html",revision:"10b0c3e37080f0acf8a5d86987185d24"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"icons/android-launchericon-192-192.png",revision:"579b4c5564228df19f64f735c830ddd5"},{url:"icons/android-launchericon-48-48.png",revision:"bc8ba5f15d7e475ba94fc0f53b53b877"},{url:"icons/android-launchericon-512-512.png",revision:"99c11785ce397426fcdbe43eb9dfe672"},{url:"manifest.webmanifest",revision:"73bd30e4edd348daebb4f4235197338f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^\/.*\.(png|jpg|jpeg|svg)$/,new e.CacheFirst({cacheName:"images",plugins:[new e.ExpirationPlugin({maxEntries:10,maxAgeSeconds:604800})]}),"GET")}));
