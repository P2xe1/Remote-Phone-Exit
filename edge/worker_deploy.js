// ==========================================
// 1. 系统核心常量与安全配置
// ==========================================
// 页面构建号: 每次部署变化。前端发现自己的版本与它对不上就自动重载,
// 避免"我改了但你的浏览器还跑着旧代码"这种情况。
const BUILD_ID = 'b20261004-193956';
// 【2026-10-04 T8.8】Chart.js 源码由 cf_deploy.py 部署时注入(JSON 转义, 安全)。
// 未注入时为 null, /chart.js 返回 404, 前端回退 CDN。
const CHART_JS_SOURCE = "/**\n * Skipped minification because the original files appears to be already minified.\n * Original file: /npm/chart.js@4.4.1/dist/chart.umd.js\n *\n * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files\n */\n/*!\n * Chart.js v4.4.1\n * https://www.chartjs.org\n * (c) 2023 Chart.js Contributors\n * Released under the MIT License\n */\n!function(t,e){\"object\"==typeof exports&&\"undefined\"!=typeof module?module.exports=e():\"function\"==typeof define&&define.amd?define(e):(t=\"undefined\"!=typeof globalThis?globalThis:t||self).Chart=e()}(this,(function(){\"use strict\";var t=Object.freeze({__proto__:null,get Colors(){return Go},get Decimation(){return Qo},get Filler(){return ma},get Legend(){return ya},get SubTitle(){return ka},get Title(){return Ma},get Tooltip(){return Ba}});function e(){}const i=(()=>{let t=0;return()=>t++})();function s(t){return null==t}function n(t){if(Array.isArray&&Array.isArray(t))return!0;const e=Object.prototype.toString.call(t);return\"[object\"===e.slice(0,7)&&\"Array]\"===e.slice(-6)}function o(t){return null!==t&&\"[object Object]\"===Object.prototype.toString.call(t)}function a(t){return(\"number\"==typeof t||t instanceof Number)&&isFinite(+t)}function r(t,e){return a(t)?t:e}function l(t,e){return void 0===t?e:t}const h=(t,e)=>\"string\"==typeof t&&t.endsWith(\"%\")?parseFloat(t)/100:+t/e,c=(t,e)=>\"string\"==typeof t&&t.endsWith(\"%\")?parseFloat(t)/100*e:+t;function d(t,e,i){if(t&&\"function\"==typeof t.call)return t.apply(i,e)}function u(t,e,i,s){let a,r,l;if(n(t))if(r=t.length,s)for(a=r-1;a>=0;a--)e.call(i,t[a],a);else for(a=0;a<r;a++)e.call(i,t[a],a);else if(o(t))for(l=Object.keys(t),r=l.length,a=0;a<r;a++)e.call(i,t[l[a]],l[a])}function f(t,e){let i,s,n,o;if(!t||!e||t.length!==e.length)return!1;for(i=0,s=t.length;i<s;++i)if(n=t[i],o=e[i],n.datasetIndex!==o.datasetIndex||n.index!==o.index)return!1;return!0}function g(t){if(n(t))return t.map(g);if(o(t)){const e=Object.create(null),i=Object.keys(t),s=i.length;let n=0;for(;n<s;++n)e[i[n]]=g(t[i[n]]);return e}return t}function p(t){return-1===[\"__proto__\",\"prototype\",\"constructor\"].indexOf(t)}function m(t,e,i,s){if(!p(t))return;const n=e[t],a=i[t];o(n)&&o(a)?b(n,a,s):e[t]=g(a)}function b(t,e,i){const s=n(e)?e:[e],a=s.length;if(!o(t))return t;const r=(i=i||{}).merger||m;let l;for(let e=0;e<a;++e){if(l=s[e],!o(l))continue;const n=Object.keys(l);for(let e=0,s=n.length;e<s;++e)r(n[e],t,l,i)}return t}function x(t,e){return b(t,e,{merger:_})}function _(t,e,i){if(!p(t))return;const s=e[t],n=i[t];o(s)&&o(n)?x(s,n):Object.prototype.hasOwnProperty.call(e,t)||(e[t]=g(n))}const y={\"\":t=>t,x:t=>t.x,y:t=>t.y};function v(t){const e=t.split(\".\"),i=[];let s=\"\";for(const t of e)s+=t,s.endsWith(\"\\\\\")?s=s.slice(0,-1)+\".\":(i.push(s),s=\"\");return i}function M(t,e){const i=y[e]||(y[e]=function(t){const e=v(t);return t=>{for(const i of e){if(\"\"===i)break;t=t&&t[i]}return t}}(e));return i(t)}function w(t){return t.charAt(0).toUpperCase()+t.slice(1)}const k=t=>void 0!==t,S=t=>\"function\"==typeof t,P=(t,e)=>{if(t.size!==e.size)return!1;for(const i of t)if(!e.has(i))return!1;return!0};function D(t){return\"mouseup\"===t.type||\"click\"===t.type||\"contextmenu\"===t.type}const C=Math.PI,O=2*C,A=O+C,T=Number.POSITIVE_INFINITY,L=C/180,E=C/2,R=C/4,I=2*C/3,z=Math.log10,F=Math.sign;function V(t,e,i){return Math.abs(t-e)<i}function B(t){const e=Math.round(t);t=V(t,e,t/1e3)?e:t;const i=Math.pow(10,Math.floor(z(t))),s=t/i;return(s<=1?1:s<=2?2:s<=5?5:10)*i}function W(t){const e=[],i=Math.sqrt(t);let s;for(s=1;s<i;s++)t%s==0&&(e.push(s),e.push(t/s));return i===(0|i)&&e.push(i),e.sort(((t,e)=>t-e)).pop(),e}function N(t){return!isNaN(parseFloat(t))&&isFinite(t)}function H(t,e){const i=Math.round(t);return i-e<=t&&i+e>=t}function j(t,e,i){let s,n,o;for(s=0,n=t.length;s<n;s++)o=t[s][i],isNaN(o)||(e.min=Math.min(e.min,o),e.max=Math.max(e.max,o))}function $(t){return t*(C/180)}function Y(t){return t*(180/C)}function U(t){if(!a(t))return;let e=1,i=0;for(;Math.round(t*e)/e!==t;)e*=10,i++;return i}function X(t,e){const i=e.x-t.x,s=e.y-t.y,n=Math.sqrt(i*i+s*s);let o=Math.atan2(s,i);return o<-.5*C&&(o+=O),{angle:o,distance:n}}function q(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}function K(t,e){return(t-e+A)%O-C}function G(t){return(t%O+O)%O}function Z(t,e,i,s){const n=G(t),o=G(e),a=G(i),r=G(o-n),l=G(a-n),h=G(n-o),c=G(n-a);return n===o||n===a||s&&o===a||r>l&&h<c}function J(t,e,i){return Math.max(e,Math.min(i,t))}function Q(t){return J(t,-32768,32767)}function tt(t,e,i,s=1e-6){return t>=Math.min(e,i)-s&&t<=Math.max(e,i)+s}function et(t,e,i){i=i||(i=>t[i]<e);let s,n=t.length-1,o=0;for(;n-o>1;)s=o+n>>1,i(s)?o=s:n=s;return{lo:o,hi:n}}const it=(t,e,i,s)=>et(t,i,s?s=>{const n=t[s][e];return n<i||n===i&&t[s+1][e]===i}:s=>t[s][e]<i),st=(t,e,i)=>et(t,i,(s=>t[s][e]>=i));function nt(t,e,i){let s=0,n=t.length;for(;s<n&&t[s]<e;)s++;for(;n>s&&t[n-1]>i;)n--;return s>0||n<t.length?t.slice(s,n):t}const ot=[\"push\",\"pop\",\"shift\",\"splice\",\"unshift\"];function at(t,e){t._chartjs?t._chartjs.listeners.push(e):(Object.defineProperty(t,\"_chartjs\",{configurable:!0,enumerable:!1,value:{listeners:[e]}}),ot.forEach((e=>{const i=\"_onData\"+w(e),s=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value(...e){const n=s.apply(this,e);return t._chartjs.listeners.forEach((t=>{\"function\"==typeof t[i]&&t[i](...e)})),n}})})))}function rt(t,e){const i=t._chartjs;if(!i)return;const s=i.listeners,n=s.indexOf(e);-1!==n&&s.splice(n,1),s.length>0||(ot.forEach((e=>{delete t[e]})),delete t._chartjs)}function lt(t){const e=new Set(t);return e.size===t.length?t:Array.from(e)}const ht=\"undefined\"==typeof window?function(t){return t()}:window.requestAnimationFrame;function ct(t,e){let i=[],s=!1;return function(...n){i=n,s||(s=!0,ht.call(window,(()=>{s=!1,t.apply(e,i)})))}}function dt(t,e){let i;return function(...s){return e?(clearTimeout(i),i=setTimeout(t,e,s)):t.apply(this,s),e}}const ut=t=>\"start\"===t?\"left\":\"end\"===t?\"right\":\"center\",ft=(t,e,i)=>\"start\"===t?e:\"end\"===t?i:(e+i)/2,gt=(t,e,i,s)=>t===(s?\"left\":\"right\")?i:\"center\"===t?(e+i)/2:e;function pt(t,e,i){const s=e.length;let n=0,o=s;if(t._sorted){const{iScale:a,_parsed:r}=t,l=a.axis,{min:h,max:c,minDefined:d,maxDefined:u}=a.getUserBounds();d&&(n=J(Math.min(it(r,l,h).lo,i?s:it(e,l,a.getPixelForValue(h)).lo),0,s-1)),o=u?J(Math.max(it(r,a.axis,c,!0).hi+1,i?0:it(e,l,a.getPixelForValue(c),!0).hi+1),n,s)-n:s-n}return{start:n,count:o}}function mt(t){const{xScale:e,yScale:i,_scaleRanges:s}=t,n={xmin:e.min,xmax:e.max,ymin:i.min,ymax:i.max};if(!s)return t._scaleRanges=n,!0;const o=s.xmin!==e.min||s.xmax!==e.max||s.ymin!==i.min||s.ymax!==i.max;return Object.assign(s,n),o}class bt{constructor(){this._request=null,this._charts=new Map,this._running=!1,this._lastDate=void 0}_notify(t,e,i,s){const n=e.listeners[s],o=e.duration;n.forEach((s=>s({chart:t,initial:e.initial,numSteps:o,currentStep:Math.min(i-e.start,o)})))}_refresh(){this._request||(this._running=!0,this._request=ht.call(window,(()=>{this._update(),this._request=null,this._running&&this._refresh()})))}_update(t=Date.now()){let e=0;this._charts.forEach(((i,s)=>{if(!i.running||!i.items.length)return;const n=i.items;let o,a=n.length-1,r=!1;for(;a>=0;--a)o=n[a],o._active?(o._total>i.duration&&(i.duration=o._total),o.tick(t),r=!0):(n[a]=n[n.length-1],n.pop());r&&(s.draw(),this._notify(s,i,t,\"progress\")),n.length||(i.running=!1,this._notify(s,i,t,\"complete\"),i.initial=!1),e+=n.length})),this._lastDate=t,0===e&&(this._running=!1)}_getAnims(t){const e=this._charts;let i=e.get(t);return i||(i={running:!1,initial:!0,items:[],listeners:{complete:[],progress:[]}},e.set(t,i)),i}listen(t,e,i){this._getAnims(t).listeners[e].push(i)}add(t,e){e&&e.length&&this._getAnims(t).items.push(...e)}has(t){return this._getAnims(t).items.length>0}start(t){const e=this._charts.get(t);e&&(e.running=!0,e.start=Date.now(),e.duration=e.items.reduce(((t,e)=>Math.max(t,e._duration)),0),this._refresh())}running(t){if(!this._running)return!1;const e=this._charts.get(t);return!!(e&&e.running&&e.items.length)}stop(t){const e=this._charts.get(t);if(!e||!e.items.length)return;const i=e.items;let s=i.length-1;for(;s>=0;--s)i[s].cancel();e.items=[],this._notify(t,e,Date.now(),\"complete\")}remove(t){return this._charts.delete(t)}}var xt=new bt;\n/*!\n * @kurkle/color v0.3.2\n * https://github.com/kurkle/color#readme\n * (c) 2023 Jukka Kurkela\n * Released under the MIT License\n */function _t(t){return t+.5|0}const yt=(t,e,i)=>Math.max(Math.min(t,i),e);function vt(t){return yt(_t(2.55*t),0,255)}function Mt(t){return yt(_t(255*t),0,255)}function wt(t){return yt(_t(t/2.55)/100,0,1)}function kt(t){return yt(_t(100*t),0,100)}const St={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15,a:10,b:11,c:12,d:13,e:14,f:15},Pt=[...\"0123456789ABCDEF\"],Dt=t=>Pt[15&t],Ct=t=>Pt[(240&t)>>4]+Pt[15&t],Ot=t=>(240&t)>>4==(15&t);function At(t){var e=(t=>Ot(t.r)&&Ot(t.g)&&Ot(t.b)&&Ot(t.a))(t)?Dt:Ct;return t?\"#\"+e(t.r)+e(t.g)+e(t.b)+((t,e)=>t<255?e(t):\"\")(t.a,e):void 0}const Tt=/^(hsla?|hwb|hsv)\\(\\s*([-+.e\\d]+)(?:deg)?[\\s,]+([-+.e\\d]+)%[\\s,]+([-+.e\\d]+)%(?:[\\s,]+([-+.e\\d]+)(%)?)?\\s*\\)$/;function Lt(t,e,i){const s=e*Math.min(i,1-i),n=(e,n=(e+t/30)%12)=>i-s*Math.max(Math.min(n-3,9-n,1),-1);return[n(0),n(8),n(4)]}function Et(t,e,i){const s=(s,n=(s+t/60)%6)=>i-i*e*Math.max(Math.min(n,4-n,1),0);return[s(5),s(3),s(1)]}function Rt(t,e,i){const s=Lt(t,1,.5);let n;for(e+i>1&&(n=1/(e+i),e*=n,i*=n),n=0;n<3;n++)s[n]*=1-e-i,s[n]+=e;return s}function It(t){const e=t.r/255,i=t.g/255,s=t.b/255,n=Math.max(e,i,s),o=Math.min(e,i,s),a=(n+o)/2;let r,l,h;return n!==o&&(h=n-o,l=a>.5?h/(2-n-o):h/(n+o),r=function(t,e,i,s,n){return t===n?(e-i)/s+(e<i?6:0):e===n?(i-t)/s+2:(t-e)/s+4}(e,i,s,h,n),r=60*r+.5),[0|r,l||0,a]}function zt(t,e,i,s){return(Array.isArray(e)?t(e[0],e[1],e[2]):t(e,i,s)).map(Mt)}function Ft(t,e,i){return zt(Lt,t,e,i)}function Vt(t){return(t%360+360)%360}function Bt(t){const e=Tt.exec(t);let i,s=255;if(!e)return;e[5]!==i&&(s=e[6]?vt(+e[5]):Mt(+e[5]));const n=Vt(+e[2]),o=+e[3]/100,a=+e[4]/100;return i=\"hwb\"===e[1]?function(t,e,i){return zt(Rt,t,e,i)}(n,o,a):\"hsv\"===e[1]?function(t,e,i){return zt(Et,t,e,i)}(n,o,a):Ft(n,o,a),{r:i[0],g:i[1],b:i[2],a:s}}const Wt={x:\"dark\",Z:\"light\",Y:\"re\",X:\"blu\",W:\"gr\",V:\"medium\",U:\"slate\",A:\"ee\",T:\"ol\",S:\"or\",B:\"ra\",C:\"lateg\",D:\"ights\",R:\"in\",Q:\"turquois\",E:\"hi\",P:\"ro\",O:\"al\",N:\"le\",M:\"de\",L:\"yello\",F:\"en\",K:\"ch\",G:\"arks\",H:\"ea\",I:\"ightg\",J:\"wh\"},Nt={OiceXe:\"f0f8ff\",antiquewEte:\"faebd7\",aqua:\"ffff\",aquamarRe:\"7fffd4\",azuY:\"f0ffff\",beige:\"f5f5dc\",bisque:\"ffe4c4\",black:\"0\",blanKedOmond:\"ffebcd\",Xe:\"ff\",XeviTet:\"8a2be2\",bPwn:\"a52a2a\",burlywood:\"deb887\",caMtXe:\"5f9ea0\",KartYuse:\"7fff00\",KocTate:\"d2691e\",cSO:\"ff7f50\",cSnflowerXe:\"6495ed\",cSnsilk:\"fff8dc\",crimson:\"dc143c\",cyan:\"ffff\",xXe:\"8b\",xcyan:\"8b8b\",xgTMnPd:\"b8860b\",xWay:\"a9a9a9\",xgYF:\"6400\",xgYy:\"a9a9a9\",xkhaki:\"bdb76b\",xmagFta:\"8b008b\",xTivegYF:\"556b2f\",xSange:\"ff8c00\",xScEd:\"9932cc\",xYd:\"8b0000\",xsOmon:\"e9967a\",xsHgYF:\"8fbc8f\",xUXe:\"483d8b\",xUWay:\"2f4f4f\",xUgYy:\"2f4f4f\",xQe:\"ced1\",xviTet:\"9400d3\",dAppRk:\"ff1493\",dApskyXe:\"bfff\",dimWay:\"696969\",dimgYy:\"696969\",dodgerXe:\"1e90ff\",fiYbrick:\"b22222\",flSOwEte:\"fffaf0\",foYstWAn:\"228b22\",fuKsia:\"ff00ff\",gaRsbSo:\"dcdcdc\",ghostwEte:\"f8f8ff\",gTd:\"ffd700\",gTMnPd:\"daa520\",Way:\"808080\",gYF:\"8000\",gYFLw:\"adff2f\",gYy:\"808080\",honeyMw:\"f0fff0\",hotpRk:\"ff69b4\",RdianYd:\"cd5c5c\",Rdigo:\"4b0082\",ivSy:\"fffff0\",khaki:\"f0e68c\",lavFMr:\"e6e6fa\",lavFMrXsh:\"fff0f5\",lawngYF:\"7cfc00\",NmoncEffon:\"fffacd\",ZXe:\"add8e6\",ZcSO:\"f08080\",Zcyan:\"e0ffff\",ZgTMnPdLw:\"fafad2\",ZWay:\"d3d3d3\",ZgYF:\"90ee90\",ZgYy:\"d3d3d3\",ZpRk:\"ffb6c1\",ZsOmon:\"ffa07a\",ZsHgYF:\"20b2aa\",ZskyXe:\"87cefa\",ZUWay:\"778899\",ZUgYy:\"778899\",ZstAlXe:\"b0c4de\",ZLw:\"ffffe0\",lime:\"ff00\",limegYF:\"32cd32\",lRF:\"faf0e6\",magFta:\"ff00ff\",maPon:\"800000\",VaquamarRe:\"66cdaa\",VXe:\"cd\",VScEd:\"ba55d3\",VpurpN:\"9370db\",VsHgYF:\"3cb371\",VUXe:\"7b68ee\",VsprRggYF:\"fa9a\",VQe:\"48d1cc\",VviTetYd:\"c71585\",midnightXe:\"191970\",mRtcYam:\"f5fffa\",mistyPse:\"ffe4e1\",moccasR:\"ffe4b5\",navajowEte:\"ffdead\",navy:\"80\",Tdlace:\"fdf5e6\",Tive:\"808000\",TivedBb:\"6b8e23\",Sange:\"ffa500\",SangeYd:\"ff4500\",ScEd:\"da70d6\",pOegTMnPd:\"eee8aa\",pOegYF:\"98fb98\",pOeQe:\"afeeee\",pOeviTetYd:\"db7093\",papayawEp:\"ffefd5\",pHKpuff:\"ffdab9\",peru:\"cd853f\",pRk:\"ffc0cb\",plum:\"dda0dd\",powMrXe:\"b0e0e6\",purpN:\"800080\",YbeccapurpN:\"663399\",Yd:\"ff0000\",Psybrown:\"bc8f8f\",PyOXe:\"4169e1\",saddNbPwn:\"8b4513\",sOmon:\"fa8072\",sandybPwn:\"f4a460\",sHgYF:\"2e8b57\",sHshell:\"fff5ee\",siFna:\"a0522d\",silver:\"c0c0c0\",skyXe:\"87ceeb\",UXe:\"6a5acd\",UWay:\"708090\",UgYy:\"708090\",snow:\"fffafa\",sprRggYF:\"ff7f\",stAlXe:\"4682b4\",tan:\"d2b48c\",teO:\"8080\",tEstN:\"d8bfd8\",tomato:\"ff6347\",Qe:\"40e0d0\",viTet:\"ee82ee\",JHt:\"f5deb3\",wEte:\"ffffff\",wEtesmoke:\"f5f5f5\",Lw:\"ffff00\",LwgYF:\"9acd32\"};let Ht;function jt(t){Ht||(Ht=function(){const t={},e=Object.keys(Nt),i=Object.keys(Wt);let s,n,o,a,r;for(s=0;s<e.length;s++){for(a=r=e[s],n=0;n<i.length;n++)o=i[n],r=r.replace(o,Wt[o]);o=parseInt(Nt[a],16),t[r]=[o>>16&255,o>>8&255,255&o]}return t}(),Ht.transparent=[0,0,0,0]);const e=Ht[t.toLowerCase()];return e&&{r:e[0],g:e[1],b:e[2],a:4===e.length?e[3]:255}}const $t=/^rgba?\\(\\s*([-+.\\d]+)(%)?[\\s,]+([-+.e\\d]+)(%)?[\\s,]+([-+.e\\d]+)(%)?(?:[\\s,/]+([-+.e\\d]+)(%)?)?\\s*\\)$/;const Yt=t=>t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055,Ut=t=>t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4);function Xt(t,e,i){if(t){let s=It(t);s[e]=Math.max(0,Math.min(s[e]+s[e]*i,0===e?360:1)),s=Ft(s),t.r=s[0],t.g=s[1],t.b=s[2]}}function qt(t,e){return t?Object.assign(e||{},t):t}function Kt(t){var e={r:0,g:0,b:0,a:255};return Array.isArray(t)?t.length>=3&&(e={r:t[0],g:t[1],b:t[2],a:255},t.length>3&&(e.a=Mt(t[3]))):(e=qt(t,{r:0,g:0,b:0,a:1})).a=Mt(e.a),e}function Gt(t){return\"r\"===t.charAt(0)?function(t){const e=$t.exec(t);let i,s,n,o=255;if(e){if(e[7]!==i){const t=+e[7];o=e[8]?vt(t):yt(255*t,0,255)}return i=+e[1],s=+e[3],n=+e[5],i=255&(e[2]?vt(i):yt(i,0,255)),s=255&(e[4]?vt(s):yt(s,0,255)),n=255&(e[6]?vt(n):yt(n,0,255)),{r:i,g:s,b:n,a:o}}}(t):Bt(t)}class Zt{constructor(t){if(t instanceof Zt)return t;const e=typeof t;let i;var s,n,o;\"object\"===e?i=Kt(t):\"string\"===e&&(o=(s=t).length,\"#\"===s[0]&&(4===o||5===o?n={r:255&17*St[s[1]],g:255&17*St[s[2]],b:255&17*St[s[3]],a:5===o?17*St[s[4]]:255}:7!==o&&9!==o||(n={r:St[s[1]]<<4|St[s[2]],g:St[s[3]]<<4|St[s[4]],b:St[s[5]]<<4|St[s[6]],a:9===o?St[s[7]]<<4|St[s[8]]:255})),i=n||jt(t)||Gt(t)),this._rgb=i,this._valid=!!i}get valid(){return this._valid}get rgb(){var t=qt(this._rgb);return t&&(t.a=wt(t.a)),t}set rgb(t){this._rgb=Kt(t)}rgbString(){return this._valid?(t=this._rgb)&&(t.a<255?`rgba(${t.r}, ${t.g}, ${t.b}, ${wt(t.a)})`:`rgb(${t.r}, ${t.g}, ${t.b})`):void 0;var t}hexString(){return this._valid?At(this._rgb):void 0}hslString(){return this._valid?function(t){if(!t)return;const e=It(t),i=e[0],s=kt(e[1]),n=kt(e[2]);return t.a<255?`hsla(${i}, ${s}%, ${n}%, ${wt(t.a)})`:`hsl(${i}, ${s}%, ${n}%)`}(this._rgb):void 0}mix(t,e){if(t){const i=this.rgb,s=t.rgb;let n;const o=e===n?.5:e,a=2*o-1,r=i.a-s.a,l=((a*r==-1?a:(a+r)/(1+a*r))+1)/2;n=1-l,i.r=255&l*i.r+n*s.r+.5,i.g=255&l*i.g+n*s.g+.5,i.b=255&l*i.b+n*s.b+.5,i.a=o*i.a+(1-o)*s.a,this.rgb=i}return this}interpolate(t,e){return t&&(this._rgb=function(t,e,i){const s=Ut(wt(t.r)),n=Ut(wt(t.g)),o=Ut(wt(t.b));return{r:Mt(Yt(s+i*(Ut(wt(e.r))-s))),g:Mt(Yt(n+i*(Ut(wt(e.g))-n))),b:Mt(Yt(o+i*(Ut(wt(e.b))-o))),a:t.a+i*(e.a-t.a)}}(this._rgb,t._rgb,e)),this}clone(){return new Zt(this.rgb)}alpha(t){return this._rgb.a=Mt(t),this}clearer(t){return this._rgb.a*=1-t,this}greyscale(){const t=this._rgb,e=_t(.3*t.r+.59*t.g+.11*t.b);return t.r=t.g=t.b=e,this}opaquer(t){return this._rgb.a*=1+t,this}negate(){const t=this._rgb;return t.r=255-t.r,t.g=255-t.g,t.b=255-t.b,this}lighten(t){return Xt(this._rgb,2,t),this}darken(t){return Xt(this._rgb,2,-t),this}saturate(t){return Xt(this._rgb,1,t),this}desaturate(t){return Xt(this._rgb,1,-t),this}rotate(t){return function(t,e){var i=It(t);i[0]=Vt(i[0]+e),i=Ft(i),t.r=i[0],t.g=i[1],t.b=i[2]}(this._rgb,t),this}}function Jt(t){if(t&&\"object\"==typeof t){const e=t.toString();return\"[object CanvasPattern]\"===e||\"[object CanvasGradient]\"===e}return!1}function Qt(t){return Jt(t)?t:new Zt(t)}function te(t){return Jt(t)?t:new Zt(t).saturate(.5).darken(.1).hexString()}const ee=[\"x\",\"y\",\"borderWidth\",\"radius\",\"tension\"],ie=[\"color\",\"borderColor\",\"backgroundColor\"];const se=new Map;function ne(t,e,i){return function(t,e){e=e||{};const i=t+JSON.stringify(e);let s=se.get(i);return s||(s=new Intl.NumberFormat(t,e),se.set(i,s)),s}(e,i).format(t)}const oe={values:t=>n(t)?t:\"\"+t,numeric(t,e,i){if(0===t)return\"0\";const s=this.chart.options.locale;let n,o=t;if(i.length>1){const e=Math.max(Math.abs(i[0].value),Math.abs(i[i.length-1].value));(e<1e-4||e>1e15)&&(n=\"scientific\"),o=function(t,e){let i=e.length>3?e[2].value-e[1].value:e[1].value-e[0].value;Math.abs(i)>=1&&t!==Math.floor(t)&&(i=t-Math.floor(t));return i}(t,i)}const a=z(Math.abs(o)),r=isNaN(a)?1:Math.max(Math.min(-1*Math.floor(a),20),0),l={notation:n,minimumFractionDigits:r,maximumFractionDigits:r};return Object.assign(l,this.options.ticks.format),ne(t,s,l)},logarithmic(t,e,i){if(0===t)return\"0\";const s=i[e].significand||t/Math.pow(10,Math.floor(z(t)));return[1,2,3,5,10,15].includes(s)||e>.8*i.length?oe.numeric.call(this,t,e,i):\"\"}};var ae={formatters:oe};const re=Object.create(null),le=Object.create(null);function he(t,e){if(!e)return t;const i=e.split(\".\");for(let e=0,s=i.length;e<s;++e){const s=i[e];t=t[s]||(t[s]=Object.create(null))}return t}function ce(t,e,i){return\"string\"==typeof e?b(he(t,e),i):b(he(t,\"\"),e)}class de{constructor(t,e){this.animation=void 0,this.backgroundColor=\"rgba(0,0,0,0.1)\",this.borderColor=\"rgba(0,0,0,0.1)\",this.color=\"#666\",this.datasets={},this.devicePixelRatio=t=>t.chart.platform.getDevicePixelRatio(),this.elements={},this.events=[\"mousemove\",\"mouseout\",\"click\",\"touchstart\",\"touchmove\"],this.font={family:\"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif\",size:12,style:\"normal\",lineHeight:1.2,weight:null},this.hover={},this.hoverBackgroundColor=(t,e)=>te(e.backgroundColor),this.hoverBorderColor=(t,e)=>te(e.borderColor),this.hoverColor=(t,e)=>te(e.color),this.indexAxis=\"x\",this.interaction={mode:\"nearest\",intersect:!0,includeInvisible:!1},this.maintainAspectRatio=!0,this.onHover=null,this.onClick=null,this.parsing=!0,this.plugins={},this.responsive=!0,this.scale=void 0,this.scales={},this.showLine=!0,this.drawActiveElementsOnTop=!0,this.describe(t),this.apply(e)}set(t,e){return ce(this,t,e)}get(t){return he(this,t)}describe(t,e){return ce(le,t,e)}override(t,e){return ce(re,t,e)}route(t,e,i,s){const n=he(this,t),a=he(this,i),r=\"_\"+e;Object.defineProperties(n,{[r]:{value:n[e],writable:!0},[e]:{enumerable:!0,get(){const t=this[r],e=a[s];return o(t)?Object.assign({},e,t):l(t,e)},set(t){this[r]=t}}})}apply(t){t.forEach((t=>t(this)))}}var ue=new de({_scriptable:t=>!t.startsWith(\"on\"),_indexable:t=>\"events\"!==t,hover:{_fallback:\"interaction\"},interaction:{_scriptable:!1,_indexable:!1}},[function(t){t.set(\"animation\",{delay:void 0,duration:1e3,easing:\"easeOutQuart\",fn:void 0,from:void 0,loop:void 0,to:void 0,type:void 0}),t.describe(\"animation\",{_fallback:!1,_indexable:!1,_scriptable:t=>\"onProgress\"!==t&&\"onComplete\"!==t&&\"fn\"!==t}),t.set(\"animations\",{colors:{type:\"color\",properties:ie},numbers:{type:\"number\",properties:ee}}),t.describe(\"animations\",{_fallback:\"animation\"}),t.set(\"transitions\",{active:{animation:{duration:400}},resize:{animation:{duration:0}},show:{animations:{colors:{from:\"transparent\"},visible:{type:\"boolean\",duration:0}}},hide:{animations:{colors:{to:\"transparent\"},visible:{type:\"boolean\",easing:\"linear\",fn:t=>0|t}}}})},function(t){t.set(\"layout\",{autoPadding:!0,padding:{top:0,right:0,bottom:0,left:0}})},function(t){t.set(\"scale\",{display:!0,offset:!1,reverse:!1,beginAtZero:!1,bounds:\"ticks\",clip:!0,grace:0,grid:{display:!0,lineWidth:1,drawOnChartArea:!0,drawTicks:!0,tickLength:8,tickWidth:(t,e)=>e.lineWidth,tickColor:(t,e)=>e.color,offset:!1},border:{display:!0,dash:[],dashOffset:0,width:1},title:{display:!1,text:\"\",padding:{top:4,bottom:4}},ticks:{minRotation:0,maxRotation:50,mirror:!1,textStrokeWidth:0,textStrokeColor:\"\",padding:3,display:!0,autoSkip:!0,autoSkipPadding:3,labelOffset:0,callback:ae.formatters.values,minor:{},major:{},align:\"center\",crossAlign:\"near\",showLabelBackdrop:!1,backdropColor:\"rgba(255, 255, 255, 0.75)\",backdropPadding:2}}),t.route(\"scale.ticks\",\"color\",\"\",\"color\"),t.route(\"scale.grid\",\"color\",\"\",\"borderColor\"),t.route(\"scale.border\",\"color\",\"\",\"borderColor\"),t.route(\"scale.title\",\"color\",\"\",\"color\"),t.describe(\"scale\",{_fallback:!1,_scriptable:t=>!t.startsWith(\"before\")&&!t.startsWith(\"after\")&&\"callback\"!==t&&\"parser\"!==t,_indexable:t=>\"borderDash\"!==t&&\"tickBorderDash\"!==t&&\"dash\"!==t}),t.describe(\"scales\",{_fallback:\"scale\"}),t.describe(\"scale.ticks\",{_scriptable:t=>\"backdropPadding\"!==t&&\"callback\"!==t,_indexable:t=>\"backdropPadding\"!==t})}]);function fe(){return\"undefined\"!=typeof window&&\"undefined\"!=typeof document}function ge(t){let e=t.parentNode;return e&&\"[object ShadowRoot]\"===e.toString()&&(e=e.host),e}function pe(t,e,i){let s;return\"string\"==typeof t?(s=parseInt(t,10),-1!==t.indexOf(\"%\")&&(s=s/100*e.parentNode[i])):s=t,s}const me=t=>t.ownerDocument.defaultView.getComputedStyle(t,null);function be(t,e){return me(t).getPropertyValue(e)}const xe=[\"top\",\"right\",\"bottom\",\"left\"];function _e(t,e,i){const s={};i=i?\"-\"+i:\"\";for(let n=0;n<4;n++){const o=xe[n];s[o]=parseFloat(t[e+\"-\"+o+i])||0}return s.width=s.left+s.right,s.height=s.top+s.bottom,s}const ye=(t,e,i)=>(t>0||e>0)&&(!i||!i.shadowRoot);function ve(t,e){if(\"native\"in t)return t;const{canvas:i,currentDevicePixelRatio:s}=e,n=me(i),o=\"border-box\"===n.boxSizing,a=_e(n,\"padding\"),r=_e(n,\"border\",\"width\"),{x:l,y:h,box:c}=function(t,e){const i=t.touches,s=i&&i.length?i[0]:t,{offsetX:n,offsetY:o}=s;let a,r,l=!1;if(ye(n,o,t.target))a=n,r=o;else{const t=e.getBoundingClientRect();a=s.clientX-t.left,r=s.relay-node.invalid,l=!0}return{x:a,y:r,box:l}}(t,i),d=a.left+(c&&r.left),u=a.top+(c&&r.top);let{width:f,height:g}=e;return o&&(f-=a.width+r.width,g-=a.height+r.height),{x:Math.round((l-d)/f*i.width/s),y:Math.round((h-u)/g*i.height/s)}}const Me=t=>Math.round(10*t)/10;function we(t,e,i,s){const n=me(t),o=_e(n,\"margin\"),a=pe(n.maxWidth,t,\"clientWidth\")||T,r=pe(n.maxHeight,t,\"clientHeight\")||T,l=function(t,e,i){let s,n;if(void 0===e||void 0===i){const o=ge(t);if(o){const t=o.getBoundingClientRect(),a=me(o),r=_e(a,\"border\",\"width\"),l=_e(a,\"padding\");e=t.width-l.width-r.width,i=t.height-l.height-r.height,s=pe(a.maxWidth,o,\"clientWidth\"),n=pe(a.maxHeight,o,\"clientHeight\")}else e=t.clientWidth,i=t.clientHeight}return{width:e,height:i,maxWidth:s||T,maxHeight:n||T}}(t,e,i);let{width:h,height:c}=l;if(\"content-box\"===n.boxSizing){const t=_e(n,\"border\",\"width\"),e=_e(n,\"padding\");h-=e.width+t.width,c-=e.height+t.height}h=Math.max(0,h-o.width),c=Math.max(0,s?h/s:c-o.height),h=Me(Math.min(h,a,l.maxWidth)),c=Me(Math.min(c,r,l.maxHeight)),h&&!c&&(c=Me(h/2));return(void 0!==e||void 0!==i)&&s&&l.height&&c>l.height&&(c=l.height,h=Me(Math.floor(c*s))),{width:h,height:c}}function ke(t,e,i){const s=e||1,n=Math.floor(t.height*s),o=Math.floor(t.width*s);t.height=Math.floor(t.height),t.width=Math.floor(t.width);const a=t.canvas;return a.style&&(i||!a.style.height&&!a.style.width)&&(a.style.height=`${t.height}px`,a.style.width=`${t.width}px`),(t.currentDevicePixelRatio!==s||a.height!==n||a.width!==o)&&(t.currentDevicePixelRatio=s,a.height=n,a.width=o,t.ctx.setTransform(s,0,0,s,0,0),!0)}const Se=function(){let t=!1;try{const e={get passive(){return t=!0,!1}};fe()&&(window.addEventListener(\"test\",null,e),window.removeEventListener(\"test\",null,e))}catch(t){}return t}();function Pe(t,e){const i=be(t,e),s=i&&i.match(/^(\\d+)(\\.\\d+)?px$/);return s?+s[1]:void 0}function De(t){return!t||s(t.size)||s(t.family)?null:(t.style?t.style+\" \":\"\")+(t.weight?t.weight+\" \":\"\")+t.size+\"px \"+t.family}function Ce(t,e,i,s,n){let o=e[n];return o||(o=e[n]=t.measureText(n).width,i.push(n)),o>s&&(s=o),s}function Oe(t,e,i,s){let o=(s=s||{}).data=s.data||{},a=s.garbageCollect=s.garbageCollect||[];s.font!==e&&(o=s.data={},a=s.garbageCollect=[],s.font=e),t.save(),t.font=e;let r=0;const l=i.length;let h,c,d,u,f;for(h=0;h<l;h++)if(u=i[h],null==u||n(u)){if(n(u))for(c=0,d=u.length;c<d;c++)f=u[c],null==f||n(f)||(r=Ce(t,o,a,r,f))}else r=Ce(t,o,a,r,u);t.restore();const g=a.length/2;if(g>i.length){for(h=0;h<g;h++)delete o[a[h]];a.splice(0,g)}return r}function Ae(t,e,i){const s=t.currentDevicePixelRatio,n=0!==i?Math.max(i/2,.5):0;return Math.round((e-n)*s)/s+n}function Te(t,e){(e=e||t.getContext(\"2d\")).save(),e.resetTransform(),e.clearRect(0,0,t.width,t.height),e.restore()}function Le(t,e,i,s){Ee(t,e,i,s,null)}function Ee(t,e,i,s,n){let o,a,r,l,h,c,d,u;const f=e.pointStyle,g=e.rotation,p=e.radius;let m=(g||0)*L;if(f&&\"object\"==typeof f&&(o=f.toString(),\"[object HTMLImageElement]\"===o||\"[object HTMLCanvasElement]\"===o))return t.save(),t.translate(i,s),t.rotate(m),t.drawImage(f,-f.width/2,-f.height/2,f.width,f.height),void t.restore();if(!(isNaN(p)||p<=0)){switch(t.beginPath(),f){default:n?t.ellipse(i,s,n/2,p,0,0,O):t.arc(i,s,p,0,O),t.closePath();break;case\"triangle\":c=n?n/2:p,t.moveTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),m+=I,t.lineTo(i+Math.sin(m)*c,s-Math.cos(m)*p),t.closePath();break;case\"rectRounded\":h=.516*p,l=p-h,a=Math.cos(m+R)*l,d=Math.cos(m+R)*(n?n/2-h:l),r=Math.sin(m+R)*l,u=Math.sin(m+R)*(n?n/2-h:l),t.arc(i-d,s-r,h,m-C,m-E),t.arc(i+u,s-a,h,m-E,m),t.arc(i+d,s+r,h,m,m+E),t.arc(i-u,s+a,h,m+E,m+C),t.closePath();break;case\"rect\":if(!g){l=Math.SQRT1_2*p,c=n?n/2:l,t.rect(i-c,s-l,2*c,2*l);break}m+=R;case\"rectRot\":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+u,s-a),t.lineTo(i+d,s+r),t.lineTo(i-u,s+a),t.closePath();break;case\"crossRot\":m+=R;case\"cross\":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case\"star\":d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a),m+=R,d=Math.cos(m)*(n?n/2:p),a=Math.cos(m)*p,r=Math.sin(m)*p,u=Math.sin(m)*(n?n/2:p),t.moveTo(i-d,s-r),t.lineTo(i+d,s+r),t.moveTo(i+u,s-a),t.lineTo(i-u,s+a);break;case\"line\":a=n?n/2:Math.cos(m)*p,r=Math.sin(m)*p,t.moveTo(i-a,s-r),t.lineTo(i+a,s+r);break;case\"dash\":t.moveTo(i,s),t.lineTo(i+Math.cos(m)*(n?n/2:p),s+Math.sin(m)*p);break;case!1:t.closePath()}t.fill(),e.borderWidth>0&&t.stroke()}}function Re(t,e,i){return i=i||.5,!e||t&&t.x>e.left-i&&t.x<e.right+i&&t.y>e.top-i&&t.y<e.bottom+i}function Ie(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.relay-node.invalid),t.clip()}function ze(t){t.restore()}function Fe(t,e,i,s,n){if(!e)return t.lineTo(i.x,i.y);if(\"middle\"===n){const s=(e.x+i.x)/2;t.lineTo(s,e.y),t.lineTo(s,i.y)}else\"after\"===n!=!!s?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y);t.lineTo(i.x,i.y)}function Ve(t,e,i,s){if(!e)return t.lineTo(i.x,i.y);t.bezierCurveTo(s?e.cp1x:e.cp2x,s?e.cp1y:e.cp2y,s?i.cp2x:i.cp1x,s?i.cp2y:i.cp1y,i.x,i.y)}function Be(t,e,i,s,n){if(n.strikethrough||n.underline){const o=t.measureText(s),a=e-o.actualBoundingBoxLeft,r=e+o.actualBoundingBoxRight,l=i-o.actualBoundingBoxAscent,h=i+o.actualBoundingBoxDescent,c=n.strikethrough?(l+h)/2:h;t.strokeStyle=t.fillStyle,t.beginPath(),t.lineWidth=n.decorationWidth||2,t.moveTo(a,c),t.lineTo(r,c),t.stroke()}}function We(t,e){const i=t.fillStyle;t.fillStyle=e.color,t.fillRect(e.left,e.top,e.width,e.height),t.fillStyle=i}function Ne(t,e,i,o,a,r={}){const l=n(e)?e:[e],h=r.strokeWidth>0&&\"\"!==r.strokeColor;let c,d;for(t.save(),t.font=a.string,function(t,e){e.translation&&t.translate(e.translation[0],e.translation[1]),s(e.rotation)||t.rotate(e.rotation),e.color&&(t.fillStyle=e.color),e.textAlign&&(t.textAlign=e.textAlign),e.textBaseline&&(t.textBaseline=e.textBaseline)}(t,r),c=0;c<l.length;++c)d=l[c],r.backdrop&&We(t,r.backdrop),h&&(r.strokeColor&&(t.strokeStyle=r.strokeColor),s(r.strokeWidth)||(t.lineWidth=r.strokeWidth),t.strokeText(d,i,o,r.maxWidth)),t.fillText(d,i,o,r.maxWidth),Be(t,i,o,d,r),o+=Number(a.lineHeight);t.restore()}function He(t,e){const{x:i,y:s,w:n,h:o,radius:a}=e;t.arc(i+a.topLeft,s+a.topLeft,a.topLeft,1.5*C,C,!0),t.lineTo(i,s+o-a.bottomLeft),t.arc(i+a.bottomLeft,s+o-a.bottomLeft,a.bottomLeft,C,E,!0),t.lineTo(i+n-a.bottomRight,s+o),t.arc(i+n-a.bottomRight,s+o-a.bottomRight,a.bottomRight,E,0,!0),t.lineTo(i+n,s+a.topRight),t.arc(i+n-a.topRight,s+a.topRight,a.topRight,0,-E,!0),t.lineTo(i+a.topLeft,s)}function je(t,e=[\"\"],i,s,n=(()=>t[0])){const o=i||t;void 0===s&&(s=ti(\"_fallback\",t));const a={[Symbol.toStringTag]:\"Object\",_cacheable:!0,_scopes:t,_rootScopes:o,_fallback:s,_getTarget:n,override:i=>je([i,...t],e,o,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete e._keys,delete t[0][i],!0),get:(i,s)=>qe(i,s,(()=>function(t,e,i,s){let n;for(const o of e)if(n=ti(Ue(o,t),i),void 0!==n)return Xe(t,n)?Je(i,s,t,n):n}(s,e,t,i))),getOwnPropertyDescriptor:(t,e)=>Reflect.getOwnPropertyDescriptor(t._scopes[0],e),getPrototypeOf:()=>Reflect.getPrototypeOf(t[0]),has:(t,e)=>ei(t).includes(e),ownKeys:t=>ei(t),set(t,e,i){const s=t._storage||(t._storage=n());return t[e]=s[e]=i,delete t._keys,!0}})}function $e(t,e,i,s){const a={_cacheable:!1,_proxy:t,_context:e,_subProxy:i,_stack:new Set,_descriptors:Ye(t,s),setContext:e=>$e(t,e,i,s),override:n=>$e(t.override(n),e,i,s)};return new Proxy(a,{deleteProperty:(e,i)=>(delete e[i],delete t[i],!0),get:(t,e,i)=>qe(t,e,(()=>function(t,e,i){const{_proxy:s,_context:a,_subProxy:r,_descriptors:l}=t;let h=s[e];S(h)&&l.isScriptable(e)&&(h=function(t,e,i,s){const{_proxy:n,_context:o,_subProxy:a,_stack:r}=i;if(r.has(t))throw new Error(\"Recursion detected: \"+Array.from(r).join(\"->\")+\"->\"+t);r.add(t);let l=e(o,a||s);r.delete(t),Xe(t,l)&&(l=Je(n._scopes,n,t,l));return l}(e,h,t,i));n(h)&&h.length&&(h=function(t,e,i,s){const{_proxy:n,_context:a,_subProxy:r,_descriptors:l}=i;if(void 0!==a.index&&s(t))return e[a.index%e.length];if(o(e[0])){const i=e,s=n._scopes.filter((t=>t!==i));e=[];for(const o of i){const i=Je(s,n,t,o);e.push($e(i,a,r&&r[t],l))}}return e}(e,h,t,l.isIndexable));Xe(e,h)&&(h=$e(h,a,r&&r[e],l));return h}(t,e,i))),getOwnPropertyDescriptor:(e,i)=>e._descriptors.allKeys?Reflect.has(t,i)?{enumerable:!0,configurable:!0}:void 0:Reflect.getOwnPropertyDescriptor(t,i),getPrototypeOf:()=>Reflect.getPrototypeOf(t),has:(e,i)=>Reflect.has(t,i),ownKeys:()=>Reflect.ownKeys(t),set:(e,i,s)=>(t[i]=s,delete e[i],!0)})}function Ye(t,e={scriptable:!0,indexable:!0}){const{_scriptable:i=e.scriptable,_indexable:s=e.indexable,_allKeys:n=e.allKeys}=t;return{allKeys:n,scriptable:i,indexable:s,isScriptable:S(i)?i:()=>i,isIndexable:S(s)?s:()=>s}}const Ue=(t,e)=>t?t+w(e):e,Xe=(t,e)=>o(e)&&\"adapters\"!==t&&(null===Object.getPrototypeOf(e)||e.constructor===Object);function qe(t,e,i){if(Object.prototype.hasOwnProperty.call(t,e))return t[e];const s=i();return t[e]=s,s}function Ke(t,e,i){return S(t)?t(e,i):t}const Ge=(t,e)=>!0===t?e:\"string\"==typeof t?M(e,t):void 0;function Ze(t,e,i,s,n){for(const o of e){const e=Ge(i,o);if(e){t.add(e);const o=Ke(e._fallback,i,n);if(void 0!==o&&o!==i&&o!==s)return o}else if(!1===e&&void 0!==s&&i!==s)return null}return!1}function Je(t,e,i,s){const a=e._rootScopes,r=Ke(e._fallback,i,s),l=[...t,...a],h=new Set;h.add(s);let c=Qe(h,l,i,r||i,s);return null!==c&&((void 0===r||r===i||(c=Qe(h,l,r,c,s),null!==c))&&je(Array.from(h),[\"\"],a,r,(()=>function(t,e,i){const s=t._getTarget();e in s||(s[e]={});const a=s[e];if(n(a)&&o(i))return i;return a||{}}(e,i,s))))}function Qe(t,e,i,s,n){for(;i;)i=Ze(t,e,i,s,n);return i}function ti(t,e){for(const i of e){if(!i)continue;const e=i[t];if(void 0!==e)return e}}function ei(t){let e=t._keys;return e||(e=t._keys=function(t){const e=new Set;for(const i of t)for(const t of Object.keys(i).filter((t=>!t.startsWith(\"_\"))))e.add(t);return Array.from(e)}(t._scopes)),e}function ii(t,e,i,s){const{iScale:n}=t,{key:o=\"r\"}=this._parsing,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={r:n.parse(M(c,o),h)};return a}const si=Number.EPSILON||1e-14,ni=(t,e)=>e<t.length&&!t[e].skip&&t[e],oi=t=>\"x\"===t?\"y\":\"x\";function ai(t,e,i,s){const n=t.skip?e:t,o=e,a=i.skip?e:i,r=q(o,n),l=q(a,o);let h=r/(r+l),c=l/(r+l);h=isNaN(h)?0:h,c=isNaN(c)?0:c;const d=s*h,u=s*c;return{previous:{x:o.x-d*(a.x-n.x),y:o.y-d*(a.y-n.y)},next:{x:o.x+u*(a.x-n.x),y:o.y+u*(a.y-n.y)}}}function ri(t,e=\"x\"){const i=oi(e),s=t.length,n=Array(s).fill(0),o=Array(s);let a,r,l,h=ni(t,0);for(a=0;a<s;++a)if(r=l,l=h,h=ni(t,a+1),l){if(h){const t=h[e]-l[e];n[a]=0!==t?(h[i]-l[i])/t:0}o[a]=r?h?F(n[a-1])!==F(n[a])?0:(n[a-1]+n[a])/2:n[a-1]:n[a]}!function(t,e,i){const s=t.length;let n,o,a,r,l,h=ni(t,0);for(let c=0;c<s-1;++c)l=h,h=ni(t,c+1),l&&h&&(V(e[c],0,si)?i[c]=i[c+1]=0:(n=i[c]/e[c],o=i[c+1]/e[c],r=Math.pow(n,2)+Math.pow(o,2),r<=9||(a=3/Math.sqrt(r),i[c]=n*a*e[c],i[c+1]=o*a*e[c])))}(t,n,o),function(t,e,i=\"x\"){const s=oi(i),n=t.length;let o,a,r,l=ni(t,0);for(let h=0;h<n;++h){if(a=r,r=l,l=ni(t,h+1),!r)continue;const n=r[i],c=r[s];a&&(o=(n-a[i])/3,r[`cp1${i}`]=n-o,r[`cp1${s}`]=c-o*e[h]),l&&(o=(l[i]-n)/3,r[`cp2${i}`]=n+o,r[`cp2${s}`]=c+o*e[h])}}(t,o,e)}function li(t,e,i){return Math.max(Math.min(t,i),e)}function hi(t,e,i,s,n){let o,a,r,l;if(e.spanGaps&&(t=t.filter((t=>!t.skip))),\"monotone\"===e.cubicInterpolationMode)ri(t,n);else{let i=s?t[t.length-1]:t[0];for(o=0,a=t.length;o<a;++o)r=t[o],l=ai(i,r,t[Math.min(o+1,a-(s?0:1))%a],e.tension),r.cp1x=l.previous.x,r.cp1y=l.previous.y,r.cp2x=l.next.x,r.cp2y=l.next.y,i=r}e.capBezierPoints&&function(t,e){let i,s,n,o,a,r=Re(t[0],e);for(i=0,s=t.length;i<s;++i)a=o,o=r,r=i<s-1&&Re(t[i+1],e),o&&(n=t[i],a&&(n.cp1x=li(n.cp1x,e.left,e.right),n.cp1y=li(n.cp1y,e.top,e.bottom)),r&&(n.cp2x=li(n.cp2x,e.left,e.right),n.cp2y=li(n.cp2y,e.top,e.bottom)))}(t,i)}const ci=t=>0===t||1===t,di=(t,e,i)=>-Math.pow(2,10*(t-=1))*Math.sin((t-e)*O/i),ui=(t,e,i)=>Math.pow(2,-10*t)*Math.sin((t-e)*O/i)+1,fi={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>-t*(t-2),easeInOutQuad:t=>(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1),easeInCubic:t=>t*t*t,easeOutCubic:t=>(t-=1)*t*t+1,easeInOutCubic:t=>(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2),easeInQuart:t=>t*t*t*t,easeOutQuart:t=>-((t-=1)*t*t*t-1),easeInOutQuart:t=>(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2),easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>(t-=1)*t*t*t*t+1,easeInOutQuint:t=>(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2),easeInSine:t=>1-Math.cos(t*E),easeOutSine:t=>Math.sin(t*E),easeInOutSine:t=>-.5*(Math.cos(C*t)-1),easeInExpo:t=>0===t?0:Math.pow(2,10*(t-1)),easeOutExpo:t=>1===t?1:1-Math.pow(2,-10*t),easeInOutExpo:t=>ci(t)?t:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,-10*(2*t-1))),easeInCirc:t=>t>=1?t:-(Math.sqrt(1-t*t)-1),easeOutCirc:t=>Math.sqrt(1-(t-=1)*t),easeInOutCirc:t=>(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1),easeInElastic:t=>ci(t)?t:di(t,.075,.3),easeOutElastic:t=>ci(t)?t:ui(t,.075,.3),easeInOutElastic(t){const e=.1125;return ci(t)?t:t<.5?.5*di(2*t,e,.45):.5+.5*ui(2*t-1,e,.45)},easeInBack(t){const e=1.70158;return t*t*((e+1)*t-e)},easeOutBack(t){const e=1.70158;return(t-=1)*t*((e+1)*t+e)+1},easeInOutBack(t){let e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:t=>1-fi.easeOutBounce(1-t),easeOutBounce(t){const e=7.5625,i=2.75;return t<1/i?e*t*t:t<2/i?e*(t-=1.5/i)*t+.75:t<2.5/i?e*(t-=2.25/i)*t+.9375:e*(t-=2.625/i)*t+.984375},easeInOutBounce:t=>t<.5?.5*fi.easeInBounce(2*t):.5*fi.easeOutBounce(2*t-1)+.5};function gi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:t.y+i*(e.y-t.y)}}function pi(t,e,i,s){return{x:t.x+i*(e.x-t.x),y:\"middle\"===s?i<.5?t.y:e.y:\"after\"===s?i<1?t.y:e.y:i>0?e.y:t.y}}function mi(t,e,i,s){const n={x:t.cp2x,y:t.cp2y},o={x:e.cp1x,y:e.cp1y},a=gi(t,n,i),r=gi(n,o,i),l=gi(o,e,i),h=gi(a,r,i),c=gi(r,l,i);return gi(h,c,i)}const bi=/^(normal|(\\d+(?:\\.\\d+)?)(px|em|%)?)$/,xi=/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;function _i(t,e){const i=(\"\"+t).match(bi);if(!i||\"normal\"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case\"px\":return t;case\"%\":t/=100}return e*t}const yi=t=>+t||0;function vi(t,e){const i={},s=o(e),n=s?Object.keys(e):e,a=o(t)?s?i=>l(t[i],t[e[i]]):e=>t[e]:()=>t;for(const t of n)i[t]=yi(a(t));return i}function Mi(t){return vi(t,{top:\"y\",right:\"x\",bottom:\"y\",left:\"x\"})}function wi(t){return vi(t,[\"topLeft\",\"topRight\",\"bottomLeft\",\"bottomRight\"])}function ki(t){const e=Mi(t);return e.width=e.left+e.right,e.height=e.top+e.bottom,e}function Si(t,e){t=t||{},e=e||ue.font;let i=l(t.size,e.size);\"string\"==typeof i&&(i=parseInt(i,10));let s=l(t.style,e.style);s&&!(\"\"+s).match(xi)&&(console.warn('Invalid font style specified: \"'+s+'\"'),s=void 0);const n={family:l(t.family,e.family),lineHeight:_i(l(t.lineHeight,e.lineHeight),i),size:i,style:s,weight:l(t.weight,e.weight),string:\"\"};return n.string=De(n),n}function Pi(t,e,i,s){let o,a,r,l=!0;for(o=0,a=t.length;o<a;++o)if(r=t[o],void 0!==r&&(void 0!==e&&\"function\"==typeof r&&(r=r(e),l=!1),void 0!==i&&n(r)&&(r=r[i%r.length],l=!1),void 0!==r))return s&&!l&&(s.cacheable=!1),r}function Di(t,e,i){const{min:s,max:n}=t,o=c(e,(n-s)/2),a=(t,e)=>i&&0===t?0:t+e;return{min:a(s,-Math.abs(o)),max:a(n,o)}}function Ci(t,e){return Object.assign(Object.create(t),e)}function Oi(t,e,i){return t?function(t,e){return{x:i=>t+t+e-i,setWidth(t){e=t},textAlign:t=>\"center\"===t?t:\"right\"===t?\"left\":\"right\",xPlus:(t,e)=>t-e,leftForLtr:(t,e)=>t-e}}(e,i):{x:t=>t,setWidth(t){},textAlign:t=>t,xPlus:(t,e)=>t+e,leftForLtr:(t,e)=>t}}function Ai(t,e){let i,s;\"ltr\"!==e&&\"rtl\"!==e||(i=t.canvas.style,s=[i.getPropertyValue(\"direction\"),i.getPropertyPriority(\"direction\")],i.setProperty(\"direction\",e,\"important\"),t.prevTextDirection=s)}function Ti(t,e){void 0!==e&&(delete t.prevTextDirection,t.canvas.style.setProperty(\"direction\",e[0],e[1]))}function Li(t){return\"angle\"===t?{between:Z,compare:K,normalize:G}:{between:tt,compare:(t,e)=>t-e,normalize:t=>t}}function Ei({start:t,end:e,count:i,loop:s,style:n}){return{start:t%i,end:e%i,loop:s&&(e-t+1)%i==0,style:n}}function Ri(t,e,i){if(!i)return[t];const{property:s,start:n,end:o}=i,a=e.length,{compare:r,between:l,normalize:h}=Li(s),{start:c,end:d,loop:u,style:f}=function(t,e,i){const{property:s,start:n,end:o}=i,{between:a,normalize:r}=Li(s),l=e.length;let h,c,{start:d,end:u,loop:f}=t;if(f){for(d+=l,u+=l,h=0,c=l;h<c&&a(r(e[d%l][s]),n,o);++h)d--,u--;d%=l,u%=l}return u<d&&(u+=l),{start:d,end:u,loop:f,style:t.style}}(t,e,i),g=[];let p,m,b,x=!1,_=null;const y=()=>x||l(n,b,p)&&0!==r(n,b),v=()=>!x||0===r(o,p)||l(o,b,p);for(let t=c,i=c;t<=d;++t)m=e[t%a],m.skip||(p=h(m[s]),p!==b&&(x=l(p,n,o),null===_&&y()&&(_=0===r(p,n)?t:i),null!==_&&v()&&(g.push(Ei({start:_,end:t,loop:u,count:a,style:f})),_=null),i=t,b=p));return null!==_&&g.push(Ei({start:_,end:d,loop:u,count:a,style:f})),g}function Ii(t,e){const i=[],s=t.segments;for(let n=0;n<s.length;n++){const o=Ri(s[n],t.points,e);o.length&&i.push(...o)}return i}function zi(t,e){const i=t.points,s=t.options.spanGaps,n=i.length;if(!n)return[];const o=!!t._loop,{start:a,end:r}=function(t,e,i,s){let n=0,o=e-1;if(i&&!s)for(;n<e&&!t[n].skip;)n++;for(;n<e&&t[n].skip;)n++;for(n%=e,i&&(o+=n);o>n&&t[o%e].skip;)o--;return o%=e,{start:n,end:o}}(i,n,o,s);if(!0===s)return Fi(t,[{start:a,end:r,loop:o}],i,e);return Fi(t,function(t,e,i,s){const n=t.length,o=[];let a,r=e,l=t[e];for(a=e+1;a<=i;++a){const i=t[a%n];i.skip||i.stop?l.skip||(s=!1,o.push({start:e%n,end:(a-1)%n,loop:s}),e=r=i.stop?a:null):(r=a,l.skip&&(e=a)),l=i}return null!==r&&o.push({start:e%n,end:r%n,loop:s}),o}(i,a,r<a?r+n:r,!!t._fullLoop&&0===a&&r===n-1),i,e)}function Fi(t,e,i,s){return s&&s.setContext&&i?function(t,e,i,s){const n=t._chart.getContext(),o=Vi(t.options),{_datasetIndex:a,options:{spanGaps:r}}=t,l=i.length,h=[];let c=o,d=e[0].start,u=d;function f(t,e,s,n){const o=r?-1:1;if(t!==e){for(t+=l;i[t%l].skip;)t-=o;for(;i[e%l].skip;)e+=o;t%l!=e%l&&(h.push({start:t%l,end:e%l,loop:s,style:n}),c=n,d=e%l)}}for(const t of e){d=r?d:t.start;let e,o=i[d%l];for(u=d+1;u<=t.end;u++){const r=i[u%l];e=Vi(s.setContext(Ci(n,{type:\"segment\",p0:o,p1:r,p0DataIndex:(u-1)%l,p1DataIndex:u%l,datasetIndex:a}))),Bi(e,c)&&f(d,u-1,t.loop,c),o=r,c=e}d<u-1&&f(d,u-1,t.loop,c)}return h}(t,e,i,s):e}function Vi(t){return{backgroundColor:t.backgroundColor,borderCapStyle:t.borderCapStyle,borderDash:t.borderDash,borderDashOffset:t.borderDashOffset,borderJoinStyle:t.borderJoinStyle,borderWidth:t.borderWidth,borderColor:t.borderColor}}function Bi(t,e){if(!e)return!1;const i=[],s=function(t,e){return Jt(e)?(i.includes(e)||i.push(e),i.indexOf(e)):e};return JSON.stringify(t,s)!==JSON.stringify(e,s)}var Wi=Object.freeze({__proto__:null,HALF_PI:E,INFINITY:T,PI:C,PITAU:A,QUARTER_PI:R,RAD_PER_DEG:L,TAU:O,TWO_THIRDS_PI:I,_addGrace:Di,_alignPixel:Ae,_alignStartEnd:ft,_angleBetween:Z,_angleDiff:K,_arrayUnique:lt,_attachContext:$e,_bezierCurveTo:Ve,_bezierInterpolation:mi,_boundSegment:Ri,_boundSegments:Ii,_capitalize:w,_computeSegments:zi,_createResolver:je,_decimalPlaces:U,_deprecated:function(t,e,i,s){void 0!==e&&console.warn(t+': \"'+i+'\" is deprecated. Please use \"'+s+'\" instead')},_descriptors:Ye,_elementsEqual:f,_factorize:W,_filterBetween:nt,_getParentNode:ge,_getStartAndCountOfVisiblePoints:pt,_int16Range:Q,_isBetween:tt,_isClickEvent:D,_isDomSupported:fe,_isPointInArea:Re,_limitValue:J,_longestText:Oe,_lookup:et,_lookupByKey:it,_measureText:Ce,_merger:m,_mergerIf:_,_normalizeAngle:G,_parseObjectDataRadialScale:ii,_pointInLine:gi,_readValueToProps:vi,_rlookupByKey:st,_scaleRangesChanged:mt,_setMinAndMaxByKey:j,_splitKey:v,_steppedInterpolation:pi,_steppedLineTo:Fe,_textX:gt,_toLeftRightCenter:ut,_updateBezierControlPoints:hi,addRoundedRectPath:He,almostEquals:V,almostWhole:H,callback:d,clearCanvas:Te,clipArea:Ie,clone:g,color:Qt,createContext:Ci,debounce:dt,defined:k,distanceBetweenPoints:q,drawPoint:Le,drawPointLegend:Ee,each:u,easingEffects:fi,finiteOrDefault:r,fontString:function(t,e,i){return e+\" \"+t+\"px \"+i},formatNumber:ne,getAngleFromPoint:X,getHoverColor:te,getMaximumSize:we,getRelativePosition:ve,getRtlAdapter:Oi,getStyle:be,isArray:n,isFinite:a,isFunction:S,isNullOrUndef:s,isNumber:N,isObject:o,isPatternOrGradient:Jt,listenArrayEvents:at,log10:z,merge:b,mergeIf:x,niceNum:B,noop:e,overrideTextDirection:Ai,readUsedSize:Pe,renderText:Ne,requestAnimFrame:ht,resolve:Pi,resolveObjectKey:M,restoreTextDirection:Ti,retinaScale:ke,setsEqual:P,sign:F,splineCurve:ai,splineCurveMonotone:ri,supportsEventListenerOptions:Se,throttled:ct,toDegrees:Y,toDimension:c,toFont:Si,toFontString:De,toLineHeight:_i,toPadding:ki,toPercentage:h,toRadians:$,toTRBL:Mi,toTRBLCorners:wi,uid:i,unclipArea:ze,unlistenArrayEvents:rt,valueOrDefault:l});function Ni(t,e,i,s){const{controller:n,data:o,_sorted:a}=t,r=n._cachedMeta.iScale;if(r&&e===r.axis&&\"r\"!==e&&a&&o.length){const t=r._reversePixels?st:it;if(!s)return t(o,e,i);if(n._sharedOptions){const s=o[0],n=\"function\"==typeof s.getRange&&s.getRange(e);if(n){const s=t(o,e,i-n),a=t(o,e,i+n);return{lo:s.lo,hi:a.hi}}}}return{lo:0,hi:o.length-1}}function Hi(t,e,i,s,n){const o=t.getSortedVisibleDatasetMetas(),a=i[e];for(let t=0,i=o.length;t<i;++t){const{index:i,data:r}=o[t],{lo:l,hi:h}=Ni(o[t],e,a,n);for(let t=l;t<=h;++t){const e=r[t];e.skip||s(e,i,t)}}}function ji(t,e,i,s,n){const o=[];if(!n&&!t.isPointInArea(e))return o;return Hi(t,i,e,(function(i,a,r){(n||Re(i,t.chartArea,0))&&i.inRange(e.x,e.y,s)&&o.push({element:i,datasetIndex:a,index:r})}),!0),o}function $i(t,e,i,s,n,o){let a=[];const r=function(t){const e=-1!==t.indexOf(\"x\"),i=-1!==t.indexOf(\"y\");return function(t,s){const n=e?Math.abs(t.x-s.x):0,o=i?Math.abs(t.y-s.y):0;return Math.sqrt(Math.pow(n,2)+Math.pow(o,2))}}(i);let l=Number.POSITIVE_INFINITY;return Hi(t,i,e,(function(i,h,c){const d=i.inRange(e.x,e.y,n);if(s&&!d)return;const u=i.getCenterPoint(n);if(!(!!o||t.isPointInArea(u))&&!d)return;const f=r(e,u);f<l?(a=[{element:i,datasetIndex:h,index:c}],l=f):f===l&&a.push({element:i,datasetIndex:h,index:c})})),a}function Yi(t,e,i,s,n,o){return o||t.isPointInArea(e)?\"r\"!==i||s?$i(t,e,i,s,n,o):function(t,e,i,s){let n=[];return Hi(t,i,e,(function(t,i,o){const{startAngle:a,endAngle:r}=t.getProps([\"startAngle\",\"endAngle\"],s),{angle:l}=X(t,{x:e.x,y:e.y});Z(l,a,r)&&n.push({element:t,datasetIndex:i,index:o})})),n}(t,e,i,n):[]}function Ui(t,e,i,s,n){const o=[],a=\"x\"===i?\"inXRange\":\"inYRange\";let r=!1;return Hi(t,i,e,((t,s,l)=>{t[a](e[i],n)&&(o.push({element:t,datasetIndex:s,index:l}),r=r||t.inRange(e.x,e.y,n))})),s&&!r?[]:o}var Xi={evaluateInteractionItems:Hi,modes:{index(t,e,i,s){const n=ve(e,t),o=i.axis||\"x\",a=i.includeInvisible||!1,r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a),l=[];return r.length?(t.getSortedVisibleDatasetMetas().forEach((t=>{const e=r[0].index,i=t.data[e];i&&!i.skip&&l.push({element:i,datasetIndex:t.index,index:e})})),l):[]},dataset(t,e,i,s){const n=ve(e,t),o=i.axis||\"xy\",a=i.includeInvisible||!1;let r=i.intersect?ji(t,n,o,s,a):Yi(t,n,o,!1,s,a);if(r.length>0){const e=r[0].datasetIndex,i=t.getDatasetMeta(e).data;r=[];for(let t=0;t<i.length;++t)r.push({element:i[t],datasetIndex:e,index:t})}return r},point:(t,e,i,s)=>ji(t,ve(e,t),i.axis||\"xy\",s,i.includeInvisible||!1),nearest(t,e,i,s){const n=ve(e,t),o=i.axis||\"xy\",a=i.includeInvisible||!1;return Yi(t,n,o,i.intersect,s,a)},x:(t,e,i,s)=>Ui(t,ve(e,t),\"x\",i.intersect,s),y:(t,e,i,s)=>Ui(t,ve(e,t),\"y\",i.intersect,s)}};const qi=[\"left\",\"top\",\"right\",\"bottom\"];function Ki(t,e){return t.filter((t=>t.pos===e))}function Gi(t,e){return t.filter((t=>-1===qi.indexOf(t.pos)&&t.box.axis===e))}function Zi(t,e){return t.sort(((t,i)=>{const s=e?i:t,n=e?t:i;return s.weight===n.weight?s.index-n.index:s.weight-n.weight}))}function Ji(t,e){const i=function(t){const e={};for(const i of t){const{stack:t,pos:s,stackWeight:n}=i;if(!t||!qi.includes(s))continue;const o=e[t]||(e[t]={count:0,placed:0,weight:0,size:0});o.count++,o.weight+=n}return e}(t),{vBoxMaxWidth:s,hBoxMaxHeight:n}=e;let o,a,r;for(o=0,a=t.length;o<a;++o){r=t[o];const{fullSize:a}=r.box,l=i[r.stack],h=l&&r.stackWeight/l.weight;r.horizontal?(r.width=h?h*s:a&&e.availableWidth,r.height=n):(r.width=s,r.height=h?h*n:a&&e.availableHeight)}return i}function Qi(t,e,i,s){return Math.max(t[i],e[i])+Math.max(t[s],e[s])}function ts(t,e){t.top=Math.max(t.top,e.top),t.left=Math.max(t.left,e.left),t.bottom=Math.max(t.bottom,e.bottom),t.right=Math.max(t.right,e.right)}function es(t,e,i,s){const{pos:n,box:a}=i,r=t.maxPadding;if(!o(n)){i.size&&(t[n]-=i.size);const e=s[i.stack]||{size:0,count:1};e.size=Math.max(e.size,i.horizontal?a.height:a.width),i.size=e.size/e.count,t[n]+=i.size}a.getPadding&&ts(r,a.getPadding());const l=Math.max(0,e.outerWidth-Qi(r,t,\"left\",\"right\")),h=Math.max(0,e.outerHeight-Qi(r,t,\"top\",\"bottom\")),c=l!==t.w,d=h!==t.h;return t.w=l,t.h=h,i.horizontal?{same:c,other:d}:{same:d,other:c}}function is(t,e){const i=e.maxPadding;function s(t){const s={left:0,top:0,right:0,bottom:0};return t.forEach((t=>{s[t]=Math.max(e[t],i[t])})),s}return s(t?[\"left\",\"right\"]:[\"top\",\"bottom\"])}function ss(t,e,i,s){const n=[];let o,a,r,l,h,c;for(o=0,a=t.length,h=0;o<a;++o){r=t[o],l=r.box,l.update(r.width||e.w,r.height||e.h,is(r.horizontal,e));const{same:a,other:d}=es(e,i,r,s);h|=a&&n.length,c=c||d,l.fullSize||n.push(r)}return h&&ss(n,e,i,s)||c}function ns(t,e,i,s,n){t.top=i,t.left=e,t.right=e+s,t.bottom=i+n,t.width=s,t.height=n}function os(t,e,i,s){const n=i.padding;let{x:o,y:a}=e;for(const r of t){const t=r.box,l=s[r.stack]||{count:1,placed:0,weight:1},h=r.stackWeight/l.weight||1;if(r.horizontal){const s=e.w*h,o=l.size||t.height;k(l.start)&&(a=l.start),t.fullSize?ns(t,n.left,a,i.outerWidth-n.right-n.left,o):ns(t,e.left+l.placed,a,s,o),l.start=a,l.placed+=s,a=t.bottom}else{const s=e.h*h,a=l.size||t.width;k(l.start)&&(o=l.start),t.fullSize?ns(t,o,n.top,a,i.outerHeight-n.relay-node.invalid):ns(t,o,e.top+l.placed,a,s),l.start=o,l.placed+=s,o=t.right}}e.x=o,e.y=a}var as={addBox(t,e){t.boxes||(t.boxes=[]),e.fullSize=e.fullSize||!1,e.position=e.position||\"top\",e.weight=e.weight||0,e._layers=e._layers||function(){return[{z:0,draw(t){e.draw(t)}}]},t.boxes.push(e)},removeBox(t,e){const i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure(t,e,i){e.fullSize=i.fullSize,e.position=i.position,e.weight=i.weight},update(t,e,i,s){if(!t)return;const n=ki(t.options.layout.padding),o=Math.max(e-n.width,0),a=Math.max(i-n.height,0),r=function(t){const e=function(t){const e=[];let i,s,n,o,a,r;for(i=0,s=(t||[]).length;i<s;++i)n=t[i],({position:o,options:{stack:a,stackWeight:r=1}}=n),e.push({index:i,box:n,pos:o,horizontal:n.isHorizontal(),weight:n.weight,stack:a&&o+a,stackWeight:r});return e}(t),i=Zi(e.filter((t=>t.box.fullSize)),!0),s=Zi(Ki(e,\"left\"),!0),n=Zi(Ki(e,\"right\")),o=Zi(Ki(e,\"top\"),!0),a=Zi(Ki(e,\"bottom\")),r=Gi(e,\"x\"),l=Gi(e,\"y\");return{fullSize:i,leftAndTop:s.concat(o),rightAndBottom:n.concat(l).concat(a).concat(r),chartArea:Ki(e,\"chartArea\"),vertical:s.concat(n).concat(l),horizontal:o.concat(a).concat(r)}}(t.boxes),l=r.vertical,h=r.horizontal;u(t.boxes,(t=>{\"function\"==typeof t.beforeLayout&&t.beforeLayout()}));const c=l.reduce(((t,e)=>e.box.options&&!1===e.box.options.display?t:t+1),0)||1,d=Object.freeze({outerWidth:e,outerHeight:i,padding:n,availableWidth:o,availableHeight:a,vBoxMaxWidth:o/2/c,hBoxMaxHeight:a/2}),f=Object.assign({},n);ts(f,ki(s));const g=Object.assign({maxPadding:f,w:o,h:a,x:n.left,y:n.top},n),p=Ji(l.concat(h),d);ss(r.fullSize,g,d,p),ss(l,g,d,p),ss(h,g,d,p)&&ss(l,g,d,p),function(t){const e=t.maxPadding;function i(i){const s=Math.max(e[i]-t[i],0);return t[i]+=s,s}t.y+=i(\"top\"),t.x+=i(\"left\"),i(\"right\"),i(\"bottom\")}(g),os(r.leftAndTop,g,d,p),g.x+=g.w,g.y+=g.h,os(r.rightAndBottom,g,d,p),t.chartArea={left:g.left,top:g.top,right:g.left+g.w,bottom:g.top+g.h,height:g.h,width:g.w},u(r.chartArea,(e=>{const i=e.box;Object.assign(i,t.chartArea),i.update(g.w,g.h,{left:0,top:0,right:0,bottom:0})}))}};class rs{acquireContext(t,e){}releaseContext(t){return!1}addEventListener(t,e,i){}removeEventListener(t,e,i){}getDevicePixelRatio(){return 1}getMaximumSize(t,e,i,s){return e=Math.max(0,e||t.width),i=i||t.height,{width:e,height:Math.max(0,s?Math.floor(e/s):i)}}isAttached(t){return!0}updateConfig(t){}}class ls extends rs{acquireContext(t){return t&&t.getContext&&t.getContext(\"2d\")||null}updateConfig(t){t.options.animation=!1}}const hs=\"$chartjs\",cs={touchstart:\"mousedown\",touchmove:\"mousemove\",touchend:\"mouseup\",pointerenter:\"mouseenter\",pointerdown:\"mousedown\",pointermove:\"mousemove\",pointerup:\"mouseup\",pointerleave:\"mouseout\",pointerout:\"mouseout\"},ds=t=>null===t||\"\"===t;const us=!!Se&&{passive:!0};function fs(t,e,i){t.canvas.removeEventListener(e,i,us)}function gs(t,e){for(const i of t)if(i===e||i.contains(e))return!0}function ps(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.addedNodes,s),e=e&&!gs(i.removedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}function ms(t,e,i){const s=t.canvas,n=new MutationObserver((t=>{let e=!1;for(const i of t)e=e||gs(i.removedNodes,s),e=e&&!gs(i.addedNodes,s);e&&i()}));return n.observe(document,{childList:!0,subtree:!0}),n}const bs=new Map;let xs=0;function _s(){const t=window.devicePixelRatio;t!==xs&&(xs=t,bs.forEach(((e,i)=>{i.currentDevicePixelRatio!==t&&e()})))}function ys(t,e,i){const s=t.canvas,n=s&&ge(s);if(!n)return;const o=ct(((t,e)=>{const s=n.clientWidth;i(t,e),s<n.clientWidth&&i()}),window),a=new ResizeObserver((t=>{const e=t[0],i=e.contentRect.width,s=e.contentRect.height;0===i&&0===s||o(i,s)}));return a.observe(n),function(t,e){bs.size||window.addEventListener(\"resize\",_s),bs.set(t,e)}(t,o),a}function vs(t,e,i){i&&i.disconnect(),\"resize\"===e&&function(t){bs.delete(t),bs.size||window.removeEventListener(\"resize\",_s)}(t)}function Ms(t,e,i){const s=t.canvas,n=ct((e=>{null!==t.ctx&&i(function(t,e){const i=cs[t.type]||t.type,{x:s,y:n}=ve(t,e);return{type:i,chart:e,native:t,x:void 0!==s?s:null,y:void 0!==n?n:null}}(e,t))}),t);return function(t,e,i){t.addEventListener(e,i,us)}(s,e,n),n}class ws extends rs{acquireContext(t,e){const i=t&&t.getContext&&t.getContext(\"2d\");return i&&i.canvas===t?(function(t,e){const i=t.style,s=t.getAttribute(\"height\"),n=t.getAttribute(\"width\");if(t[hs]={initial:{height:s,width:n,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||\"block\",i.boxSizing=i.boxSizing||\"border-box\",ds(n)){const e=Pe(t,\"width\");void 0!==e&&(t.width=e)}if(ds(s))if(\"\"===t.style.height)t.height=t.width/(e||2);else{const e=Pe(t,\"height\");void 0!==e&&(t.height=e)}}(t,e),i):null}releaseContext(t){const e=t.canvas;if(!e[hs])return!1;const i=e[hs].initial;[\"height\",\"width\"].forEach((t=>{const n=i[t];s(n)?e.removeAttribute(t):e.setAttribute(t,n)}));const n=i.style||{};return Object.keys(n).forEach((t=>{e.style[t]=n[t]})),e.width=e.width,delete e[hs],!0}addEventListener(t,e,i){this.removeEventListener(t,e);const s=t.$proxies||(t.$proxies={}),n={attach:ps,detach:ms,resize:ys}[e]||Ms;s[e]=n(t,e,i)}removeEventListener(t,e){const i=t.$proxies||(t.$proxies={}),s=i[e];if(!s)return;({attach:vs,detach:vs,resize:vs}[e]||fs)(t,e,s),i[e]=void 0}getDevicePixelRatio(){return window.devicePixelRatio}getMaximumSize(t,e,i,s){return we(t,e,i,s)}isAttached(t){const e=ge(t);return!(!e||!e.isConnected)}}function ks(t){return!fe()||\"undefined\"!=typeof OffscreenCanvas&&t instanceof OffscreenCanvas?ls:ws}var Ss=Object.freeze({__proto__:null,BasePlatform:rs,BasicPlatform:ls,DomPlatform:ws,_detectPlatform:ks});const Ps=\"transparent\",Ds={boolean:(t,e,i)=>i>.5?e:t,color(t,e,i){const s=Qt(t||Ps),n=s.valid&&Qt(e||Ps);return n&&n.valid?n.mix(s,i).hexString():e},number:(t,e,i)=>t+(e-t)*i};class Cs{constructor(t,e,i,s){const n=e[i];s=Pi([t.to,s,n,t.from]);const o=Pi([t.from,n,s]);this._active=!0,this._fn=t.fn||Ds[t.type||typeof o],this._easing=fi[t.easing]||fi.linear,this._start=Math.floor(Date.now()+(t.delay||0)),this._duration=this._total=Math.floor(t.duration),this._loop=!!t.loop,this._target=e,this._prop=i,this._from=o,this._to=s,this._promises=void 0}active(){return this._active}update(t,e,i){if(this._active){this._notify(!1);const s=this._target[this._prop],n=i-this._start,o=this._duration-n;this._start=i,this._duration=Math.floor(Math.max(o,t.duration)),this._total+=n,this._loop=!!t.loop,this._to=Pi([t.to,e,s,t.from]),this._from=Pi([t.from,s,e])}}cancel(){this._active&&(this.tick(Date.now()),this._active=!1,this._notify(!1))}tick(t){const e=t-this._start,i=this._duration,s=this._prop,n=this._from,o=this._loop,a=this._to;let r;if(this._active=n!==a&&(o||e<i),!this._active)return this._target[s]=a,void this._notify(!0);e<0?this._target[s]=n:(r=e/i%2,r=o&&r>1?2-r:r,r=this._easing(Math.min(1,Math.max(0,r))),this._target[s]=this._fn(n,a,r))}wait(){const t=this._promises||(this._promises=[]);return new Promise(((e,i)=>{t.push({res:e,rej:i})}))}_notify(t){const e=t?\"res\":\"rej\",i=this._promises||[];for(let t=0;t<i.length;t++)i[t][e]()}}class Os{constructor(t,e){this._chart=t,this._properties=new Map,this.configure(e)}configure(t){if(!o(t))return;const e=Object.keys(ue.animation),i=this._properties;Object.getOwnPropertyNames(t).forEach((s=>{const a=t[s];if(!o(a))return;const r={};for(const t of e)r[t]=a[t];(n(a.properties)&&a.properties||[s]).forEach((t=>{t!==s&&i.has(t)||i.set(t,r)}))}))}_animateOptions(t,e){const i=e.options,s=function(t,e){if(!e)return;let i=t.options;if(!i)return void(t.options=e);i.$shared&&(t.options=i=Object.assign({},i,{$shared:!1,$animations:{}}));return i}(t,i);if(!s)return[];const n=this._createAnimations(s,i);return i.$shared&&function(t,e){const i=[],s=Object.keys(e);for(let e=0;e<s.length;e++){const n=t[s[e]];n&&n.active()&&i.push(n.wait())}return Promise.all(i)}(t.options.$animations,i).then((()=>{t.options=i}),(()=>{})),n}_createAnimations(t,e){const i=this._properties,s=[],n=t.$animations||(t.$animations={}),o=Object.keys(e),a=Date.now();let r;for(r=o.length-1;r>=0;--r){const l=o[r];if(\"$\"===l.charAt(0))continue;if(\"options\"===l){s.push(...this._animateOptions(t,e));continue}const h=e[l];let c=n[l];const d=i.get(l);if(c){if(d&&c.active()){c.update(d,h,a);continue}c.cancel()}d&&d.duration?(n[l]=c=new Cs(d,t,l,h),s.push(c)):t[l]=h}return s}update(t,e){if(0===this._properties.size)return void Object.assign(t,e);const i=this._createAnimations(t,e);return i.length?(xt.add(this._chart,i),!0):void 0}}function As(t,e){const i=t&&t.options||{},s=i.reverse,n=void 0===i.min?e:0,o=void 0===i.max?e:0;return{start:s?o:n,end:s?n:o}}function Ts(t,e){const i=[],s=t._getSortedDatasetMetas(e);let n,o;for(n=0,o=s.length;n<o;++n)i.push(s[n].index);return i}function Ls(t,e,i,s={}){const n=t.keys,o=\"single\"===s.mode;let r,l,h,c;if(null!==e){for(r=0,l=n.length;r<l;++r){if(h=+n[r],h===i){if(s.all)continue;break}c=t.values[h],a(c)&&(o||0===e||F(e)===F(c))&&(e+=c)}return e}}function Es(t,e){const i=t&&t.options.stacked;return i||void 0===i&&void 0!==e.stack}function Rs(t,e,i){const s=t[e]||(t[e]={});return s[i]||(s[i]={})}function Is(t,e,i,s){for(const n of e.getMatchingVisibleMetas(s).reverse()){const e=t[n.index];if(i&&e>0||!i&&e<0)return n.index}return null}function zs(t,e){const{chart:i,_cachedMeta:s}=t,n=i._stacks||(i._stacks={}),{iScale:o,vScale:a,index:r}=s,l=o.axis,h=a.axis,c=function(t,e,i){return`${t.id}.${e.id}.${i.stack||i.type}`}(o,a,s),d=e.length;let u;for(let t=0;t<d;++t){const i=e[t],{[l]:o,[h]:d}=i;u=(i._stacks||(i._stacks={}))[h]=Rs(n,c,o),u[r]=d,u._top=Is(u,a,!0,s.type),u._bottom=Is(u,a,!1,s.type);(u._visualValues||(u._visualValues={}))[r]=d}}function Fs(t,e){const i=t.scales;return Object.keys(i).filter((t=>i[t].axis===e)).shift()}function Vs(t,e){const i=t.controller.index,s=t.vScale&&t.vScale.axis;if(s){e=e||t._parsed;for(const t of e){const e=t._stacks;if(!e||void 0===e[s]||void 0===e[s][i])return;delete e[s][i],void 0!==e[s]._visualValues&&void 0!==e[s]._visualValues[i]&&delete e[s]._visualValues[i]}}}const Bs=t=>\"reset\"===t||\"none\"===t,Ws=(t,e)=>e?t:Object.assign({},t);class Ns{static defaults={};static datasetElementType=null;static dataElementType=null;constructor(t,e){this.chart=t,this._ctx=t.ctx,this.index=e,this._cachedDataOpts={},this._cachedMeta=this.getMeta(),this._type=this._cachedMeta.type,this.options=void 0,this._parsing=!1,this._data=void 0,this._objectData=void 0,this._sharedOptions=void 0,this._drawStart=void 0,this._drawCount=void 0,this.enableOptionSharing=!1,this.supportsDecimation=!1,this.$context=void 0,this._syncList=[],this.datasetElementType=new.target.datasetElementType,this.dataElementType=new.target.dataElementType,this.initialize()}initialize(){const t=this._cachedMeta;this.configure(),this.linkScales(),t._stacked=Es(t.vScale,t),this.addElements(),this.options.fill&&!this.chart.isPluginEnabled(\"filler\")&&console.warn(\"Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options\")}updateIndex(t){this.index!==t&&Vs(this._cachedMeta),this.index=t}linkScales(){const t=this.chart,e=this._cachedMeta,i=this.getDataset(),s=(t,e,i,s)=>\"x\"===t?e:\"r\"===t?s:i,n=e.xAxisID=l(i.xAxisID,Fs(t,\"x\")),o=e.yAxisID=l(i.yAxisID,Fs(t,\"y\")),a=e.rAxisID=l(i.rAxisID,Fs(t,\"r\")),r=e.indexAxis,h=e.iAxisID=s(r,n,o,a),c=e.vAxisID=s(r,o,n,a);e.xScale=this.getScaleForId(n),e.yScale=this.getScaleForId(o),e.rScale=this.getScaleForId(a),e.iScale=this.getScaleForId(h),e.vScale=this.getScaleForId(c)}getDataset(){return this.chart.data.datasets[this.index]}getMeta(){return this.chart.getDatasetMeta(this.index)}getScaleForId(t){return this.chart.scales[t]}_getOtherScale(t){const e=this._cachedMeta;return t===e.iScale?e.vScale:e.iScale}reset(){this._update(\"reset\")}_destroy(){const t=this._cachedMeta;this._data&&rt(this._data,this),t._stacked&&Vs(t)}_dataCheck(){const t=this.getDataset(),e=t.data||(t.data=[]),i=this._data;if(o(e))this._data=function(t){const e=Object.keys(t),i=new Array(e.length);let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s],i[s]={x:o,y:t[o]};return i}(e);else if(i!==e){if(i){rt(i,this);const t=this._cachedMeta;Vs(t),t._parsed=[]}e&&Object.isExtensible(e)&&at(e,this),this._syncList=[],this._data=e}}addElements(){const t=this._cachedMeta;this._dataCheck(),this.datasetElementType&&(t.dataset=new this.datasetElementType)}buildOrUpdateElements(t){const e=this._cachedMeta,i=this.getDataset();let s=!1;this._dataCheck();const n=e._stacked;e._stacked=Es(e.vScale,e),e.stack!==i.stack&&(s=!0,Vs(e),e.stack=i.stack),this._resyncElements(t),(s||n!==e._stacked)&&zs(this,e._parsed)}configure(){const t=this.chart.config,e=t.datasetScopeKeys(this._type),i=t.getOptionScopes(this.getDataset(),e,!0);this.options=t.createResolver(i,this.getContext()),this._parsing=this.options.parsing,this._cachedDataOpts={}}parse(t,e){const{_cachedMeta:i,_data:s}=this,{iScale:a,_stacked:r}=i,l=a.axis;let h,c,d,u=0===t&&e===s.length||i._sorted,f=t>0&&i._parsed[t-1];if(!1===this._parsing)i._parsed=s,i._sorted=!0,d=s;else{d=n(s[t])?this.parseArrayData(i,s,t,e):o(s[t])?this.parseObjectData(i,s,t,e):this.parsePrimitiveData(i,s,t,e);const a=()=>null===c[l]||f&&c[l]<f[l];for(h=0;h<e;++h)i._parsed[h+t]=c=d[h],u&&(a()&&(u=!1),f=c);i._sorted=u}r&&zs(this,d)}parsePrimitiveData(t,e,i,s){const{iScale:n,vScale:o}=t,a=n.axis,r=o.axis,l=n.getLabels(),h=n===o,c=new Array(s);let d,u,f;for(d=0,u=s;d<u;++d)f=d+i,c[d]={[a]:h||n.parse(l[f],f),[r]:o.parse(e[f],f)};return c}parseArrayData(t,e,i,s){const{xScale:n,yScale:o}=t,a=new Array(s);let r,l,h,c;for(r=0,l=s;r<l;++r)h=r+i,c=e[h],a[r]={x:n.parse(c[0],h),y:o.parse(c[1],h)};return a}parseObjectData(t,e,i,s){const{xScale:n,yScale:o}=t,{xAxisKey:a=\"x\",yAxisKey:r=\"y\"}=this._parsing,l=new Array(s);let h,c,d,u;for(h=0,c=s;h<c;++h)d=h+i,u=e[d],l[h]={x:n.parse(M(u,a),d),y:o.parse(M(u,r),d)};return l}getParsed(t){return this._cachedMeta._parsed[t]}getDataElement(t){return this._cachedMeta.data[t]}applyStack(t,e,i){const s=this.chart,n=this._cachedMeta,o=e[t.axis];return Ls({keys:Ts(s,!0),values:e._stacks[t.axis]._visualValues},o,n.index,{mode:i})}updateRangeFromParsed(t,e,i,s){const n=i[e.axis];let o=null===n?NaN:n;const a=s&&i._stacks[e.axis];s&&a&&(s.values=a,o=Ls(s,n,this._cachedMeta.index)),t.min=Math.min(t.min,o),t.max=Math.max(t.max,o)}getMinMax(t,e){const i=this._cachedMeta,s=i._parsed,n=i._sorted&&t===i.iScale,o=s.length,r=this._getOtherScale(t),l=((t,e,i)=>t&&!e.hidden&&e._stacked&&{keys:Ts(i,!0),values:null})(e,i,this.chart),h={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY},{min:c,max:d}=function(t){const{min:e,max:i,minDefined:s,maxDefined:n}=t.getUserBounds();return{min:s?e:Number.NEGATIVE_INFINITY,max:n?i:Number.POSITIVE_INFINITY}}(r);let u,f;function g(){f=s[u];const e=f[r.axis];return!a(f[t.axis])||c>e||d<e}for(u=0;u<o&&(g()||(this.updateRangeFromParsed(h,t,f,l),!n));++u);if(n)for(u=o-1;u>=0;--u)if(!g()){this.updateRangeFromParsed(h,t,f,l);break}return h}getAllParsedValues(t){const e=this._cachedMeta._parsed,i=[];let s,n,o;for(s=0,n=e.length;s<n;++s)o=e[s][t.axis],a(o)&&i.push(o);return i}getMaxOverflow(){return!1}getLabelAndValue(t){const e=this._cachedMeta,i=e.iScale,s=e.vScale,n=this.getParsed(t);return{label:i?\"\"+i.getLabelForValue(n[i.axis]):\"\",value:s?\"\"+s.getLabelForValue(n[s.axis]):\"\"}}_update(t){const e=this._cachedMeta;this.update(t||\"default\"),e._clip=function(t){let e,i,s,n;return o(t)?(e=t.top,i=t.right,s=t.bottom,n=t.left):e=i=s=n=t,{top:e,right:i,bottom:s,left:n,disabled:!1===t}}(l(this.options.clip,function(t,e,i){if(!1===i)return!1;const s=As(t,i),n=As(e,i);return{top:n.end,right:s.end,bottom:n.start,left:s.start}}(e.xScale,e.yScale,this.getMaxOverflow())))}update(t){}draw(){const t=this._ctx,e=this.chart,i=this._cachedMeta,s=i.data||[],n=e.chartArea,o=[],a=this._drawStart||0,r=this._drawCount||s.length-a,l=this.options.drawActiveElementsOnTop;let h;for(i.dataset&&i.dataset.draw(t,n,a,r),h=a;h<a+r;++h){const e=s[h];e.hidden||(e.active&&l?o.push(e):e.draw(t,n))}for(h=0;h<o.length;++h)o[h].draw(t,n)}getStyle(t,e){const i=e?\"active\":\"default\";return void 0===t&&this._cachedMeta.dataset?this.resolveDatasetElementOptions(i):this.resolveDataElementOptions(t||0,i)}getContext(t,e,i){const s=this.getDataset();let n;if(t>=0&&t<this._cachedMeta.data.length){const e=this._cachedMeta.data[t];n=e.$context||(e.$context=function(t,e,i){return Ci(t,{active:!1,dataIndex:e,parsed:void 0,raw:void 0,element:i,index:e,mode:\"default\",type:\"data\"})}(this.getContext(),t,e)),n.parsed=this.getParsed(t),n.raw=s.data[t],n.index=n.dataIndex=t}else n=this.$context||(this.$context=function(t,e){return Ci(t,{active:!1,dataset:void 0,datasetIndex:e,index:e,mode:\"default\",type:\"dataset\"})}(this.chart.getContext(),this.index)),n.dataset=s,n.index=n.datasetIndex=this.index;return n.active=!!e,n.mode=i,n}resolveDatasetElementOptions(t){return this._resolveElementOptions(this.datasetElementType.id,t)}resolveDataElementOptions(t,e){return this._resolveElementOptions(this.dataElementType.id,e,t)}_resolveElementOptions(t,e=\"default\",i){const s=\"active\"===e,n=this._cachedDataOpts,o=t+\"-\"+e,a=n[o],r=this.enableOptionSharing&&k(i);if(a)return Ws(a,r);const l=this.chart.config,h=l.datasetElementScopeKeys(this._type,t),c=s?[`${t}Hover`,\"hover\",t,\"\"]:[t,\"\"],d=l.getOptionScopes(this.getDataset(),h),u=Object.keys(ue.elements[t]),f=l.resolveNamedOptions(d,u,(()=>this.getContext(i,s,e)),c);return f.$shared&&(f.$shared=r,n[o]=Object.freeze(Ws(f,r))),f}_resolveAnimations(t,e,i){const s=this.chart,n=this._cachedDataOpts,o=`animation-${e}`,a=n[o];if(a)return a;let r;if(!1!==s.options.animation){const s=this.chart.config,n=s.datasetAnimationScopeKeys(this._type,e),o=s.getOptionScopes(this.getDataset(),n);r=s.createResolver(o,this.getContext(t,i,e))}const l=new Os(s,r&&r.animations);return r&&r._cacheable&&(n[o]=Object.freeze(l)),l}getSharedOptions(t){if(t.$shared)return this._sharedOptions||(this._sharedOptions=Object.assign({},t))}includeOptions(t,e){return!e||Bs(t)||this.chart._animationsDisabled}_getSharedOptions(t,e){const i=this.resolveDataElementOptions(t,e),s=this._sharedOptions,n=this.getSharedOptions(i),o=this.includeOptions(e,n)||n!==s;return this.updateSharedOptions(n,e,i),{sharedOptions:n,includeOptions:o}}updateElement(t,e,i,s){Bs(s)?Object.assign(t,i):this._resolveAnimations(e,s).update(t,i)}updateSharedOptions(t,e,i){t&&!Bs(e)&&this._resolveAnimations(void 0,e).update(t,i)}_setStyle(t,e,i,s){t.active=s;const n=this.getStyle(e,s);this._resolveAnimations(e,i,s).update(t,{options:!s&&this.getSharedOptions(n)||n})}removeHoverStyle(t,e,i){this._setStyle(t,i,\"active\",!1)}setHoverStyle(t,e,i){this._setStyle(t,i,\"active\",!0)}_removeDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,\"active\",!1)}_setDatasetHoverStyle(){const t=this._cachedMeta.dataset;t&&this._setStyle(t,void 0,\"active\",!0)}_resyncElements(t){const e=this._data,i=this._cachedMeta.data;for(const[t,e,i]of this._syncList)this[t](e,i);this._syncList=[];const s=i.length,n=e.length,o=Math.min(n,s);o&&this.parse(0,o),n>s?this._insertElements(s,n-s,t):n<s&&this._removeElements(n,s-n)}_insertElements(t,e,i=!0){const s=this._cachedMeta,n=s.data,o=t+e;let a;const r=t=>{for(t.length+=e,a=t.length-1;a>=o;a--)t[a]=t[a-e]};for(r(n),a=t;a<o;++a)n[a]=new this.dataElementType;this._parsing&&r(s._parsed),this.parse(t,e),i&&this.updateElements(n,t,e,\"reset\")}updateElements(t,e,i,s){}_removeElements(t,e){const i=this._cachedMeta;if(this._parsing){const s=i._parsed.splice(t,e);i._stacked&&Vs(i,s)}i.data.splice(t,e)}_sync(t){if(this._parsing)this._syncList.push(t);else{const[e,i,s]=t;this[e](i,s)}this.chart._dataChanges.push([this.index,...t])}_onDataPush(){const t=arguments.length;this._sync([\"_insertElements\",this.getDataset().data.length-t,t])}_onDataPop(){this._sync([\"_removeElements\",this._cachedMeta.data.length-1,1])}_onDataShift(){this._sync([\"_removeElements\",0,1])}_onDataSplice(t,e){e&&this._sync([\"_removeElements\",t,e]);const i=arguments.length-2;i&&this._sync([\"_insertElements\",t,i])}_onDataUnshift(){this._sync([\"_insertElements\",0,arguments.length])}}class Hs{static defaults={};static defaultRoutes=void 0;x;y;active=!1;options;$animations;tooltipPosition(t){const{x:e,y:i}=this.getProps([\"x\",\"y\"],t);return{x:e,y:i}}hasValue(){return N(this.x)&&N(this.y)}getProps(t,e){const i=this.$animations;if(!e||!i)return this;const s={};return t.forEach((t=>{s[t]=i[t]&&i[t].active()?i[t]._to:this[t]})),s}}function js(t,e){const i=t.options.ticks,n=function(t){const e=t.options.offset,i=t._tickSize(),s=t._length/i+(e?0:1),n=t._maxLength/i;return Math.floor(Math.min(s,n))}(t),o=Math.min(i.maxTicksLimit||n,n),a=i.major.enabled?function(t){const e=[];let i,s;for(i=0,s=t.length;i<s;i++)t[i].major&&e.push(i);return e}(e):[],r=a.length,l=a[0],h=a[r-1],c=[];if(r>o)return function(t,e,i,s){let n,o=0,a=i[0];for(s=Math.ceil(s),n=0;n<t.length;n++)n===a&&(e.push(t[n]),o++,a=i[o*s])}(e,c,a,r/o),c;const d=function(t,e,i){const s=function(t){const e=t.length;let i,s;if(e<2)return!1;for(s=t[0],i=1;i<e;++i)if(t[i]-t[i-1]!==s)return!1;return s}(t),n=e.length/i;if(!s)return Math.max(n,1);const o=W(s);for(let t=0,e=o.length-1;t<e;t++){const e=o[t];if(e>n)return e}return Math.max(n,1)}(a,e,o);if(r>0){let t,i;const n=r>1?Math.round((h-l)/(r-1)):null;for($s(e,c,d,s(n)?0:l-n,l),t=0,i=r-1;t<i;t++)$s(e,c,d,a[t],a[t+1]);return $s(e,c,d,h,s(n)?e.length:h+n),c}return $s(e,c,d),c}function $s(t,e,i,s,n){const o=l(s,0),a=Math.min(l(n,t.length),t.length);let r,h,c,d=0;for(i=Math.ceil(i),n&&(r=n-s,i=r/Math.floor(r/i)),c=o;c<0;)d++,c=Math.round(o+d*i);for(h=Math.max(o,0);h<a;h++)h===c&&(e.push(t[h]),d++,c=Math.round(o+d*i))}const Ys=(t,e,i)=>\"top\"===e||\"left\"===e?t[e]+i:t[e]-i,Us=(t,e)=>Math.min(e||t,t);function Xs(t,e){const i=[],s=t.length/e,n=t.length;let o=0;for(;o<n;o+=s)i.push(t[Math.floor(o)]);return i}function qs(t,e,i){const s=t.ticks.length,n=Math.min(e,s-1),o=t._startPixel,a=t._endPixel,r=1e-6;let l,h=t.getPixelForTick(n);if(!(i&&(l=1===s?Math.max(h-o,a-h):0===e?(t.getPixelForTick(1)-h)/2:(h-t.getPixelForTick(n-1))/2,h+=n<e?l:-l,h<o-r||h>a+r)))return h}function Ks(t){return t.drawTicks?t.tickLength:0}function Gs(t,e){if(!t.display)return 0;const i=Si(t.font,e),s=ki(t.padding);return(n(t.text)?t.text.length:1)*i.lineHeight+s.height}function Zs(t,e,i){let s=ut(t);return(i&&\"right\"!==e||!i&&\"right\"===e)&&(s=(t=>\"left\"===t?\"right\":\"right\"===t?\"left\":t)(s)),s}class Js extends Hs{constructor(t){super(),this.id=t.id,this.type=t.type,this.options=void 0,this.ctx=t.ctx,this.chart=t.chart,relay-node.invalid=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this._margins={left:0,right:0,top:0,bottom:0},this.maxWidth=void 0,this.maxHeight=void 0,this.paddingTop=void 0,this.paddingBottom=void 0,this.paddingLeft=void 0,this.paddingRight=void 0,this.axis=void 0,this.labelRotation=void 0,this.min=void 0,this.max=void 0,this._range=void 0,this.ticks=[],this._gridLineItems=null,this._labelItems=null,this._labelSizes=null,this._length=0,this._maxLength=0,this._longestTextCache={},this._startPixel=void 0,this._endPixel=void 0,this._reversePixels=!1,this._userMax=void 0,this._userMin=void 0,this._suggestedMax=void 0,this._suggestedMin=void 0,this._ticksLength=0,this._borderValue=0,this._cache={},this._dataLimitsCached=!1,this.$context=void 0}init(t){this.options=t.setContext(this.getContext()),this.axis=t.axis,this._userMin=this.parse(t.min),this._userMax=this.parse(t.max),this._suggestedMin=this.parse(t.suggestedMin),this._suggestedMax=this.parse(t.suggestedMax)}parse(t,e){return t}getUserBounds(){let{_userMin:t,_userMax:e,_suggestedMin:i,_suggestedMax:s}=this;return t=r(t,Number.POSITIVE_INFINITY),e=r(e,Number.NEGATIVE_INFINITY),i=r(i,Number.POSITIVE_INFINITY),s=r(s,Number.NEGATIVE_INFINITY),{min:r(t,i),max:r(e,s),minDefined:a(t),maxDefined:a(e)}}getMinMax(t){let e,{min:i,max:s,minDefined:n,maxDefined:o}=this.getUserBounds();if(n&&o)return{min:i,max:s};const a=this.getMatchingVisibleMetas();for(let r=0,l=a.length;r<l;++r)e=a[r].controller.getMinMax(this,t),n||(i=Math.min(i,e.min)),o||(s=Math.max(s,e.max));return i=o&&i>s?s:i,s=n&&i>s?i:s,{min:r(i,r(s,i)),max:r(s,r(i,s))}}getPadding(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}}getTicks(){return this.ticks}getLabels(){const t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels||[]}getLabelItems(t=this.chart.chartArea){return this._labelItems||(this._labelItems=this._computeLabelItems(t))}beforeLayout(){this._cache={},this._dataLimitsCached=!1}beforeUpdate(){d(this.options.beforeUpdate,[this])}update(t,e,i){const{beginAtZero:s,grace:n,ticks:o}=this.options,a=o.sampleSize;this.beforeUpdate(),this.maxWidth=t,this.maxHeight=e,this._margins=i=Object.assign({left:0,right:0,top:0,bottom:0},i),this.ticks=null,this._labelSizes=null,this._gridLineItems=null,this._labelItems=null,this.beforeSetDimensions(),this.setDimensions(),this.afterSetDimensions(),this._maxLength=this.isHorizontal()?this.width+i.left+i.right:this.height+i.top+i.bottom,this._dataLimitsCached||(this.beforeDataLimits(),this.determineDataLimits(),this.afterDataLimits(),this._range=Di(this,n,s),this._dataLimitsCached=!0),this.beforeBuildTicks(),this.ticks=this.buildTicks()||[],this.afterBuildTicks();const r=a<this.ticks.length;this._convertTicksToLabels(r?Xs(this.ticks,a):this.ticks),this.configure(),this.beforeCalculateLabelRotation(),this.calculateLabelRotation(),this.afterCalculateLabelRotation(),o.display&&(o.autoSkip||\"auto\"===o.source)&&(this.ticks=js(this,this.ticks),this._labelSizes=null,this.afterAutoSkip()),r&&this._convertTicksToLabels(this.ticks),this.beforeFit(),this.fit(),this.afterFit(),this.afterUpdate()}configure(){let t,e,i=this.options.reverse;this.isHorizontal()?(t=this.left,e=this.right):(t=relay-node.invalid,e=this.bottom,i=!i),this._startPixel=t,this._endPixel=e,this._reversePixels=i,this._length=e-t,this._alignToPixels=this.options.alignToPixels}afterUpdate(){d(this.options.afterUpdate,[this])}beforeSetDimensions(){d(this.options.beforeSetDimensions,[this])}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=0,this.right=this.width):(this.height=this.maxHeight,relay-node.invalid=0,this.bottom=this.height),this.paddingLeft=0,this.paddingTop=0,this.paddingRight=0,this.paddingBottom=0}afterSetDimensions(){d(this.options.afterSetDimensions,[this])}_callHooks(t){this.chart.notifyPlugins(t,this.getContext()),d(this.options[t],[this])}beforeDataLimits(){this._callHooks(\"beforeDataLimits\")}determineDataLimits(){}afterDataLimits(){this._callHooks(\"afterDataLimits\")}beforeBuildTicks(){this._callHooks(\"beforeBuildTicks\")}buildTicks(){return[]}afterBuildTicks(){this._callHooks(\"afterBuildTicks\")}beforeTickToLabelConversion(){d(this.options.beforeTickToLabelConversion,[this])}generateTickLabels(t){const e=this.options.ticks;let i,s,n;for(i=0,s=t.length;i<s;i++)n=t[i],n.label=d(e.callback,[n.value,i,t],this)}afterTickToLabelConversion(){d(this.options.afterTickToLabelConversion,[this])}beforeCalculateLabelRotation(){d(this.options.beforeCalculateLabelRotation,[this])}calculateLabelRotation(){const t=this.options,e=t.ticks,i=Us(this.ticks.length,t.ticks.maxTicksLimit),s=e.minRotation||0,n=e.maxRotation;let o,a,r,l=s;if(!this._isVisible()||!e.display||s>=n||i<=1||!this.isHorizontal())return void(this.labelRotation=s);const h=this._getLabelSizes(),c=h.widest.width,d=h.highest.height,u=J(this.chart.width-c,0,this.maxWidth);o=t.offset?this.maxWidth/i:u/(i-1),c+6>o&&(o=u/(i-(t.offset?.5:1)),a=this.maxHeight-Ks(t.grid)-e.padding-Gs(t.title,this.chart.options.font),r=Math.sqrt(c*c+d*d),l=Y(Math.min(Math.asin(J((h.highest.height+6)/o,-1,1)),Math.asin(J(a/r,-1,1))-Math.asin(J(d/r,-1,1)))),l=Math.max(s,Math.min(n,l))),this.labelRotation=l}afterCalculateLabelRotation(){d(this.options.afterCalculateLabelRotation,[this])}afterAutoSkip(){}beforeFit(){d(this.options.beforeFit,[this])}fit(){const t={width:0,height:0},{chart:e,options:{ticks:i,title:s,grid:n}}=this,o=this._isVisible(),a=this.isHorizontal();if(o){const o=Gs(s,e.options.font);if(a?(t.width=this.maxWidth,t.height=Ks(n)+o):(t.height=this.maxHeight,t.width=Ks(n)+o),i.display&&this.ticks.length){const{first:e,last:s,widest:n,highest:o}=this._getLabelSizes(),r=2*i.padding,l=$(this.labelRotation),h=Math.cos(l),c=Math.sin(l);if(a){const e=i.mirror?0:c*n.width+h*o.height;t.height=Math.min(this.maxHeight,t.height+e+r)}else{const e=i.mirror?0:h*n.width+c*o.height;t.width=Math.min(this.maxWidth,t.width+e+r)}this._calculatePadding(e,s,c,h)}}this._handleMargins(),a?(this.width=this._length=e.width-this._margins.left-this._margins.right,this.height=t.height):(this.width=t.width,this.height=this._length=e.height-this._margins.top-this._margins.bottom)}_calculatePadding(t,e,i,s){const{ticks:{align:n,padding:o},position:a}=this.options,r=0!==this.labelRotation,l=\"top\"!==a&&\"x\"===this.axis;if(this.isHorizontal()){const a=this.getPixelForTick(0)-this.left,h=this.right-this.getPixelForTick(this.ticks.length-1);let c=0,d=0;r?l?(c=s*t.width,d=i*e.height):(c=i*t.height,d=s*e.width):\"start\"===n?d=e.width:\"end\"===n?c=t.width:\"inner\"!==n&&(c=t.width/2,d=e.width/2),this.paddingLeft=Math.max((c-a+o)*this.width/(this.width-a),0),this.paddingRight=Math.max((d-h+o)*this.width/(this.width-h),0)}else{let i=e.height/2,s=t.height/2;\"start\"===n?(i=0,s=t.height):\"end\"===n&&(i=e.height,s=0),this.paddingTop=i+o,this.paddingBottom=s+o}}_handleMargins(){this._margins&&(this._margins.left=Math.max(this.paddingLeft,this._margins.left),this._margins.top=Math.max(this.paddingTop,this._margins.top),this._margins.right=Math.max(this.paddingRight,this._margins.right),this._margins.bottom=Math.max(this.paddingBottom,this._margins.bottom))}afterFit(){d(this.options.afterFit,[this])}isHorizontal(){const{axis:t,position:e}=this.options;return\"top\"===e||\"bottom\"===e||\"x\"===t}isFullSize(){return this.options.fullSize}_convertTicksToLabels(t){let e,i;for(this.beforeTickToLabelConversion(),this.generateTickLabels(t),e=0,i=t.length;e<i;e++)s(t[e].label)&&(t.splice(e,1),i--,e--);this.afterTickToLabelConversion()}_getLabelSizes(){let t=this._labelSizes;if(!t){const e=this.options.ticks.sampleSize;let i=this.ticks;e<i.length&&(i=Xs(i,e)),this._labelSizes=t=this._computeLabelSizes(i,i.length,this.options.ticks.maxTicksLimit)}return t}_computeLabelSizes(t,e,i){const{ctx:o,_longestTextCache:a}=this,r=[],l=[],h=Math.floor(e/Us(e,i));let c,d,f,g,p,m,b,x,_,y,v,M=0,w=0;for(c=0;c<e;c+=h){if(g=t[c].label,p=this._resolveTickFontOptions(c),o.font=m=p.string,b=a[m]=a[m]||{data:{},gc:[]},x=p.lineHeight,_=y=0,s(g)||n(g)){if(n(g))for(d=0,f=g.length;d<f;++d)v=g[d],s(v)||n(v)||(_=Ce(o,b.data,b.gc,_,v),y+=x)}else _=Ce(o,b.data,b.gc,_,g),y=x;r.push(_),l.push(y),M=Math.max(_,M),w=Math.max(y,w)}!function(t,e){u(t,(t=>{const i=t.gc,s=i.length/2;let n;if(s>e){for(n=0;n<s;++n)delete t.data[i[n]];i.splice(0,s)}}))}(a,e);const k=r.indexOf(M),S=l.indexOf(w),P=t=>({width:r[t]||0,height:l[t]||0});return{first:P(0),last:P(e-1),widest:P(k),highest:P(S),widths:r,heights:l}}getLabelForValue(t){return t}getPixelForValue(t,e){return NaN}getValueForPixel(t){}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getPixelForDecimal(t){this._reversePixels&&(t=1-t);const e=this._startPixel+t*this._length;return Q(this._alignToPixels?Ae(this.chart,e,0):e)}getDecimalForPixel(t){const e=(t-this._startPixel)/this._length;return this._reversePixels?1-e:e}getBasePixel(){return this.getPixelForValue(this.getBaseValue())}getBaseValue(){const{min:t,max:e}=this;return t<0&&e<0?e:t>0&&e>0?t:0}getContext(t){const e=this.ticks||[];if(t>=0&&t<e.length){const i=e[t];return i.$context||(i.$context=function(t,e,i){return Ci(t,{tick:i,index:e,type:\"tick\"})}(this.getContext(),t,i))}return this.$context||(this.$context=Ci(this.chart.getContext(),{scale:this,type:\"scale\"}))}_tickSize(){const t=this.options.ticks,e=$(this.labelRotation),i=Math.abs(Math.cos(e)),s=Math.abs(Math.sin(e)),n=this._getLabelSizes(),o=t.autoSkipPadding||0,a=n?n.widest.width+o:0,r=n?n.highest.height+o:0;return this.isHorizontal()?r*i>a*s?a/i:r/s:r*s<a*i?r/i:a/s}_isVisible(){const t=this.options.display;return\"auto\"!==t?!!t:this.getMatchingVisibleMetas().length>0}_computeGridLineItems(t){const e=this.axis,i=this.chart,s=this.options,{grid:n,position:a,border:r}=s,h=n.offset,c=this.isHorizontal(),d=this.ticks.length+(h?1:0),u=Ks(n),f=[],g=r.setContext(this.getContext()),p=g.display?g.width:0,m=p/2,b=function(t){return Ae(i,t,p)};let x,_,y,v,M,w,k,S,P,D,C,O;if(\"top\"===a)x=b(this.bottom),w=this.bottom-u,S=x-m,D=b(t.top)+m,O=t.bottom;else if(\"bottom\"===a)x=b(relay-node.invalid),D=t.top,O=b(t.bottom)-m,w=x+m,S=relay-node.invalid+u;else if(\"left\"===a)x=b(this.right),M=this.right-u,k=x-m,P=b(t.left)+m,C=t.right;else if(\"right\"===a)x=b(this.left),P=t.left,C=b(t.right)-m,M=x+m,k=this.left+u;else if(\"x\"===e){if(\"center\"===a)x=b((t.top+t.bottom)/2+.5);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}D=t.top,O=t.bottom,w=x+m,S=w+u}else if(\"y\"===e){if(\"center\"===a)x=b((t.left+t.right)/2);else if(o(a)){const t=Object.keys(a)[0],e=a[t];x=b(this.chart.scales[t].getPixelForValue(e))}M=x-m,k=M-u,P=t.left,C=t.right}const A=l(s.ticks.maxTicksLimit,d),T=Math.max(1,Math.ceil(d/A));for(_=0;_<d;_+=T){const t=this.getContext(_),e=n.setContext(t),s=r.setContext(t),o=e.lineWidth,a=e.color,l=s.dash||[],d=s.dashOffset,u=e.tickWidth,g=e.tickColor,p=e.tickBorderDash||[],m=e.tickBorderDashOffset;y=qs(this,_,h),void 0!==y&&(v=Ae(i,y,o),c?M=k=P=C=v:w=S=D=O=v,f.push({tx1:M,ty1:w,tx2:k,ty2:S,x1:P,y1:D,x2:C,y2:O,width:o,color:a,borderDash:l,borderDashOffset:d,tickWidth:u,tickColor:g,tickBorderDash:p,tickBorderDashOffset:m}))}return this._ticksLength=d,this._borderValue=x,f}_computeLabelItems(t){const e=this.axis,i=this.options,{position:s,ticks:a}=i,r=this.isHorizontal(),l=this.ticks,{align:h,crossAlign:c,padding:d,mirror:u}=a,f=Ks(i.grid),g=f+d,p=u?-d:g,m=-$(this.labelRotation),b=[];let x,_,y,v,M,w,k,S,P,D,C,O,A=\"middle\";if(\"top\"===s)w=this.bottom-p,k=this._getXAxisLabelAlignment();else if(\"bottom\"===s)w=relay-node.invalid+p,k=this._getXAxisLabelAlignment();else if(\"left\"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if(\"right\"===s){const t=this._getYAxisLabelAlignment(f);k=t.textAlign,M=t.x}else if(\"x\"===e){if(\"center\"===s)w=(t.top+t.bottom)/2+g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];w=this.chart.scales[t].getPixelForValue(e)+g}k=this._getXAxisLabelAlignment()}else if(\"y\"===e){if(\"center\"===s)M=(t.left+t.right)/2-g;else if(o(s)){const t=Object.keys(s)[0],e=s[t];M=this.chart.scales[t].getPixelForValue(e)}k=this._getYAxisLabelAlignment(f).textAlign}\"y\"===e&&(\"start\"===h?A=\"top\":\"end\"===h&&(A=\"bottom\"));const T=this._getLabelSizes();for(x=0,_=l.length;x<_;++x){y=l[x],v=y.label;const t=a.setContext(this.getContext(x));S=this.getPixelForTick(x)+a.labelOffset,P=this._resolveTickFontOptions(x),D=P.lineHeight,C=n(v)?v.length:1;const e=C/2,i=t.color,o=t.textStrokeColor,h=t.textStrokeWidth;let d,f=k;if(r?(M=S,\"inner\"===k&&(f=x===_-1?this.options.reverse?\"left\":\"right\":0===x?this.options.reverse?\"right\":\"left\":\"center\"),O=\"top\"===s?\"near\"===c||0!==m?-C*D+D/2:\"center\"===c?-T.highest.height/2-e*D+D:-T.highest.height+D/2:\"near\"===c||0!==m?D/2:\"center\"===c?T.highest.height/2-e*D:T.highest.height-C*D,u&&(O*=-1),0===m||t.showLabelBackdrop||(M+=D/2*Math.sin(m))):(w=S,O=(1-C)*D/2),t.showLabelBackdrop){const e=ki(t.backdropPadding),i=T.heights[x],s=T.widths[x];let n=relay-node.invalid,o=0-e.left;switch(A){case\"middle\":n-=i/2;break;case\"bottom\":n-=i}switch(k){case\"center\":o-=s/2;break;case\"right\":o-=s;break;case\"inner\":x===_-1?o-=s:x>0&&(o-=s/2)}d={left:o,top:n,width:s+e.width,height:i+e.height,color:t.backdropColor}}b.push({label:v,font:P,textOffset:O,options:{rotation:m,color:i,strokeColor:o,strokeWidth:h,textAlign:f,textBaseline:A,translation:[M,w],backdrop:d}})}return b}_getXAxisLabelAlignment(){const{position:t,ticks:e}=this.options;if(-$(this.labelRotation))return\"top\"===t?\"left\":\"right\";let i=\"center\";return\"start\"===e.align?i=\"left\":\"end\"===e.align?i=\"right\":\"inner\"===e.align&&(i=\"inner\"),i}_getYAxisLabelAlignment(t){const{position:e,ticks:{crossAlign:i,mirror:s,padding:n}}=this.options,o=t+n,a=this._getLabelSizes().widest.width;let r,l;return\"left\"===e?s?(l=this.right+n,\"near\"===i?r=\"left\":\"center\"===i?(r=\"center\",l+=a/2):(r=\"right\",l+=a)):(l=this.right-o,\"near\"===i?r=\"right\":\"center\"===i?(r=\"center\",l-=a/2):(r=\"left\",l=this.left)):\"right\"===e?s?(l=this.left+n,\"near\"===i?r=\"right\":\"center\"===i?(r=\"center\",l-=a/2):(r=\"left\",l-=a)):(l=this.left+o,\"near\"===i?r=\"left\":\"center\"===i?(r=\"center\",l+=a/2):(r=\"right\",l=this.right)):r=\"right\",{textAlign:r,x:l}}_computeLabelArea(){if(this.options.ticks.mirror)return;const t=this.chart,e=this.options.position;return\"left\"===e||\"right\"===e?{top:0,left:this.left,bottom:t.height,right:this.right}:\"top\"===e||\"bottom\"===e?{top:relay-node.invalid,left:0,bottom:this.bottom,right:t.width}:void 0}drawBackground(){const{ctx:t,options:{backgroundColor:e},left:i,top:s,width:n,height:o}=this;e&&(t.save(),t.fillStyle=e,t.fillRect(i,s,n,o),t.restore())}getLineWidthForValue(t){const e=this.options.grid;if(!this._isVisible()||!e.display)return 0;const i=this.ticks.findIndex((e=>e.value===t));if(i>=0){return e.setContext(this.getContext(i)).lineWidth}return 0}drawGrid(t){const e=this.options.grid,i=this.ctx,s=this._gridLineItems||(this._gridLineItems=this._computeGridLineItems(t));let n,o;const a=(t,e,s)=>{s.width&&s.color&&(i.save(),i.lineWidth=s.width,i.strokeStyle=s.color,i.setLineDash(s.borderDash||[]),i.lineDashOffset=s.borderDashOffset,i.beginPath(),i.moveTo(t.x,t.y),i.lineTo(e.x,e.y),i.stroke(),i.restore())};if(e.display)for(n=0,o=s.length;n<o;++n){const t=s[n];e.drawOnChartArea&&a({x:t.x1,y:t.y1},{x:t.x2,y:t.y2},t),e.drawTicks&&a({x:t.tx1,y:t.ty1},{x:t.tx2,y:t.ty2},{color:t.tickColor,width:t.tickWidth,borderDash:t.tickBorderDash,borderDashOffset:t.tickBorderDashOffset})}}drawBorder(){const{chart:t,ctx:e,options:{border:i,grid:s}}=this,n=i.setContext(this.getContext()),o=i.display?n.width:0;if(!o)return;const a=s.setContext(this.getContext(0)).lineWidth,r=this._borderValue;let l,h,c,d;this.isHorizontal()?(l=Ae(t,this.left,o)-o/2,h=Ae(t,this.right,a)+a/2,c=d=r):(c=Ae(t,relay-node.invalid,o)-o/2,d=Ae(t,this.bottom,a)+a/2,l=h=r),e.save(),e.lineWidth=n.width,e.strokeStyle=n.color,e.beginPath(),e.moveTo(l,c),e.lineTo(h,d),e.stroke(),e.restore()}drawLabels(t){if(!this.options.ticks.display)return;const e=this.ctx,i=this._computeLabelArea();i&&Ie(e,i);const s=this.getLabelItems(t);for(const t of s){const i=t.options,s=t.font;Ne(e,t.label,0,t.textOffset,s,i)}i&&ze(e)}drawTitle(){const{ctx:t,options:{position:e,title:i,reverse:s}}=this;if(!i.display)return;const a=Si(i.font),r=ki(i.padding),l=i.align;let h=a.lineHeight/2;\"bottom\"===e||\"center\"===e||o(e)?(h+=r.bottom,n(i.text)&&(h+=a.lineHeight*(i.text.length-1))):h+=r.top;const{titleX:c,titleY:d,maxWidth:u,rotation:f}=function(t,e,i,s){const{top:n,left:a,bottom:r,right:l,chart:h}=t,{chartArea:c,scales:d}=h;let u,f,g,p=0;const m=r-n,b=l-a;if(t.isHorizontal()){if(f=ft(s,a,l),o(i)){const t=Object.keys(i)[0],s=i[t];g=d[t].getPixelForValue(s)+m-e}else g=\"center\"===i?(c.bottom+c.top)/2+m-e:Ys(t,i,e);u=l-a}else{if(o(i)){const t=Object.keys(i)[0],s=i[t];f=d[t].getPixelForValue(s)-b+e}else f=\"center\"===i?(c.left+c.right)/2-b+e:Ys(t,i,e);g=ft(s,r,n),p=\"left\"===i?-E:E}return{titleX:f,titleY:g,maxWidth:u,rotation:p}}(this,h,e,l);Ne(t,i.text,0,0,a,{color:i.color,maxWidth:u,rotation:f,textAlign:Zs(l,e,s),textBaseline:\"middle\",translation:[c,d]})}draw(t){this._isVisible()&&(this.drawBackground(),this.drawGrid(t),this.drawBorder(),this.drawTitle(),this.drawLabels(t))}_layers(){const t=this.options,e=t.ticks&&t.ticks.z||0,i=l(t.grid&&t.grid.z,-1),s=l(t.border&&t.border.z,0);return this._isVisible()&&this.draw===Js.prototype.draw?[{z:i,draw:t=>{this.drawBackground(),this.drawGrid(t),this.drawTitle()}},{z:s,draw:()=>{this.drawBorder()}},{z:e,draw:t=>{this.drawLabels(t)}}]:[{z:e,draw:t=>{this.draw(t)}}]}getMatchingVisibleMetas(t){const e=this.chart.getSortedVisibleDatasetMetas(),i=this.axis+\"AxisID\",s=[];let n,o;for(n=0,o=e.length;n<o;++n){const o=e[n];o[i]!==this.id||t&&o.type!==t||s.push(o)}return s}_resolveTickFontOptions(t){return Si(this.options.ticks.setContext(this.getContext(t)).font)}_maxDigits(){const t=this._resolveTickFontOptions(0).lineHeight;return(this.isHorizontal()?this.width:this.height)/t}}class Qs{constructor(t,e,i){this.type=t,this.scope=e,this.override=i,this.items=Object.create(null)}isForType(t){return Object.prototype.isPrototypeOf.call(this.type.prototype,t.prototype)}register(t){const e=Object.getPrototypeOf(t);let i;(function(t){return\"id\"in t&&\"defaults\"in t})(e)&&(i=this.register(e));const s=this.items,n=t.id,o=this.scope+\".\"+n;if(!n)throw new Error(\"class does not have id: \"+t);return n in s||(s[n]=t,function(t,e,i){const s=b(Object.create(null),[i?ue.get(i):{},ue.get(e),t.defaults]);ue.set(e,s),t.defaultRoutes&&function(t,e){Object.keys(e).forEach((i=>{const s=i.split(\".\"),n=s.pop(),o=[t].concat(s).join(\".\"),a=e[i].split(\".\"),r=a.pop(),l=a.join(\".\");ue.route(o,n,l,r)}))}(e,t.defaultRoutes);t.descriptors&&ue.describe(e,t.descriptors)}(t,o,i),this.override&&ue.override(t.id,t.overrides)),o}get(t){return this.items[t]}unregister(t){const e=this.items,i=t.id,s=this.scope;i in e&&delete e[i],s&&i in ue[s]&&(delete ue[s][i],this.override&&delete re[i])}}class tn{constructor(){this.controllers=new Qs(Ns,\"datasets\",!0),this.elements=new Qs(Hs,\"elements\"),this.plugins=new Qs(Object,\"plugins\"),this.scales=new Qs(Js,\"scales\"),this._typedRegistries=[this.controllers,this.scales,this.elements]}add(...t){this._each(\"register\",t)}remove(...t){this._each(\"unregister\",t)}addControllers(...t){this._each(\"register\",t,this.controllers)}addElements(...t){this._each(\"register\",t,this.elements)}addPlugins(...t){this._each(\"register\",t,this.plugins)}addScales(...t){this._each(\"register\",t,this.scales)}getController(t){return this._get(t,this.controllers,\"controller\")}getElement(t){return this._get(t,this.elements,\"element\")}getPlugin(t){return this._get(t,this.plugins,\"plugin\")}getScale(t){return this._get(t,this.scales,\"scale\")}removeControllers(...t){this._each(\"unregister\",t,this.controllers)}removeElements(...t){this._each(\"unregister\",t,this.elements)}removePlugins(...t){this._each(\"unregister\",t,this.plugins)}removeScales(...t){this._each(\"unregister\",t,this.scales)}_each(t,e,i){[...e].forEach((e=>{const s=i||this._getRegistryForType(e);i||s.isForType(e)||s===this.plugins&&e.id?this._exec(t,s,e):u(e,(e=>{const s=i||this._getRegistryForType(e);this._exec(t,s,e)}))}))}_exec(t,e,i){const s=w(t);d(i[\"before\"+s],[],i),e[t](i),d(i[\"after\"+s],[],i)}_getRegistryForType(t){for(let e=0;e<this._typedRegistries.length;e++){const i=this._typedRegistries[e];if(i.isForType(t))return i}return this.plugins}_get(t,e,i){const s=e.get(t);if(void 0===s)throw new Error('\"'+t+'\" is not a registered '+i+\".\");return s}}var en=new tn;class sn{constructor(){this._init=[]}notify(t,e,i,s){\"beforeInit\"===e&&(this._init=this._createDescriptors(t,!0),this._notify(this._init,t,\"install\"));const n=s?this._descriptors(t).filter(s):this._descriptors(t),o=this._notify(n,t,e,i);return\"afterDestroy\"===e&&(this._notify(n,t,\"stop\"),this._notify(this._init,t,\"uninstall\")),o}_notify(t,e,i,s){s=s||{};for(const n of t){const t=n.plugin;if(!1===d(t[i],[e,s,n.options],t)&&s.cancelable)return!1}return!0}invalidate(){s(this._cache)||(this._oldCache=this._cache,this._cache=void 0)}_descriptors(t){if(this._cache)return this._cache;const e=this._cache=this._createDescriptors(t);return this._notifyStateChanges(t),e}_createDescriptors(t,e){const i=t&&t.config,s=l(i.options&&i.options.plugins,{}),n=function(t){const e={},i=[],s=Object.keys(en.plugins.items);for(let t=0;t<s.length;t++)i.push(en.getPlugin(s[t]));const n=t.plugins||[];for(let t=0;t<n.length;t++){const s=n[t];-1===i.indexOf(s)&&(i.push(s),e[s.id]=!0)}return{plugins:i,localIds:e}}(i);return!1!==s||e?function(t,{plugins:e,localIds:i},s,n){const o=[],a=t.getContext();for(const r of e){const e=r.id,l=nn(s[e],n);null!==l&&o.push({plugin:r,options:on(t.config,{plugin:r,local:i[e]},l,a)})}return o}(t,n,s,e):[]}_notifyStateChanges(t){const e=this._oldCache||[],i=this._cache,s=(t,e)=>t.filter((t=>!e.some((e=>t.plugin.id===e.plugin.id))));this._notify(s(e,i),t,\"stop\"),this._notify(s(i,e),t,\"start\")}}function nn(t,e){return e||!1!==t?!0===t?{}:t:null}function on(t,{plugin:e,local:i},s,n){const o=t.pluginScopeKeys(e),a=t.getOptionScopes(s,o);return i&&e.defaults&&a.push(e.defaults),t.createResolver(a,n,[\"\"],{scriptable:!1,indexable:!1,allKeys:!0})}function an(t,e){const i=ue.datasets[t]||{};return((e.datasets||{})[t]||{}).indexAxis||e.indexAxis||i.indexAxis||\"x\"}function rn(t){if(\"x\"===t||\"y\"===t||\"r\"===t)return t}function ln(t,...e){if(rn(t))return t;for(const s of e){const e=s.axis||(\"top\"===(i=s.position)||\"bottom\"===i?\"x\":\"left\"===i||\"right\"===i?\"y\":void 0)||t.length>1&&rn(t[0].toLowerCase());if(e)return e}var i;throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`)}function hn(t,e,i){if(i[e+\"AxisID\"]===t)return{axis:e}}function cn(t,e){const i=re[t.type]||{scales:{}},s=e.scales||{},n=an(t.type,e),a=Object.create(null);return Object.keys(s).forEach((e=>{const r=s[e];if(!o(r))return console.error(`Invalid scale configuration for scale: ${e}`);if(r._proxy)return console.warn(`Ignoring resolver passed as options for scale: ${e}`);const l=ln(e,r,function(t,e){if(e.data&&e.data.datasets){const i=e.data.datasets.filter((e=>e.xAxisID===t||e.yAxisID===t));if(i.length)return hn(t,\"x\",i[0])||hn(t,\"y\",i[0])}return{}}(e,t),ue.scales[r.type]),h=function(t,e){return t===e?\"_index_\":\"_value_\"}(l,n),c=i.scales||{};a[e]=x(Object.create(null),[{axis:l},r,c[l],c[h]])})),t.data.datasets.forEach((i=>{const n=i.type||t.type,o=i.indexAxis||an(n,e),r=(re[n]||{}).scales||{};Object.keys(r).forEach((t=>{const e=function(t,e){let i=t;return\"_index_\"===t?i=e:\"_value_\"===t&&(i=\"x\"===e?\"y\":\"x\"),i}(t,o),n=i[e+\"AxisID\"]||e;a[n]=a[n]||Object.create(null),x(a[n],[{axis:e},s[n],r[t]])}))})),Object.keys(a).forEach((t=>{const e=a[t];x(e,[ue.scales[e.type],ue.scale])})),a}function dn(t){const e=t.options||(t.options={});e.plugins=l(e.plugins,{}),e.scales=cn(t,e)}function un(t){return(t=t||{}).datasets=t.datasets||[],t.labels=t.labels||[],t}const fn=new Map,gn=new Set;function pn(t,e){let i=fn.get(t);return i||(i=e(),fn.set(t,i),gn.add(i)),i}const mn=(t,e,i)=>{const s=M(e,i);void 0!==s&&t.add(s)};class bn{constructor(t){this._config=function(t){return(t=t||{}).data=un(t.data),dn(t),t}(t),this._scopeCache=new Map,this._resolverCache=new Map}get platform(){return this._config.platform}get type(){return this._config.type}set type(t){this._config.type=t}get data(){return this._config.data}set data(t){this._config.data=un(t)}get options(){return this._config.options}set options(t){this._config.options=t}get plugins(){return this._config.plugins}update(){const t=this._config;this.clearCache(),dn(t)}clearCache(){this._scopeCache.clear(),this._resolverCache.clear()}datasetScopeKeys(t){return pn(t,(()=>[[`datasets.${t}`,\"\"]]))}datasetAnimationScopeKeys(t,e){return pn(`${t}.transition.${e}`,(()=>[[`datasets.${t}.transitions.${e}`,`transitions.${e}`],[`datasets.${t}`,\"\"]]))}datasetElementScopeKeys(t,e){return pn(`${t}-${e}`,(()=>[[`datasets.${t}.elements.${e}`,`datasets.${t}`,`elements.${e}`,\"\"]]))}pluginScopeKeys(t){const e=t.id;return pn(`${this.type}-plugin-${e}`,(()=>[[`plugins.${e}`,...t.additionalOptionScopes||[]]]))}_cachedScopes(t,e){const i=this._scopeCache;let s=i.get(t);return s&&!e||(s=new Map,i.set(t,s)),s}getOptionScopes(t,e,i){const{options:s,type:n}=this,o=this._cachedScopes(t,i),a=o.get(e);if(a)return a;const r=new Set;e.forEach((e=>{t&&(r.add(t),e.forEach((e=>mn(r,t,e)))),e.forEach((t=>mn(r,s,t))),e.forEach((t=>mn(r,re[n]||{},t))),e.forEach((t=>mn(r,ue,t))),e.forEach((t=>mn(r,le,t)))}));const l=Array.from(r);return 0===l.length&&l.push(Object.create(null)),gn.has(e)&&o.set(e,l),l}chartOptionScopes(){const{options:t,type:e}=this;return[t,re[e]||{},ue.datasets[e]||{},{type:e},ue,le]}resolveNamedOptions(t,e,i,s=[\"\"]){const o={$shared:!0},{resolver:a,subPrefixes:r}=xn(this._resolverCache,t,s);let l=a;if(function(t,e){const{isScriptable:i,isIndexable:s}=Ye(t);for(const o of e){const e=i(o),a=s(o),r=(a||e)&&t[o];if(e&&(S(r)||_n(r))||a&&n(r))return!0}return!1}(a,e)){o.$shared=!1;l=$e(a,i=S(i)?i():i,this.createResolver(t,i,r))}for(const t of e)o[t]=l[t];return o}createResolver(t,e,i=[\"\"],s){const{resolver:n}=xn(this._resolverCache,t,i);return o(e)?$e(n,e,void 0,s):n}}function xn(t,e,i){let s=t.get(e);s||(s=new Map,t.set(e,s));const n=i.join();let o=s.get(n);if(!o){o={resolver:je(e,i),subPrefixes:i.filter((t=>!t.toLowerCase().includes(\"hover\")))},s.set(n,o)}return o}const _n=t=>o(t)&&Object.getOwnPropertyNames(t).some((e=>S(t[e])));const yn=[\"top\",\"bottom\",\"left\",\"right\",\"chartArea\"];function vn(t,e){return\"top\"===t||\"bottom\"===t||-1===yn.indexOf(t)&&\"x\"===e}function Mn(t,e){return function(i,s){return i[t]===s[t]?i[e]-s[e]:i[t]-s[t]}}function wn(t){const e=t.chart,i=e.options.animation;e.notifyPlugins(\"afterRender\"),d(i&&i.onComplete,[t],e)}function kn(t){const e=t.chart,i=e.options.animation;d(i&&i.onProgress,[t],e)}function Sn(t){return fe()&&\"string\"==typeof t?t=document.getElementById(t):t&&t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas),t}const Pn={},Dn=t=>{const e=Sn(t);return Object.values(Pn).filter((t=>t.canvas===e)).pop()};function Cn(t,e,i){const s=Object.keys(t);for(const n of s){const s=+n;if(s>=e){const o=t[n];delete t[n],(i>0||s>e)&&(t[s+i]=o)}}}function On(t,e,i){return t.options.clip?t[i]:e[i]}class An{static defaults=ue;static instances=Pn;static overrides=re;static registry=en;static version=\"4.4.1\";static getChart=Dn;static register(...t){en.add(...t),Tn()}static unregister(...t){en.remove(...t),Tn()}constructor(t,e){const s=this.config=new bn(e),n=Sn(t),o=Dn(n);if(o)throw new Error(\"Canvas is already in use. Chart with ID '\"+o.id+\"' must be destroyed before the canvas with ID '\"+o.canvas.id+\"' can be reused.\");const a=s.createResolver(s.chartOptionScopes(),this.getContext());this.platform=new(s.platform||ks(n)),this.platform.updateConfig(s);const r=this.platform.acquireContext(n,a.aspectRatio),l=r&&r.canvas,h=l&&l.height,c=l&&l.width;this.id=i(),this.ctx=r,this.canvas=l,this.width=c,this.height=h,this._options=a,this._aspectRatio=this.aspectRatio,this._layers=[],this._metasets=[],this._stacks=void 0,this.boxes=[],this.currentDevicePixelRatio=void 0,this.chartArea=void 0,this._active=[],this._lastEvent=void 0,this._listeners={},this._responsiveListeners=void 0,this._sortedMetasets=[],this.scales={},this._plugins=new sn,this.$proxies={},this._hiddenIndices={},this.attached=!1,this._animationsDisabled=void 0,this.$context=void 0,this._doResize=dt((t=>this.update(t)),a.resizeDelay||0),this._dataChanges=[],Pn[this.id]=this,r&&l?(xt.listen(this,\"complete\",wn),xt.listen(this,\"progress\",kn),this._initialize(),this.attached&&this.update()):console.error(\"Failed to create chart: can't acquire context from the given item\")}get aspectRatio(){const{options:{aspectRatio:t,maintainAspectRatio:e},width:i,height:n,_aspectRatio:o}=this;return s(t)?e&&o?o:n?i/n:null:t}get data(){return this.config.data}set data(t){this.config.data=t}get options(){return this._options}set options(t){this.config.options=t}get registry(){return en}_initialize(){return this.notifyPlugins(\"beforeInit\"),this.options.responsive?this.resize():ke(this,this.options.devicePixelRatio),this.bindEvents(),this.notifyPlugins(\"afterInit\"),this}clear(){return Te(this.canvas,this.ctx),this}stop(){return xt.stop(this),this}resize(t,e){xt.running(this)?this._resizeBeforeDraw={width:t,height:e}:this._resize(t,e)}_resize(t,e){const i=this.options,s=this.canvas,n=i.maintainAspectRatio&&this.aspectRatio,o=this.platform.getMaximumSize(s,t,e,n),a=i.devicePixelRatio||this.platform.getDevicePixelRatio(),r=this.width?\"resize\":\"attach\";this.width=o.width,this.height=o.height,this._aspectRatio=this.aspectRatio,ke(this,a,!0)&&(this.notifyPlugins(\"resize\",{size:o}),d(i.onResize,[this,o],this),this.attached&&this._doResize(r)&&this.render())}ensureScalesHaveIDs(){u(this.options.scales||{},((t,e)=>{t.id=e}))}buildOrUpdateScales(){const t=this.options,e=t.scales,i=this.scales,s=Object.keys(i).reduce(((t,e)=>(t[e]=!1,t)),{});let n=[];e&&(n=n.concat(Object.keys(e).map((t=>{const i=e[t],s=ln(t,i),n=\"r\"===s,o=\"x\"===s;return{options:i,dposition:n?\"chartArea\":o?\"bottom\":\"left\",dtype:n?\"radialLinear\":o?\"category\":\"linear\"}})))),u(n,(e=>{const n=e.options,o=n.id,a=ln(o,n),r=l(n.type,e.dtype);void 0!==n.position&&vn(n.position,a)===vn(e.dposition)||(n.position=e.dposition),s[o]=!0;let h=null;if(o in i&&i[o].type===r)h=i[o];else{h=new(en.getScale(r))({id:o,type:r,ctx:this.ctx,chart:this}),i[h.id]=h}h.init(n,t)})),u(s,((t,e)=>{t||delete i[e]})),u(i,(t=>{as.configure(this,t,t.options),as.addBox(this,t)}))}_updateMetasets(){const t=this._metasets,e=this.data.datasets.length,i=t.length;if(t.sort(((t,e)=>t.index-e.index)),i>e){for(let t=e;t<i;++t)this._destroyDatasetMeta(t);t.splice(e,i-e)}this._sortedMetasets=t.slice(0).sort(Mn(\"order\",\"index\"))}_removeUnreferencedMetasets(){const{_metasets:t,data:{datasets:e}}=this;t.length>e.length&&delete this._stacks,t.forEach(((t,i)=>{0===e.filter((e=>e===t._dataset)).length&&this._destroyDatasetMeta(i)}))}buildOrUpdateControllers(){const t=[],e=this.data.datasets;let i,s;for(this._removeUnreferencedMetasets(),i=0,s=e.length;i<s;i++){const s=e[i];let n=this.getDatasetMeta(i);const o=s.type||this.config.type;if(n.type&&n.type!==o&&(this._destroyDatasetMeta(i),n=this.getDatasetMeta(i)),n.type=o,n.indexAxis=s.indexAxis||an(o,this.options),n.order=s.order||0,n.index=i,n.label=\"\"+s.label,n.visible=this.isDatasetVisible(i),n.controller)n.controller.updateIndex(i),n.controller.linkScales();else{const e=en.getController(o),{datasetElementType:s,dataElementType:a}=ue.datasets[o];Object.assign(e,{dataElementType:en.getElement(a),datasetElementType:s&&en.getElement(s)}),n.controller=new e(this,i),t.push(n.controller)}}return this._updateMetasets(),t}_resetElements(){u(this.data.datasets,((t,e)=>{this.getDatasetMeta(e).controller.reset()}),this)}reset(){this._resetElements(),this.notifyPlugins(\"reset\")}update(t){const e=this.config;e.update();const i=this._options=e.createResolver(e.chartOptionScopes(),this.getContext()),s=this._animationsDisabled=!i.animation;if(this._updateScales(),this._checkEventBindings(),this._updateHiddenIndices(),this._plugins.invalidate(),!1===this.notifyPlugins(\"beforeUpdate\",{mode:t,cancelable:!0}))return;const n=this.buildOrUpdateControllers();this.notifyPlugins(\"beforeElementsUpdate\");let o=0;for(let t=0,e=this.data.datasets.length;t<e;t++){const{controller:e}=this.getDatasetMeta(t),i=!s&&-1===n.indexOf(e);e.buildOrUpdateElements(i),o=Math.max(+e.getMaxOverflow(),o)}o=this._minPadding=i.layout.autoPadding?o:0,this._updateLayout(o),s||u(n,(t=>{t.reset()})),this._updateDatasets(t),this.notifyPlugins(\"afterUpdate\",{mode:t}),this._layers.sort(Mn(\"z\",\"_idx\"));const{_active:a,_lastEvent:r}=this;r?this._eventHandler(r,!0):a.length&&this._updateHoverStyles(a,a,!0),this.render()}_updateScales(){u(this.scales,(t=>{as.removeBox(this,t)})),this.ensureScalesHaveIDs(),this.buildOrUpdateScales()}_checkEventBindings(){const t=this.options,e=new Set(Object.keys(this._listeners)),i=new Set(t.events);P(e,i)&&!!this._responsiveListeners===t.responsive||(this.unbindEvents(),this.bindEvents())}_updateHiddenIndices(){const{_hiddenIndices:t}=this,e=this._getUniformDataChanges()||[];for(const{method:i,start:s,count:n}of e){Cn(t,s,\"_removeElements\"===i?-n:n)}}_getUniformDataChanges(){const t=this._dataChanges;if(!t||!t.length)return;this._dataChanges=[];const e=this.data.datasets.length,i=e=>new Set(t.filter((t=>t[0]===e)).map(((t,e)=>e+\",\"+t.splice(1).join(\",\")))),s=i(0);for(let t=1;t<e;t++)if(!P(s,i(t)))return;return Array.from(s).map((t=>t.split(\",\"))).map((t=>({method:t[1],start:+t[2],count:+t[3]})))}_updateLayout(t){if(!1===this.notifyPlugins(\"beforeLayout\",{cancelable:!0}))return;as.update(this,this.width,this.height,t);const e=this.chartArea,i=e.width<=0||e.height<=0;this._layers=[],u(this.boxes,(t=>{i&&\"chartArea\"===t.position||(t.configure&&t.configure(),this._layers.push(...t._layers()))}),this),this._layers.forEach(((t,e)=>{t._idx=e})),this.notifyPlugins(\"afterLayout\")}_updateDatasets(t){if(!1!==this.notifyPlugins(\"beforeDatasetsUpdate\",{mode:t,cancelable:!0})){for(let t=0,e=this.data.datasets.length;t<e;++t)this.getDatasetMeta(t).controller.configure();for(let e=0,i=this.data.datasets.length;e<i;++e)this._updateDataset(e,S(t)?t({datasetIndex:e}):t);this.notifyPlugins(\"afterDatasetsUpdate\",{mode:t})}}_updateDataset(t,e){const i=this.getDatasetMeta(t),s={meta:i,index:t,mode:e,cancelable:!0};!1!==this.notifyPlugins(\"beforeDatasetUpdate\",s)&&(i.controller._update(e),s.cancelable=!1,this.notifyPlugins(\"afterDatasetUpdate\",s))}render(){!1!==this.notifyPlugins(\"beforeRender\",{cancelable:!0})&&(xt.has(this)?this.attached&&!xt.running(this)&&xt.start(this):(this.draw(),wn({chart:this})))}draw(){let t;if(this._resizeBeforeDraw){const{width:t,height:e}=this._resizeBeforeDraw;this._resize(t,e),this._resizeBeforeDraw=null}if(this.clear(),this.width<=0||this.height<=0)return;if(!1===this.notifyPlugins(\"beforeDraw\",{cancelable:!0}))return;const e=this._layers;for(t=0;t<e.length&&e[t].z<=0;++t)e[t].draw(this.chartArea);for(this._drawDatasets();t<e.length;++t)e[t].draw(this.chartArea);this.notifyPlugins(\"afterDraw\")}_getSortedDatasetMetas(t){const e=this._sortedMetasets,i=[];let s,n;for(s=0,n=e.length;s<n;++s){const n=e[s];t&&!n.visible||i.push(n)}return i}getSortedVisibleDatasetMetas(){return this._getSortedDatasetMetas(!0)}_drawDatasets(){if(!1===this.notifyPlugins(\"beforeDatasetsDraw\",{cancelable:!0}))return;const t=this.getSortedVisibleDatasetMetas();for(let e=t.length-1;e>=0;--e)this._drawDataset(t[e]);this.notifyPlugins(\"afterDatasetsDraw\")}_drawDataset(t){const e=this.ctx,i=t._clip,s=!i.disabled,n=function(t,e){const{xScale:i,yScale:s}=t;return i&&s?{left:On(i,e,\"left\"),right:On(i,e,\"right\"),top:On(s,e,\"top\"),bottom:On(s,e,\"bottom\")}:e}(t,this.chartArea),o={meta:t,index:t.index,cancelable:!0};!1!==this.notifyPlugins(\"beforeDatasetDraw\",o)&&(s&&Ie(e,{left:!1===i.left?0:n.left-i.left,right:!1===i.right?this.width:n.right+i.right,top:!1===i.top?0:n.relay-node.invalid,bottom:!1===i.bottom?this.height:n.bottom+i.bottom}),t.controller.draw(),s&&ze(e),o.cancelable=!1,this.notifyPlugins(\"afterDatasetDraw\",o))}isPointInArea(t){return Re(t,this.chartArea,this._minPadding)}getElementsAtEventForMode(t,e,i,s){const n=Xi.modes[e];return\"function\"==typeof n?n(this,t,i,s):[]}getDatasetMeta(t){const e=this.data.datasets[t],i=this._metasets;let s=i.filter((t=>t&&t._dataset===e)).pop();return s||(s={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null,order:e&&e.order||0,index:t,_dataset:e,_parsed:[],_sorted:!1},i.push(s)),s}getContext(){return this.$context||(this.$context=Ci(null,{chart:this,type:\"chart\"}))}getVisibleDatasetCount(){return this.getSortedVisibleDatasetMetas().length}isDatasetVisible(t){const e=this.data.datasets[t];if(!e)return!1;const i=this.getDatasetMeta(t);return\"boolean\"==typeof i.hidden?!i.hidden:!e.hidden}setDatasetVisibility(t,e){this.getDatasetMeta(t).hidden=!e}toggleDataVisibility(t){this._hiddenIndices[t]=!this._hiddenIndices[t]}getDataVisibility(t){return!this._hiddenIndices[t]}_updateVisibility(t,e,i){const s=i?\"show\":\"hide\",n=this.getDatasetMeta(t),o=n.controller._resolveAnimations(void 0,s);k(e)?(n.data[e].hidden=!i,this.update()):(this.setDatasetVisibility(t,i),o.update(n,{visible:i}),this.update((e=>e.datasetIndex===t?s:void 0)))}hide(t,e){this._updateVisibility(t,e,!1)}show(t,e){this._updateVisibility(t,e,!0)}_destroyDatasetMeta(t){const e=this._metasets[t];e&&e.controller&&e.controller._destroy(),delete this._metasets[t]}_stop(){let t,e;for(this.stop(),xt.remove(this),t=0,e=this.data.datasets.length;t<e;++t)this._destroyDatasetMeta(t)}destroy(){this.notifyPlugins(\"beforeDestroy\");const{canvas:t,ctx:e}=this;this._stop(),this.config.clearCache(),t&&(this.unbindEvents(),Te(t,e),this.platform.releaseContext(e),this.canvas=null,this.ctx=null),delete Pn[this.id],this.notifyPlugins(\"afterDestroy\")}toBase64Image(...t){return this.canvas.toDataURL(...t)}bindEvents(){this.bindUserEvents(),this.options.responsive?this.bindResponsiveEvents():this.attached=!0}bindUserEvents(){const t=this._listeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(t,e,i)=>{t.offsetX=e,t.offsetY=i,this._eventHandler(t)};u(this.options.events,(t=>i(t,s)))}bindResponsiveEvents(){this._responsiveListeners||(this._responsiveListeners={});const t=this._responsiveListeners,e=this.platform,i=(i,s)=>{e.addEventListener(this,i,s),t[i]=s},s=(i,s)=>{t[i]&&(e.removeEventListener(this,i,s),delete t[i])},n=(t,e)=>{this.canvas&&this.resize(t,e)};let o;const a=()=>{s(\"attach\",a),this.attached=!0,this.resize(),i(\"resize\",n),i(\"detach\",o)};o=()=>{this.attached=!1,s(\"resize\",n),this._stop(),this._resize(0,0),i(\"attach\",a)},e.isAttached(this.canvas)?a():o()}unbindEvents(){u(this._listeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._listeners={},u(this._responsiveListeners,((t,e)=>{this.platform.removeEventListener(this,e,t)})),this._responsiveListeners=void 0}updateHoverStyle(t,e,i){const s=i?\"set\":\"remove\";let n,o,a,r;for(\"dataset\"===e&&(n=this.getDatasetMeta(t[0].datasetIndex),n.controller[\"_\"+s+\"DatasetHoverStyle\"]()),a=0,r=t.length;a<r;++a){o=t[a];const e=o&&this.getDatasetMeta(o.datasetIndex).controller;e&&e[s+\"HoverStyle\"](o.element,o.datasetIndex,o.index)}}getActiveElements(){return this._active||[]}setActiveElements(t){const e=this._active||[],i=t.map((({datasetIndex:t,index:e})=>{const i=this.getDatasetMeta(t);if(!i)throw new Error(\"No dataset found at index \"+t);return{datasetIndex:t,element:i.data[e],index:e}}));!f(i,e)&&(this._active=i,this._lastEvent=null,this._updateHoverStyles(i,e))}notifyPlugins(t,e,i){return this._plugins.notify(this,t,e,i)}isPluginEnabled(t){return 1===this._plugins._cache.filter((e=>e.plugin.id===t)).length}_updateHoverStyles(t,e,i){const s=this.options.hover,n=(t,e)=>t.filter((t=>!e.some((e=>t.datasetIndex===e.datasetIndex&&t.index===e.index)))),o=n(e,t),a=i?t:n(t,e);o.length&&this.updateHoverStyle(o,s.mode,!1),a.length&&s.mode&&this.updateHoverStyle(a,s.mode,!0)}_eventHandler(t,e){const i={event:t,replay:e,cancelable:!0,inChartArea:this.isPointInArea(t)},s=e=>(e.options.events||this.options.events).includes(t.native.type);if(!1===this.notifyPlugins(\"beforeEvent\",i,s))return;const n=this._handleEvent(t,e,i.inChartArea);return i.cancelable=!1,this.notifyPlugins(\"afterEvent\",i,s),(n||i.changed)&&this.render(),this}_handleEvent(t,e,i){const{_active:s=[],options:n}=this,o=e,a=this._getActiveElements(t,s,i,o),r=D(t),l=function(t,e,i,s){return i&&\"mouseout\"!==t.type?s?e:t:null}(t,this._lastEvent,i,r);i&&(this._lastEvent=null,d(n.onHover,[t,a,this],this),r&&d(n.onClick,[t,a,this],this));const h=!f(a,s);return(h||e)&&(this._active=a,this._updateHoverStyles(a,s,e)),this._lastEvent=l,h}_getActiveElements(t,e,i,s){if(\"mouseout\"===t.type)return[];if(!i)return e;const n=this.options.hover;return this.getElementsAtEventForMode(t,n.mode,n,s)}}function Tn(){return u(An.instances,(t=>t._plugins.invalidate()))}function Ln(){throw new Error(\"This method is not implemented: Check that a complete date adapter is provided.\")}class En{static override(t){Object.assign(En.prototype,t)}options;constructor(t){this.options=t||{}}init(){}formats(){return Ln()}parse(){return Ln()}format(){return Ln()}add(){return Ln()}diff(){return Ln()}startOf(){return Ln()}endOf(){return Ln()}}var Rn={_date:En};function In(t){const e=t.iScale,i=function(t,e){if(!t._cache.$bar){const i=t.getMatchingVisibleMetas(e);let s=[];for(let e=0,n=i.length;e<n;e++)s=s.concat(i[e].controller.getAllParsedValues(t));t._cache.$bar=lt(s.sort(((t,e)=>t-e)))}return t._cache.$bar}(e,t.type);let s,n,o,a,r=e._length;const l=()=>{32767!==o&&-32768!==o&&(k(a)&&(r=Math.min(r,Math.abs(o-a)||r)),a=o)};for(s=0,n=i.length;s<n;++s)o=e.getPixelForValue(i[s]),l();for(a=void 0,s=0,n=e.ticks.length;s<n;++s)o=e.getPixelForTick(s),l();return r}function zn(t,e,i,s){return n(t)?function(t,e,i,s){const n=i.parse(t[0],s),o=i.parse(t[1],s),a=Math.min(n,o),r=Math.max(n,o);let l=a,h=r;Math.abs(a)>Math.abs(r)&&(l=r,h=a),e[i.axis]=h,e._custom={barStart:l,barEnd:h,start:n,end:o,min:a,max:r}}(t,e,i,s):e[i.axis]=i.parse(t,s),e}function Fn(t,e,i,s){const n=t.iScale,o=t.vScale,a=n.getLabels(),r=n===o,l=[];let h,c,d,u;for(h=i,c=i+s;h<c;++h)u=e[h],d={},d[n.axis]=r||n.parse(a[h],h),l.push(zn(u,d,o,h));return l}function Vn(t){return t&&void 0!==t.barStart&&void 0!==t.barEnd}function Bn(t,e,i,s){let n=e.borderSkipped;const o={};if(!n)return void(t.borderSkipped=o);if(!0===n)return void(t.borderSkipped={top:!0,right:!0,bottom:!0,left:!0});const{start:a,end:r,reverse:l,top:h,bottom:c}=function(t){let e,i,s,n,o;return t.horizontal?(e=t.base>t.x,i=\"left\",s=\"right\"):(e=t.base<t.y,i=\"bottom\",s=\"top\"),e?(n=\"end\",o=\"start\"):(n=\"start\",o=\"end\"),{start:i,end:s,reverse:e,top:n,bottom:o}}(t);\"middle\"===n&&i&&(t.enableBorderRadius=!0,(i._top||0)===s?n=h:(i._bottom||0)===s?n=c:(o[Wn(c,a,r,l)]=!0,n=h)),o[Wn(n,a,r,l)]=!0,t.borderSkipped=o}function Wn(t,e,i,s){var n,o,a;return s?(a=i,t=Nn(t=(n=t)===(o=e)?a:n===a?o:n,i,e)):t=Nn(t,e,i),t}function Nn(t,e,i){return\"start\"===t?e:\"end\"===t?i:t}function Hn(t,{inflateAmount:e},i){t.inflateAmount=\"auto\"===e?1===i?.33:0:e}class jn extends Ns{static id=\"doughnut\";static defaults={datasetElementType:!1,dataElementType:\"arc\",animation:{animateRotate:!0,animateScale:!1},animations:{numbers:{type:\"number\",properties:[\"circumference\",\"endAngle\",\"innerRadius\",\"outerRadius\",\"startAngle\",\"x\",\"y\",\"offset\",\"borderWidth\",\"spacing\"]}},cutout:\"50%\",rotation:0,circumference:360,radius:\"100%\",spacing:0,indexAxis:\"r\"};static descriptors={_scriptable:t=>\"spacing\"!==t,_indexable:t=>\"spacing\"!==t&&!t.startsWith(\"borderDash\")&&!t.startsWith(\"hoverBorderDash\")};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}}};constructor(t,e){super(t,e),this.enableOptionSharing=!0,this.innerRadius=void 0,this.outerRadius=void 0,this.offsetX=void 0,this.offsetY=void 0}linkScales(){}parse(t,e){const i=this.getDataset().data,s=this._cachedMeta;if(!1===this._parsing)s._parsed=i;else{let n,a,r=t=>+i[t];if(o(i[t])){const{key:t=\"value\"}=this._parsing;r=e=>+M(i[e],t)}for(n=t,a=t+e;n<a;++n)s._parsed[n]=r(n)}}_getRotation(){return $(this.options.rotation-90)}_getCircumference(){return $(this.options.circumference)}_getRotationExtents(){let t=O,e=-O;for(let i=0;i<this.chart.data.datasets.length;++i)if(this.chart.isDatasetVisible(i)&&this.chart.getDatasetMeta(i).type===this._type){const s=this.chart.getDatasetMeta(i).controller,n=s._getRotation(),o=s._getCircumference();t=Math.min(t,n),e=Math.max(e,n+o)}return{rotation:t,circumference:e-t}}update(t){const e=this.chart,{chartArea:i}=e,s=this._cachedMeta,n=s.data,o=this.getMaxBorderWidth()+this.getMaxOffset(n)+this.options.spacing,a=Math.max((Math.min(i.width,i.height)-o)/2,0),r=Math.min(h(this.options.cutout,a),1),l=this._getRingWeight(this.index),{circumference:d,rotation:u}=this._getRotationExtents(),{ratioX:f,ratioY:g,offsetX:p,offsetY:m}=function(t,e,i){let s=1,n=1,o=0,a=0;if(e<O){const r=t,l=r+e,h=Math.cos(r),c=Math.sin(r),d=Math.cos(l),u=Math.sin(l),f=(t,e,s)=>Z(t,r,l,!0)?1:Math.max(e,e*i,s,s*i),g=(t,e,s)=>Z(t,r,l,!0)?-1:Math.min(e,e*i,s,s*i),p=f(0,h,d),m=f(E,c,u),b=g(C,h,d),x=g(C+E,c,u);s=(p-b)/2,n=(m-x)/2,o=-(p+b)/2,a=-(m+x)/2}return{ratioX:s,ratioY:n,offsetX:o,offsetY:a}}(u,d,r),b=(i.width-o)/f,x=(i.height-o)/g,_=Math.max(Math.min(b,x)/2,0),y=c(this.options.radius,_),v=(y-Math.max(y*r,0))/this._getVisibleDatasetWeightTotal();this.offsetX=p*y,this.offsetY=m*y,s.total=this.calculateTotal(),this.outerRadius=y-v*this._getRingWeightOffset(this.index),this.innerRadius=Math.max(this.outerRadius-v*l,0),this.updateElements(n,0,n.length,t)}_circumference(t,e){const i=this.options,s=this._cachedMeta,n=this._getCircumference();return e&&i.animation.animateRotate||!this.chart.getDataVisibility(t)||null===s._parsed[t]||s.data[t].hidden?0:this.calculateCircumference(s._parsed[t]*n/O)}updateElements(t,e,i,s){const n=\"reset\"===s,o=this.chart,a=o.chartArea,r=o.options.animation,l=(a.left+a.right)/2,h=(a.top+a.bottom)/2,c=n&&r.animateScale,d=c?0:this.innerRadius,u=c?0:this.outerRadius,{sharedOptions:f,includeOptions:g}=this._getSharedOptions(e,s);let p,m=this._getRotation();for(p=0;p<e;++p)m+=this._circumference(p,n);for(p=e;p<e+i;++p){const e=this._circumference(p,n),i=t[p],o={x:l+this.offsetX,y:h+this.offsetY,startAngle:m,endAngle:m+e,circumference:e,outerRadius:u,innerRadius:d};g&&(o.options=f||this.resolveDataElementOptions(p,i.active?\"active\":s)),m+=e,this.updateElement(i,p,o,s)}}calculateTotal(){const t=this._cachedMeta,e=t.data;let i,s=0;for(i=0;i<e.length;i++){const n=t._parsed[i];null===n||isNaN(n)||!this.chart.getDataVisibility(i)||e[i].hidden||(s+=Math.abs(n))}return s}calculateCircumference(t){const e=this._cachedMeta.total;return e>0&&!isNaN(t)?O*(Math.abs(t)/e):0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t],i.options.locale);return{label:s[t]||\"\",value:n}}getMaxBorderWidth(t){let e=0;const i=this.chart;let s,n,o,a,r;if(!t)for(s=0,n=i.data.datasets.length;s<n;++s)if(i.isDatasetVisible(s)){o=i.getDatasetMeta(s),t=o.data,a=o.controller;break}if(!t)return 0;for(s=0,n=t.length;s<n;++s)r=a.resolveDataElementOptions(s),\"inner\"!==r.borderAlign&&(e=Math.max(e,r.borderWidth||0,r.hoverBorderWidth||0));return e}getMaxOffset(t){let e=0;for(let i=0,s=t.length;i<s;++i){const t=this.resolveDataElementOptions(i);e=Math.max(e,t.offset||0,t.hoverOffset||0)}return e}_getRingWeightOffset(t){let e=0;for(let i=0;i<t;++i)this.chart.isDatasetVisible(i)&&(e+=this._getRingWeight(i));return e}_getRingWeight(t){return Math.max(l(this.chart.data.datasets[t].weight,1),0)}_getVisibleDatasetWeightTotal(){return this._getRingWeightOffset(this.chart.data.datasets.length)||1}}class $n extends Ns{static id=\"polarArea\";static defaults={dataElementType:\"arc\",animation:{animateRotate:!0,animateScale:!0},animations:{numbers:{type:\"number\",properties:[\"x\",\"y\",\"startAngle\",\"endAngle\",\"innerRadius\",\"outerRadius\"]}},indexAxis:\"r\",startAngle:0};static overrides={aspectRatio:1,plugins:{legend:{labels:{generateLabels(t){const e=t.data;if(e.labels.length&&e.datasets.length){const{labels:{pointStyle:i,color:s}}=t.legend.options;return e.labels.map(((e,n)=>{const o=t.getDatasetMeta(0).controller.getStyle(n);return{text:e,fillStyle:o.backgroundColor,strokeStyle:o.borderColor,fontColor:s,lineWidth:o.borderWidth,pointStyle:i,hidden:!t.getDataVisibility(n),index:n}}))}return[]}},onClick(t,e,i){i.chart.toggleDataVisibility(e.index),i.chart.update()}}},scales:{r:{type:\"radialLinear\",angleLines:{display:!1},beginAtZero:!0,grid:{circular:!0},pointLabels:{display:!1},startAngle:0}}};constructor(t,e){super(t,e),this.innerRadius=void 0,this.outerRadius=void 0}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart,s=i.data.labels||[],n=ne(e._parsed[t].r,i.options.locale);return{label:s[t]||\"\",value:n}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta.data;this._updateRadius(),this.updateElements(e,0,e.length,t)}getMinMax(){const t=this._cachedMeta,e={min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};return t.data.forEach(((t,i)=>{const s=this.getParsed(i).r;!isNaN(s)&&this.chart.getDataVisibility(i)&&(s<e.min&&(e.min=s),s>e.max&&(e.max=s))})),e}_updateRadius(){const t=this.chart,e=t.chartArea,i=t.options,s=Math.min(e.right-e.left,e.relay-node.invalid),n=Math.max(s/2,0),o=(n-Math.max(i.cutoutPercentage?n/100*i.cutoutPercentage:1,0))/t.getVisibleDatasetCount();this.outerRadius=n-o*this.index,this.innerRadius=this.outerRadius-o}updateElements(t,e,i,s){const n=\"reset\"===s,o=this.chart,a=o.options.animation,r=this._cachedMeta.rScale,l=r.xCenter,h=r.yCenter,c=r.getIndexAngle(0)-.5*C;let d,u=c;const f=360/this.countVisibleElements();for(d=0;d<e;++d)u+=this._computeAngle(d,s,f);for(d=e;d<e+i;d++){const e=t[d];let i=u,g=u+this._computeAngle(d,s,f),p=o.getDataVisibility(d)?r.getDistanceFromCenterForValue(this.getParsed(d).r):0;u=g,n&&(a.animateScale&&(p=0),a.animateRotate&&(i=g=c));const m={x:l,y:h,innerRadius:0,outerRadius:p,startAngle:i,endAngle:g,options:this.resolveDataElementOptions(d,e.active?\"active\":s)};this.updateElement(e,d,m,s)}}countVisibleElements(){const t=this._cachedMeta;let e=0;return t.data.forEach(((t,i)=>{!isNaN(this.getParsed(i).r)&&this.chart.getDataVisibility(i)&&e++})),e}_computeAngle(t,e,i){return this.chart.getDataVisibility(t)?$(this.resolveDataElementOptions(t,e).angle||i):0}}var Yn=Object.freeze({__proto__:null,BarController:class extends Ns{static id=\"bar\";static defaults={datasetElementType:!1,dataElementType:\"bar\",categoryPercentage:.8,barPercentage:.9,grouped:!0,animations:{numbers:{type:\"number\",properties:[\"x\",\"y\",\"base\",\"width\",\"height\"]}}};static overrides={scales:{_index_:{type:\"category\",offset:!0,grid:{offset:!0}},_value_:{type:\"linear\",beginAtZero:!0}}};parsePrimitiveData(t,e,i,s){return Fn(t,e,i,s)}parseArrayData(t,e,i,s){return Fn(t,e,i,s)}parseObjectData(t,e,i,s){const{iScale:n,vScale:o}=t,{xAxisKey:a=\"x\",yAxisKey:r=\"y\"}=this._parsing,l=\"x\"===n.axis?a:r,h=\"x\"===o.axis?a:r,c=[];let d,u,f,g;for(d=i,u=i+s;d<u;++d)g=e[d],f={},f[n.axis]=n.parse(M(g,l),d),c.push(zn(M(g,h),f,o,d));return c}updateRangeFromParsed(t,e,i,s){super.updateRangeFromParsed(t,e,i,s);const n=i._custom;n&&e===this._cachedMeta.vScale&&(t.min=Math.min(t.min,n.min),t.max=Math.max(t.max,n.max))}getMaxOverflow(){return 0}getLabelAndValue(t){const e=this._cachedMeta,{iScale:i,vScale:s}=e,n=this.getParsed(t),o=n._custom,a=Vn(o)?\"[\"+o.start+\", \"+o.end+\"]\":\"\"+s.getLabelForValue(n[s.axis]);return{label:\"\"+i.getLabelForValue(n[i.axis]),value:a}}initialize(){this.enableOptionSharing=!0,super.initialize();this._cachedMeta.stack=this.getDataset().stack}update(t){const e=this._cachedMeta;this.updateElements(e.data,0,e.data.length,t)}updateElements(t,e,i,n){const o=\"reset\"===n,{index:a,_cachedMeta:{vScale:r}}=this,l=r.getBasePixel(),h=r.isHorizontal(),c=this._getRuler(),{sharedOptions:d,includeOptions:u}=this._getSharedOptions(e,n);for(let f=e;f<e+i;f++){const e=this.getParsed(f),i=o||s(e[r.axis])?{base:l,head:l}:this._calculateBarValuePixels(f),g=this._calculateBarIndexPixels(f,c),p=(e._stacks||{})[r.axis],m={horizontal:h,base:i.base,enableBorderRadius:!p||Vn(e._custom)||a===p._top||a===p._bottom,x:h?i.head:g.center,y:h?g.center:i.head,height:h?g.size:Math.abs(i.size),width:h?Math.abs(i.size):g.size};u&&(m.options=d||this.resolveDataElementOptions(f,t[f].active?\"active\":n));const b=m.options||t[f].options;Bn(m,b,p,a),Hn(m,b,c.ratio),this.updateElement(t[f],f,m,n)}}_getStacks(t,e){const{iScale:i}=this._cachedMeta,n=i.getMatchingVisibleMetas(this._type).filter((t=>t.controller.options.grouped)),o=i.options.stacked,a=[],r=t=>{const i=t.controller.getParsed(e),n=i&&i[t.vScale.axis];if(s(n)||isNaN(n))return!0};for(const i of n)if((void 0===e||!r(i))&&((!1===o||-1===a.indexOf(i.stack)||void 0===o&&void 0===i.stack)&&a.push(i.stack),i.index===t))break;return a.length||a.push(void 0),a}_getStackCount(t){return this._getStacks(void 0,t).length}_getStackIndex(t,e,i){const s=this._getStacks(t,i),n=void 0!==e?s.indexOf(e):-1;return-1===n?s.length-1:n}_getRuler(){const t=this.options,e=this._cachedMeta,i=e.iScale,s=[];let n,o;for(n=0,o=e.data.length;n<o;++n)s.push(i.getPixelForValue(this.getParsed(n)[i.axis],n));const a=t.barThickness;return{min:a||In(e),pixels:s,start:i._startPixel,end:i._endPixel,stackCount:this._getStackCount(),scale:i,grouped:t.grouped,ratio:a?1:t.categoryPercentage*t.barPercentage}}_calculateBarValuePixels(t){const{_cachedMeta:{vScale:e,_stacked:i,index:n},options:{base:o,minBarLength:a}}=this,r=o||0,l=this.getParsed(t),h=l._custom,c=Vn(h);let d,u,f=l[e.axis],g=0,p=i?this.applyStack(e,l,i):f;p!==f&&(g=p-f,p=f),c&&(f=h.barStart,p=h.barEnd-h.barStart,0!==f&&F(f)!==F(h.barEnd)&&(g=0),g+=f);const m=s(o)||c?g:o;let b=e.getPixelForValue(m);if(d=this.chart.getDataVisibility(t)?e.getPixelForValue(g+p):b,u=d-b,Math.abs(u)<a){u=function(t,e,i){return 0!==t?F(t):(e.isHorizontal()?1:-1)*(e.min>=i?1:-1)}(u,e,r)*a,f===r&&(b-=u/2);const t=e.getPixelForDecimal(0),s=e.getPixelForDecimal(1),o=Math.min(t,s),h=Math.max(t,s);b=Math.max(Math.min(b,h),o),d=b+u,i&&!c&&(l._stacks[e.axis]._visualValues[n]=e.getValueForPixel(d)-e.getValueForPixel(b))}if(b===e.getPixelForValue(r)){const t=F(u)*e.getLineWidthForValue(r)/2;b+=t,u-=t}return{size:u,base:b,head:d,center:d+u/2}}_calculateBarIndexPixels(t,e){const i=e.scale,n=this.options,o=n.skipNull,a=l(n.maxBarThickness,1/0);let r,h;if(e.grouped){const i=o?this._getStackCount(t):e.stackCount,l=\"flex\"===n.barThickness?function(t,e,i,s){const n=e.pixels,o=n[t];let a=t>0?n[t-1]:null,r=t<n.length-1?n[t+1]:null;const l=i.categoryPercentage;null===a&&(a=o-(null===r?e.end-e.start:r-o)),null===r&&(r=o+o-a);const h=o-(o-Math.min(a,r))/2*l;return{chunk:Math.abs(r-a)/2*l/s,ratio:i.barPercentage,start:h}}(t,e,n,i):function(t,e,i,n){const o=i.barThickness;let a,r;return s(o)?(a=e.min*i.categoryPercentage,r=i.barPercentage):(a=o*n,r=1),{chunk:a/n,ratio:r,start:e.pixels[t]-a/2}}(t,e,n,i),c=this._getStackIndex(this.index,this._cachedMeta.stack,o?t:void 0);r=l.start+l.chunk*c+l.chunk/2,h=Math.min(a,l.chunk*l.ratio)}else r=i.getPixelForValue(this.getParsed(t)[i.axis],t),h=Math.min(a,e.min*e.ratio);return{base:r-h/2,head:r+h/2,center:r,size:h}}draw(){const t=this._cachedMeta,e=t.vScale,i=t.data,s=i.length;let n=0;for(;n<s;++n)null!==this.getParsed(n)[e.axis]&&i[n].draw(this._ctx)}},BubbleController:class extends Ns{static id=\"bubble\";static defaults={datasetElementType:!1,dataElementType:\"point\",animations:{numbers:{type:\"number\",properties:[\"x\",\"y\",\"borderWidth\",\"radius\"]}}};static overrides={scales:{x:{type:\"linear\"},y:{type:\"linear\"}}};initialize(){this.enableOptionSharing=!0,super.initialize()}parsePrimitiveData(t,e,i,s){const n=super.parsePrimitiveData(t,e,i,s);for(let t=0;t<n.length;t++)n[t]._custom=this.resolveDataElementOptions(t+i).radius;return n}parseArrayData(t,e,i,s){const n=super.parseArrayData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s[2],this.resolveDataElementOptions(t+i).radius)}return n}parseObjectData(t,e,i,s){const n=super.parseObjectData(t,e,i,s);for(let t=0;t<n.length;t++){const s=e[i+t];n[t]._custom=l(s&&s.r&&+s.r,this.resolveDataElementOptions(t+i).radius)}return n}getMaxOverflow(){const t=this._cachedMeta.data;let e=0;for(let i=t.length-1;i>=0;--i)e=Math.max(e,t[i].size(this.resolveDataElementOptions(i))/2);return e>0&&e}getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y),l=o._custom;return{label:i[t]||\"\",value:\"(\"+a+\", \"+r+(l?\", \"+l:\"\")+\")\"}}update(t){const e=this._cachedMeta.data;this.updateElements(e,0,e.length,t)}updateElements(t,e,i,s){const n=\"reset\"===s,{iScale:o,vScale:a}=this._cachedMeta,{sharedOptions:r,includeOptions:l}=this._getSharedOptions(e,s),h=o.axis,c=a.axis;for(let d=e;d<e+i;d++){const e=t[d],i=!n&&this.getParsed(d),u={},f=u[h]=n?o.getPixelForDecimal(.5):o.getPixelForValue(i[h]),g=u[c]=n?a.getBasePixel():a.getPixelForValue(i[c]);u.skip=isNaN(f)||isNaN(g),l&&(u.options=r||this.resolveDataElementOptions(d,e.active?\"active\":s),n&&(u.options.radius=0)),this.updateElement(e,d,u,s)}}resolveDataElementOptions(t,e){const i=this.getParsed(t);let s=super.resolveDataElementOptions(t,e);s.$shared&&(s=Object.assign({},s,{$shared:!1}));const n=s.radius;return\"active\"!==e&&(s.radius=0),s.radius+=l(i&&i._custom,n),s}},DoughnutController:jn,LineController:class extends Ns{static id=\"line\";static defaults={datasetElementType:\"line\",dataElementType:\"point\",showLine:!0,spanGaps:!1};static overrides={scales:{_index_:{type:\"category\"},_value_:{type:\"linear\"}}};initialize(){this.enableOptionSharing=!0,this.supportsDecimation=!0,super.initialize()}update(t){const e=this._cachedMeta,{dataset:i,data:s=[],_dataset:n}=e,o=this.chart._animationsDisabled;let{start:a,count:r}=pt(e,s,o);this._drawStart=a,this._drawCount=r,mt(e)&&(a=0,r=s.length),i._chart=this.chart,i._datasetIndex=this.index,i._decimated=!!n._decimated,i.points=s;const l=this.resolveDatasetElementOptions(t);this.options.showLine||(l.borderWidth=0),l.segment=this.options.segment,this.updateElement(i,void 0,{animated:!o,options:l},t),this.updateElements(s,a,r,t)}updateElements(t,e,i,n){const o=\"reset\"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,{sharedOptions:c,includeOptions:d}=this._getSharedOptions(e,n),u=a.axis,f=r.axis,{spanGaps:g,segment:p}=this.options,m=N(g)?g:Number.POSITIVE_INFINITY,b=this.chart._animationsDisabled||o||\"none\"===n,x=e+i,_=t.length;let y=e>0&&this.getParsed(e-1);for(let i=0;i<_;++i){const g=t[i],_=b?g:{};if(i<e||i>=x){_.skip=!0;continue}const v=this.getParsed(i),M=s(v[f]),w=_[u]=a.getPixelForValue(v[u],i),k=_[f]=o||M?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,v,l):v[f],i);_.skip=isNaN(w)||isNaN(k)||M,_.stop=i>0&&Math.abs(v[u]-y[u])>m,p&&(_.parsed=v,_.raw=h.data[i]),d&&(_.options=c||this.resolveDataElementOptions(i,g.active?\"active\":n)),b||this.updateElement(g,i,_,n),y=v}}getMaxOverflow(){const t=this._cachedMeta,e=t.dataset,i=e.options&&e.options.borderWidth||0,s=t.data||[];if(!s.length)return i;const n=s[0].size(this.resolveDataElementOptions(0)),o=s[s.length-1].size(this.resolveDataElementOptions(s.length-1));return Math.max(i,n,o)/2}draw(){const t=this._cachedMeta;t.dataset.updateControlPoints(this.chart.chartArea,t.iScale.axis),super.draw()}},PieController:class extends jn{static id=\"pie\";static defaults={cutout:0,rotation:0,circumference:360,radius:\"100%\"}},PolarAreaController:$n,RadarController:class extends Ns{static id=\"radar\";static defaults={datasetElementType:\"line\",dataElementType:\"point\",indexAxis:\"r\",showLine:!0,elements:{line:{fill:\"start\"}}};static overrides={aspectRatio:1,scales:{r:{type:\"radialLinear\"}}};getLabelAndValue(t){const e=this._cachedMeta.vScale,i=this.getParsed(t);return{label:e.getLabels()[t],value:\"\"+e.getLabelForValue(i[e.axis])}}parseObjectData(t,e,i,s){return ii.bind(this)(t,e,i,s)}update(t){const e=this._cachedMeta,i=e.dataset,s=e.data||[],n=e.iScale.getLabels();if(i.points=s,\"resize\"!==t){const e=this.resolveDatasetElementOptions(t);this.options.showLine||(e.borderWidth=0);const o={_loop:!0,_fullLoop:n.length===s.length,options:e};this.updateElement(i,void 0,o,t)}this.updateElements(s,0,s.length,t)}updateElements(t,e,i,s){const n=this._cachedMeta.rScale,o=\"reset\"===s;for(let a=e;a<e+i;a++){const e=t[a],i=this.resolveDataElementOptions(a,e.active?\"active\":s),r=n.getPointPositionForValue(a,this.getParsed(a).r),l=o?n.xCenter:r.x,h=o?n.yCenter:r.y,c={x:l,y:h,angle:r.angle,skip:isNaN(l)||isNaN(h),options:i};this.updateElement(e,a,c,s)}}},ScatterController:class extends Ns{static id=\"scatter\";static defaults={datasetElementType:!1,dataElementType:\"point\",showLine:!1,fill:!1};static overrides={interaction:{mode:\"point\"},scales:{x:{type:\"linear\"},y:{type:\"linear\"}}};getLabelAndValue(t){const e=this._cachedMeta,i=this.chart.data.labels||[],{xScale:s,yScale:n}=e,o=this.getParsed(t),a=s.getLabelForValue(o.x),r=n.getLabelForValue(o.y);return{label:i[t]||\"\",value:\"(\"+a+\", \"+r+\")\"}}update(t){const e=this._cachedMeta,{data:i=[]}=e,s=this.chart._animationsDisabled;let{start:n,count:o}=pt(e,i,s);if(this._drawStart=n,this._drawCount=o,mt(e)&&(n=0,o=i.length),this.options.showLine){this.datasetElementType||this.addElements();const{dataset:n,_dataset:o}=e;n._chart=this.chart,n._datasetIndex=this.index,n._decimated=!!o._decimated,n.points=i;const a=this.resolveDatasetElementOptions(t);a.segment=this.options.segment,this.updateElement(n,void 0,{animated:!s,options:a},t)}else this.datasetElementType&&(delete e.dataset,this.datasetElementType=!1);this.updateElements(i,n,o,t)}addElements(){const{showLine:t}=this.options;!this.datasetElementType&&t&&(this.datasetElementType=this.chart.registry.getElement(\"line\")),super.addElements()}updateElements(t,e,i,n){const o=\"reset\"===n,{iScale:a,vScale:r,_stacked:l,_dataset:h}=this._cachedMeta,c=this.resolveDataElementOptions(e,n),d=this.getSharedOptions(c),u=this.includeOptions(n,d),f=a.axis,g=r.axis,{spanGaps:p,segment:m}=this.options,b=N(p)?p:Number.POSITIVE_INFINITY,x=this.chart._animationsDisabled||o||\"none\"===n;let _=e>0&&this.getParsed(e-1);for(let c=e;c<e+i;++c){const e=t[c],i=this.getParsed(c),p=x?e:{},y=s(i[g]),v=p[f]=a.getPixelForValue(i[f],c),M=p[g]=o||y?r.getBasePixel():r.getPixelForValue(l?this.applyStack(r,i,l):i[g],c);p.skip=isNaN(v)||isNaN(M)||y,p.stop=c>0&&Math.abs(i[f]-_[f])>b,m&&(p.parsed=i,p.raw=h.data[c]),u&&(p.options=d||this.resolveDataElementOptions(c,e.active?\"active\":n)),x||this.updateElement(e,c,p,n),_=i}this.updateSharedOptions(d,n,c)}getMaxOverflow(){const t=this._cachedMeta,e=t.data||[];if(!this.options.showLine){let t=0;for(let i=e.length-1;i>=0;--i)t=Math.max(t,e[i].size(this.resolveDataElementOptions(i))/2);return t>0&&t}const i=t.dataset,s=i.options&&i.options.borderWidth||0;if(!e.length)return s;const n=e[0].size(this.resolveDataElementOptions(0)),o=e[e.length-1].size(this.resolveDataElementOptions(e.length-1));return Math.max(s,n,o)/2}}});function Un(t,e,i,s){const n=vi(t.options.borderRadius,[\"outerStart\",\"outerEnd\",\"innerStart\",\"innerEnd\"]);const o=(i-e)/2,a=Math.min(o,s*e/2),r=t=>{const e=(i-Math.min(o,t))*s/2;return J(t,0,Math.min(o,e))};return{outerStart:r(n.outerStart),outerEnd:r(n.outerEnd),innerStart:J(n.innerStart,0,a),innerEnd:J(n.innerEnd,0,a)}}function Xn(t,e,i,s){return{x:i+t*Math.cos(e),y:s+t*Math.sin(e)}}function qn(t,e,i,s,n,o){const{x:a,y:r,startAngle:l,pixelMargin:h,innerRadius:c}=e,d=Math.max(e.outerRadius+s+i-h,0),u=c>0?c+s+i+h:0;let f=0;const g=n-l;if(s){const t=((c>0?c-s:0)+(d>0?d-s:0))/2;f=(g-(0!==t?g*t/(t+s):g))/2}const p=(g-Math.max(.001,g*d-i/C)/d)/2,m=l+p+f,b=n-p-f,{outerStart:x,outerEnd:_,innerStart:y,innerEnd:v}=Un(e,u,d,b-m),M=d-x,w=d-_,k=m+x/M,S=b-_/w,P=u+y,D=u+v,O=m+y/P,A=b-v/D;if(t.beginPath(),o){const e=(k+S)/2;if(t.arc(a,r,d,k,e),t.arc(a,r,d,e,S),_>0){const e=Xn(w,S,a,r);t.arc(e.x,e.y,_,S,b+E)}const i=Xn(D,b,a,r);if(t.lineTo(i.x,i.y),v>0){const e=Xn(D,A,a,r);t.arc(e.x,e.y,v,b+E,A+Math.PI)}const s=(b-v/u+(m+y/u))/2;if(t.arc(a,r,u,b-v/u,s,!0),t.arc(a,r,u,s,m+y/u,!0),y>0){const e=Xn(P,O,a,r);t.arc(e.x,e.y,y,O+Math.PI,m-E)}const n=Xn(M,m,a,r);if(t.lineTo(n.x,n.y),x>0){const e=Xn(M,k,a,r);t.arc(e.x,e.y,x,m-E,k)}}else{t.moveTo(a,r);const e=Math.cos(k)*d+a,i=Math.sin(k)*d+r;t.lineTo(e,i);const s=Math.cos(S)*d+a,n=Math.sin(S)*d+r;t.lineTo(s,n)}t.closePath()}function Kn(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r,options:l}=e,{borderWidth:h,borderJoinStyle:c,borderDash:d,borderDashOffset:u}=l,f=\"inner\"===l.borderAlign;if(!h)return;t.setLineDash(d||[]),t.lineDashOffset=u,f?(t.lineWidth=2*h,t.lineJoin=c||\"round\"):(t.lineWidth=h,t.lineJoin=c||\"bevel\");let g=e.endAngle;if(o){qn(t,e,i,s,g,n);for(let e=0;e<o;++e)t.stroke();isNaN(r)||(g=a+(r%O||O))}f&&function(t,e,i){const{startAngle:s,pixelMargin:n,x:o,y:a,outerRadius:r,innerRadius:l}=e;let h=n/r;t.beginPath(),t.arc(o,a,r,s-h,i+h),l>n?(h=n/l,t.arc(o,a,l,i+h,s-h,!0)):t.arc(o,a,n,i+E,s-E),t.closePath(),t.clip()}(t,e,g),o||(qn(t,e,i,s,g,n),t.stroke())}function Gn(t,e,i=e){t.lineCap=l(i.borderCapStyle,e.borderCapStyle),t.setLineDash(l(i.borderDash,e.borderDash)),t.lineDashOffset=l(i.borderDashOffset,e.borderDashOffset),t.lineJoin=l(i.borderJoinStyle,e.borderJoinStyle),t.lineWidth=l(i.borderWidth,e.borderWidth),t.strokeStyle=l(i.borderColor,e.borderColor)}function Zn(t,e,i){t.lineTo(i.x,i.y)}function Jn(t,e,i={}){const s=t.length,{start:n=0,end:o=s-1}=i,{start:a,end:r}=e,l=Math.max(n,a),h=Math.min(o,r),c=n<a&&o<a||n>r&&o>r;return{count:s,start:l,loop:e.loop,ilen:h<l&&!c?s+h-l:h-l}}function Qn(t,e,i,s){const{points:n,options:o}=e,{count:a,start:r,loop:l,ilen:h}=Jn(n,i,s),c=function(t){return t.stepped?Fe:t.tension||\"monotone\"===t.cubicInterpolationMode?Ve:Zn}(o);let d,u,f,{move:g=!0,reverse:p}=s||{};for(d=0;d<=h;++d)u=n[(r+(p?h-d:d))%a],u.skip||(g?(t.moveTo(u.x,u.y),g=!1):c(t,f,u,p,o.stepped),f=u);return l&&(u=n[(r+(p?h:0))%a],c(t,f,u,p,o.stepped)),!!l}function to(t,e,i,s){const n=e.points,{count:o,start:a,ilen:r}=Jn(n,i,s),{move:l=!0,reverse:h}=s||{};let c,d,u,f,g,p,m=0,b=0;const x=t=>(a+(h?r-t:t))%o,_=()=>{f!==g&&(t.lineTo(m,g),t.lineTo(m,f),t.lineTo(m,p))};for(l&&(d=n[x(0)],t.moveTo(d.x,d.y)),c=0;c<=r;++c){if(d=n[x(c)],d.skip)continue;const e=d.x,i=d.y,s=0|e;s===u?(i<f?f=i:i>g&&(g=i),m=(b*m+e)/++b):(_(),t.lineTo(e,i),u=s,b=0,f=g=i),p=i}_()}function eo(t){const e=t.options,i=e.borderDash&&e.borderDash.length;return!(t._decimated||t._loop||e.tension||\"monotone\"===e.cubicInterpolationMode||e.stepped||i)?to:Qn}const io=\"function\"==typeof Path2D;function so(t,e,i,s){io&&!e.options.segment?function(t,e,i,s){let n=e._path;n||(n=e._path=new Path2D,e.path(n,i,s)&&n.closePath()),Gn(t,e.options),t.stroke(n)}(t,e,i,s):function(t,e,i,s){const{segments:n,options:o}=e,a=eo(e);for(const r of n)Gn(t,o,r.style),t.beginPath(),a(t,e,r,{start:i,end:i+s-1})&&t.closePath(),t.stroke()}(t,e,i,s)}class no extends Hs{static id=\"line\";static defaults={borderCapStyle:\"butt\",borderDash:[],borderDashOffset:0,borderJoinStyle:\"miter\",borderWidth:3,capBezierPoints:!0,cubicInterpolationMode:\"default\",fill:!1,spanGaps:!1,stepped:!1,tension:0};static defaultRoutes={backgroundColor:\"backgroundColor\",borderColor:\"borderColor\"};static descriptors={_scriptable:!0,_indexable:t=>\"borderDash\"!==t&&\"fill\"!==t};constructor(t){super(),this.animated=!0,this.options=void 0,this._chart=void 0,this._loop=void 0,this._fullLoop=void 0,this._path=void 0,this._points=void 0,this._segments=void 0,this._decimated=!1,this._pointsUpdated=!1,this._datasetIndex=void 0,t&&Object.assign(this,t)}updateControlPoints(t,e){const i=this.options;if((i.tension||\"monotone\"===i.cubicInterpolationMode)&&!i.stepped&&!this._pointsUpdated){const s=i.spanGaps?this._loop:this._fullLoop;hi(this._points,i,t,s,e),this._pointsUpdated=!0}}set points(t){this._points=t,delete this._segments,delete this._path,this._pointsUpdated=!1}get points(){return this._points}get segments(){return this._segments||(this._segments=zi(this,this.options.segment))}first(){const t=this.segments,e=this.points;return t.length&&e[t[0].start]}last(){const t=this.segments,e=this.points,i=t.length;return i&&e[t[i-1].end]}interpolate(t,e){const i=this.options,s=t[e],n=this.points,o=Ii(this,{property:e,start:s,end:s});if(!o.length)return;const a=[],r=function(t){return t.stepped?pi:t.tension||\"monotone\"===t.cubicInterpolationMode?mi:gi}(i);let l,h;for(l=0,h=o.length;l<h;++l){const{start:h,end:c}=o[l],d=n[h],u=n[c];if(d===u){a.push(d);continue}const f=r(d,u,Math.abs((s-d[e])/(u[e]-d[e])),i.stepped);f[e]=t[e],a.push(f)}return 1===a.length?a[0]:a}pathSegment(t,e,i){return eo(this)(t,this,e,i)}path(t,e,i){const s=this.segments,n=eo(this);let o=this._loop;e=e||0,i=i||this.points.length-e;for(const a of s)o&=n(t,this,a,{start:e,end:e+i-1});return!!o}draw(t,e,i,s){const n=this.options||{};(this.points||[]).length&&n.borderWidth&&(t.save(),so(t,this,i,s),t.restore()),this.animated&&(this._pointsUpdated=!1,this._path=void 0)}}function oo(t,e,i,s){const n=t.options,{[i]:o}=t.getProps([i],s);return Math.abs(e-o)<n.radius+n.hitRadius}function ao(t,e){const{x:i,y:s,base:n,width:o,height:a}=t.getProps([\"x\",\"y\",\"base\",\"width\",\"height\"],e);let r,l,h,c,d;return t.horizontal?(d=a/2,r=Math.min(i,n),l=Math.max(i,n),h=s-d,c=s+d):(d=o/2,r=i-d,l=i+d,h=Math.min(s,n),c=Math.max(s,n)),{left:r,top:h,right:l,bottom:c}}function ro(t,e,i,s){return t?0:J(e,i,s)}function lo(t){const e=ao(t),i=e.right-e.left,s=e.relay-node.invalid,n=function(t,e,i){const s=t.options.borderWidth,n=t.borderSkipped,o=Mi(s);return{t:ro(n.top,o.top,0,i),r:ro(n.right,o.right,0,e),b:ro(n.bottom,o.bottom,0,i),l:ro(n.left,o.left,0,e)}}(t,i/2,s/2),a=function(t,e,i){const{enableBorderRadius:s}=t.getProps([\"enableBorderRadius\"]),n=t.options.borderRadius,a=wi(n),r=Math.min(e,i),l=t.borderSkipped,h=s||o(n);return{topLeft:ro(!h||l.top||l.left,a.topLeft,0,r),topRight:ro(!h||l.top||l.right,a.topRight,0,r),bottomLeft:ro(!h||l.bottom||l.left,a.bottomLeft,0,r),bottomRight:ro(!h||l.bottom||l.right,a.bottomRight,0,r)}}(t,i/2,s/2);return{outer:{x:e.left,y:e.top,w:i,h:s,radius:a},inner:{x:e.left+n.l,y:e.top+n.t,w:i-n.l-n.r,h:s-n.t-n.b,radius:{topLeft:Math.max(0,a.topLeft-Math.max(n.t,n.l)),topRight:Math.max(0,a.topRight-Math.max(n.t,n.r)),bottomLeft:Math.max(0,a.bottomLeft-Math.max(n.b,n.l)),bottomRight:Math.max(0,a.bottomRight-Math.max(n.b,n.r))}}}}function ho(t,e,i,s){const n=null===e,o=null===i,a=t&&!(n&&o)&&ao(t,s);return a&&(n||tt(e,a.left,a.right))&&(o||tt(i,a.top,a.bottom))}function co(t,e){t.rect(e.x,e.y,e.w,e.h)}function uo(t,e,i={}){const s=t.x!==i.x?-e:0,n=t.y!==i.y?-e:0,o=(t.x+t.w!==i.x+i.w?e:0)-s,a=(t.y+t.h!==i.y+i.h?e:0)-n;return{x:t.x+s,y:t.y+n,w:t.w+o,h:t.h+a,radius:t.radius}}var fo=Object.freeze({__proto__:null,ArcElement:class extends Hs{static id=\"arc\";static defaults={borderAlign:\"center\",borderColor:\"#fff\",borderDash:[],borderDashOffset:0,borderJoinStyle:void 0,borderRadius:0,borderWidth:2,offset:0,spacing:0,angle:void 0,circular:!0};static defaultRoutes={backgroundColor:\"backgroundColor\"};static descriptors={_scriptable:!0,_indexable:t=>\"borderDash\"!==t};circumference;endAngle;fullCircles;innerRadius;outerRadius;pixelMargin;startAngle;constructor(t){super(),this.options=void 0,this.circumference=void 0,this.startAngle=void 0,this.endAngle=void 0,this.innerRadius=void 0,this.outerRadius=void 0,this.pixelMargin=0,this.fullCircles=0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.getProps([\"x\",\"y\"],i),{angle:n,distance:o}=X(s,{x:t,y:e}),{startAngle:a,endAngle:r,innerRadius:h,outerRadius:c,circumference:d}=this.getProps([\"startAngle\",\"endAngle\",\"innerRadius\",\"outerRadius\",\"circumference\"],i),u=(this.options.spacing+this.options.borderWidth)/2,f=l(d,r-a)>=O||Z(n,a,r),g=tt(o,h+u,c+u);return f&&g}getCenterPoint(t){const{x:e,y:i,startAngle:s,endAngle:n,innerRadius:o,outerRadius:a}=this.getProps([\"x\",\"y\",\"startAngle\",\"endAngle\",\"innerRadius\",\"outerRadius\"],t),{offset:r,spacing:l}=this.options,h=(s+n)/2,c=(o+a+l+r)/2;return{x:e+Math.cos(h)*c,y:i+Math.sin(h)*c}}tooltipPosition(t){return this.getCenterPoint(t)}draw(t){const{options:e,circumference:i}=this,s=(e.offset||0)/4,n=(e.spacing||0)/2,o=e.circular;if(this.pixelMargin=\"inner\"===e.borderAlign?.33:0,this.fullCircles=i>O?Math.floor(i/O):0,0===i||this.innerRadius<0||this.outerRadius<0)return;t.save();const a=(this.startAngle+this.endAngle)/2;t.translate(Math.cos(a)*s,Math.sin(a)*s);const r=s*(1-Math.sin(Math.min(C,i||0)));t.fillStyle=e.backgroundColor,t.strokeStyle=e.borderColor,function(t,e,i,s,n){const{fullCircles:o,startAngle:a,circumference:r}=e;let l=e.endAngle;if(o){qn(t,e,i,s,l,n);for(let e=0;e<o;++e)t.fill();isNaN(r)||(l=a+(r%O||O))}qn(t,e,i,s,l,n),t.fill()}(t,this,r,n,o),Kn(t,this,r,n,o),t.restore()}},BarElement:class extends Hs{static id=\"bar\";static defaults={borderSkipped:\"start\",borderWidth:0,borderRadius:0,inflateAmount:\"auto\",pointStyle:void 0};static defaultRoutes={backgroundColor:\"backgroundColor\",borderColor:\"borderColor\"};constructor(t){super(),this.options=void 0,this.horizontal=void 0,this.base=void 0,this.width=void 0,this.height=void 0,this.inflateAmount=void 0,t&&Object.assign(this,t)}draw(t){const{inflateAmount:e,options:{borderColor:i,backgroundColor:s}}=this,{inner:n,outer:o}=lo(this),a=(r=o.radius).topLeft||r.topRight||r.bottomLeft||r.bottomRight?He:co;var r;t.save(),o.w===n.w&&o.h===n.h||(t.beginPath(),a(t,uo(o,e,n)),t.clip(),a(t,uo(n,-e,o)),t.fillStyle=i,t.fill(\"evenodd\")),t.beginPath(),a(t,uo(n,e)),t.fillStyle=s,t.fill(),t.restore()}inRange(t,e,i){return ho(this,t,e,i)}inXRange(t,e){return ho(this,t,null,e)}inYRange(t,e){return ho(this,null,t,e)}getCenterPoint(t){const{x:e,y:i,base:s,horizontal:n}=this.getProps([\"x\",\"y\",\"base\",\"horizontal\"],t);return{x:n?(e+s)/2:e,y:n?i:(i+s)/2}}getRange(t){return\"x\"===t?this.width/2:this.height/2}},LineElement:no,PointElement:class extends Hs{static id=\"point\";parsed;skip;stop;static defaults={borderWidth:1,hitRadius:1,hoverBorderWidth:1,hoverRadius:4,pointStyle:\"circle\",radius:3,rotation:0};static defaultRoutes={backgroundColor:\"backgroundColor\",borderColor:\"borderColor\"};constructor(t){super(),this.options=void 0,this.parsed=void 0,this.skip=void 0,this.stop=void 0,t&&Object.assign(this,t)}inRange(t,e,i){const s=this.options,{x:n,y:o}=this.getProps([\"x\",\"y\"],i);return Math.pow(t-n,2)+Math.pow(e-o,2)<Math.pow(s.hitRadius+s.radius,2)}inXRange(t,e){return oo(this,t,\"x\",e)}inYRange(t,e){return oo(this,t,\"y\",e)}getCenterPoint(t){const{x:e,y:i}=this.getProps([\"x\",\"y\"],t);return{x:e,y:i}}size(t){let e=(t=t||this.options||{}).radius||0;e=Math.max(e,e&&t.hoverRadius||0);return 2*(e+(e&&t.borderWidth||0))}draw(t,e){const i=this.options;this.skip||i.radius<.1||!Re(this,e,this.size(i)/2)||(t.strokeStyle=i.borderColor,t.lineWidth=i.borderWidth,t.fillStyle=i.backgroundColor,Le(t,i,this.x,this.y))}getRange(){const t=this.options||{};return t.radius+t.hitRadius}}});function go(t,e,i,s){const n=t.indexOf(e);if(-1===n)return((t,e,i,s)=>(\"string\"==typeof e?(i=t.push(e)-1,s.unshift({index:i,label:e})):isNaN(e)&&(i=null),i))(t,e,i,s);return n!==t.lastIndexOf(e)?i:n}function po(t){const e=this.getLabels();return t>=0&&t<e.length?e[t]:t}function mo(t,e,{horizontal:i,minRotation:s}){const n=$(s),o=(i?Math.sin(n):Math.cos(n))||.001,a=.75*e*(\"\"+t).length;return Math.min(e/o,a)}class bo extends Js{constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._endValue=void 0,this._valueRange=0}parse(t,e){return s(t)||(\"number\"==typeof t||t instanceof Number)&&!isFinite(+t)?null:+t}handleTickRangeOptions(){const{beginAtZero:t}=this.options,{minDefined:e,maxDefined:i}=this.getUserBounds();let{min:s,max:n}=this;const o=t=>s=e?s:t,a=t=>n=i?n:t;if(t){const t=F(s),e=F(n);t<0&&e<0?a(0):t>0&&e>0&&o(0)}if(s===n){let e=0===n?1:Math.abs(.05*n);a(n+e),t||o(s-e)}this.min=s,this.max=n}getTickLimit(){const t=this.options.ticks;let e,{maxTicksLimit:i,stepSize:s}=t;return s?(e=Math.ceil(this.max/s)-Math.floor(this.min/s)+1,e>1e3&&(console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`),e=1e3)):(e=this.computeTickLimit(),i=i||11),i&&(e=Math.min(i,e)),e}computeTickLimit(){return Number.POSITIVE_INFINITY}buildTicks(){const t=this.options,e=t.ticks;let i=this.getTickLimit();i=Math.max(2,i);const n=function(t,e){const i=[],{bounds:n,step:o,min:a,max:r,precision:l,count:h,maxTicks:c,maxDigits:d,includeBounds:u}=t,f=o||1,g=c-1,{min:p,max:m}=e,b=!s(a),x=!s(r),_=!s(h),y=(m-p)/(d+1);let v,M,w,k,S=B((m-p)/g/f)*f;if(S<1e-14&&!b&&!x)return[{value:p},{value:m}];k=Math.ceil(m/S)-Math.floor(p/S),k>g&&(S=B(k*S/g/f)*f),s(l)||(v=Math.pow(10,l),S=Math.ceil(S*v)/v),\"ticks\"===n?(M=Math.floor(p/S)*S,w=Math.ceil(m/S)*S):(M=p,w=m),b&&x&&o&&H((r-a)/o,S/1e3)?(k=Math.round(Math.min((r-a)/S,c)),S=(r-a)/k,M=a,w=r):_?(M=b?a:M,w=x?r:w,k=h-1,S=(w-M)/k):(k=(w-M)/S,k=V(k,Math.round(k),S/1e3)?Math.round(k):Math.ceil(k));const P=Math.max(U(S),U(M));v=Math.pow(10,s(l)?P:l),M=Math.round(M*v)/v,w=Math.round(w*v)/v;let D=0;for(b&&(u&&M!==a?(i.push({value:a}),M<a&&D++,V(Math.round((M+D*S)*v)/v,a,mo(a,y,t))&&D++):M<a&&D++);D<k;++D){const t=Math.round((M+D*S)*v)/v;if(x&&t>r)break;i.push({value:t})}return x&&u&&w!==r?i.length&&V(i[i.length-1].value,r,mo(r,y,t))?i[i.length-1].value=r:i.push({value:r}):x&&w!==r||i.push({value:w}),i}({maxTicks:i,bounds:t.bounds,min:t.min,max:t.max,precision:e.precision,step:e.stepSize,count:e.count,maxDigits:this._maxDigits(),horizontal:this.isHorizontal(),minRotation:e.minRotation||0,includeBounds:!1!==e.includeBounds},this._range||this);return\"ticks\"===t.bounds&&j(n,this,\"value\"),t.reverse?(n.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),n}configure(){const t=this.ticks;let e=this.min,i=this.max;if(super.configure(),this.options.offset&&t.length){const s=(i-e)/Math.max(t.length-1,1)/2;e-=s,i+=s}this._startValue=e,this._endValue=i,this._valueRange=i-e}getLabelForValue(t){return ne(t,this.chart.options.locale,this.options.ticks.format)}}class xo extends bo{static id=\"linear\";static defaults={ticks:{callback:ae.formatters.numeric}};determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?t:0,this.max=a(e)?e:1,this.handleTickRangeOptions()}computeTickLimit(){const t=this.isHorizontal(),e=t?this.width:this.height,i=$(this.options.ticks.minRotation),s=(t?Math.sin(i):Math.cos(i))||.001,n=this._resolveTickFontOptions(0);return Math.ceil(e/Math.min(40,n.lineHeight/s))}getPixelForValue(t){return null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getValueForPixel(t){return this._startValue+this.getDecimalForPixel(t)*this._valueRange}}const _o=t=>Math.floor(z(t)),yo=(t,e)=>Math.pow(10,_o(t)+e);function vo(t){return 1===t/Math.pow(10,_o(t))}function Mo(t,e,i){const s=Math.pow(10,i),n=Math.floor(t/s);return Math.ceil(e/s)-n}function wo(t,{min:e,max:i}){e=r(t.min,e);const s=[],n=_o(e);let o=function(t,e){let i=_o(e-t);for(;Mo(t,e,i)>10;)i++;for(;Mo(t,e,i)<10;)i--;return Math.min(i,_o(t))}(e,i),a=o<0?Math.pow(10,Math.abs(o)):1;const l=Math.pow(10,o),h=n>o?Math.pow(10,n):0,c=Math.round((e-h)*a)/a,d=Math.floor((e-h)/l/10)*l*10;let u=Math.floor((c-d)/Math.pow(10,o)),f=r(t.min,Math.round((h+d+u*Math.pow(10,o))*a)/a);for(;f<i;)s.push({value:f,major:vo(f),significand:u}),u>=10?u=u<15?15:20:u++,u>=20&&(o++,u=2,a=o>=0?1:a),f=Math.round((h+d+u*Math.pow(10,o))*a)/a;const g=r(t.max,f);return s.push({value:g,major:vo(g),significand:u}),s}class ko extends Js{static id=\"logarithmic\";static defaults={ticks:{callback:ae.formatters.logarithmic,major:{enabled:!0}}};constructor(t){super(t),this.start=void 0,this.end=void 0,this._startValue=void 0,this._valueRange=0}parse(t,e){const i=bo.prototype.parse.apply(this,[t,e]);if(0!==i)return a(i)&&i>0?i:null;this._zero=!0}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!0);this.min=a(t)?Math.max(0,t):null,this.max=a(e)?Math.max(0,e):null,this.options.beginAtZero&&(this._zero=!0),this._zero&&this.min!==this._suggestedMin&&!a(this._userMin)&&(this.min=t===yo(this.min,0)?yo(this.min,-1):yo(this.min,0)),this.handleTickRangeOptions()}handleTickRangeOptions(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let i=this.min,s=this.max;const n=e=>i=t?i:e,o=t=>s=e?s:t;i===s&&(i<=0?(n(1),o(10)):(n(yo(i,-1)),o(yo(s,1)))),i<=0&&n(yo(s,-1)),s<=0&&o(yo(i,1)),this.min=i,this.max=s}buildTicks(){const t=this.options,e=wo({min:this._userMin,max:this._userMax},this);return\"ticks\"===t.bounds&&j(e,this,\"value\"),t.reverse?(e.reverse(),this.start=this.max,this.end=this.min):(this.start=this.min,this.end=this.max),e}getLabelForValue(t){return void 0===t?\"0\":ne(t,this.chart.options.locale,this.options.ticks.format)}configure(){const t=this.min;super.configure(),this._startValue=z(t),this._valueRange=z(this.max)-z(t)}getPixelForValue(t){return void 0!==t&&0!==t||(t=this.min),null===t||isNaN(t)?NaN:this.getPixelForDecimal(t===this.min?0:(z(t)-this._startValue)/this._valueRange)}getValueForPixel(t){const e=this.getDecimalForPixel(t);return Math.pow(10,this._startValue+e*this._valueRange)}}function So(t){const e=t.ticks;if(e.display&&t.display){const t=ki(e.backdropPadding);return l(e.font&&e.font.size,ue.font.size)+t.height}return 0}function Po(t,e,i,s,n){return t===s||t===n?{start:e-i/2,end:e+i/2}:t<s||t>n?{start:e-i,end:e}:{start:e,end:e+i}}function Do(t){const e={l:t.left+t._padding.left,r:t.right-t._padding.right,t:t.top+t._padding.top,b:t.bottom-t._padding.bottom},i=Object.assign({},e),s=[],o=[],a=t._pointLabels.length,r=t.options.pointLabels,l=r.centerPointLabels?C/a:0;for(let u=0;u<a;u++){const a=r.setContext(t.getPointLabelContext(u));o[u]=a.padding;const f=t.getPointPosition(u,t.drawingArea+o[u],l),g=Si(a.font),p=(h=t.ctx,c=g,d=n(d=t._pointLabels[u])?d:[d],{w:Oe(h,c.string,d),h:d.length*c.lineHeight});s[u]=p;const m=G(t.getIndexAngle(u)+l),b=Math.round(Y(m));Co(i,e,m,Po(b,f.x,p.w,0,180),Po(b,f.y,p.h,90,270))}var h,c,d;t.setCenterPoint(e.l-i.l,i.r-e.r,e.t-i.t,i.b-e.b),t._pointLabelItems=function(t,e,i){const s=[],n=t._pointLabels.length,o=t.options,{centerPointLabels:a,display:r}=o.pointLabels,l={extra:So(o)/2,additionalAngle:a?C/n:0};let h;for(let o=0;o<n;o++){l.padding=i[o],l.size=e[o];const n=Oo(t,o,l);s.push(n),\"auto\"===r&&(n.visible=Ao(n,h),n.visible&&(h=n))}return s}(t,s,o)}function Co(t,e,i,s,n){const o=Math.abs(Math.sin(i)),a=Math.abs(Math.cos(i));let r=0,l=0;s.start<e.l?(r=(e.l-s.start)/o,t.l=Math.min(t.l,e.l-r)):s.end>e.r&&(r=(s.end-e.r)/o,t.r=Math.max(t.r,e.r+r)),n.start<e.t?(l=(e.t-n.start)/a,t.t=Math.min(t.t,e.t-l)):n.end>e.b&&(l=(n.end-e.b)/a,t.b=Math.max(t.b,e.b+l))}function Oo(t,e,i){const s=t.drawingArea,{extra:n,additionalAngle:o,padding:a,size:r}=i,l=t.getPointPosition(e,s+n+a,o),h=Math.round(Y(G(l.angle+E))),c=function(t,e,i){90===i||270===i?t-=e/2:(i>270||i<90)&&(t-=e);return t}(l.y,r.h,h),d=function(t){if(0===t||180===t)return\"center\";if(t<180)return\"left\";return\"right\"}(h),u=function(t,e,i){\"right\"===i?t-=e:\"center\"===i&&(t-=e/2);return t}(l.x,r.w,d);return{visible:!0,x:l.x,y:c,textAlign:d,left:u,top:c,right:u+r.w,bottom:c+r.h}}function Ao(t,e){if(!e)return!0;const{left:i,top:s,right:n,bottom:o}=t;return!(Re({x:i,y:s},e)||Re({x:i,y:o},e)||Re({x:n,y:s},e)||Re({x:n,y:o},e))}function To(t,e,i){const{left:n,top:o,right:a,bottom:r}=i,{backdropColor:l}=e;if(!s(l)){const i=wi(e.borderRadius),s=ki(e.backdropPadding);t.fillStyle=l;const h=n-s.left,c=relay-node.invalid,d=a-n+s.width,u=r-o+s.height;Object.values(i).some((t=>0!==t))?(t.beginPath(),He(t,{x:h,y:c,w:d,h:u,radius:i}),t.fill()):t.fillRect(h,c,d,u)}}function Lo(t,e,i,s){const{ctx:n}=t;if(i)n.arc(t.xCenter,t.yCenter,e,0,O);else{let i=t.getPointPosition(0,e);n.moveTo(i.x,i.y);for(let o=1;o<s;o++)i=t.getPointPosition(o,e),n.lineTo(i.x,i.y)}}class Eo extends bo{static id=\"radialLinear\";static defaults={display:!0,animate:!0,position:\"chartArea\",angleLines:{display:!0,lineWidth:1,borderDash:[],borderDashOffset:0},grid:{circular:!1},startAngle:0,ticks:{showLabelBackdrop:!0,callback:ae.formatters.numeric},pointLabels:{backdropColor:void 0,backdropPadding:2,display:!0,font:{size:10},callback:t=>t,padding:5,centerPointLabels:!1}};static defaultRoutes={\"angleLines.color\":\"borderColor\",\"pointLabels.color\":\"color\",\"ticks.color\":\"color\"};static descriptors={angleLines:{_fallback:\"grid\"}};constructor(t){super(t),this.xCenter=void 0,this.yCenter=void 0,this.drawingArea=void 0,this._pointLabels=[],this._pointLabelItems=[]}setDimensions(){const t=this._padding=ki(So(this.options)/2),e=this.width=this.maxWidth-t.width,i=this.height=this.maxHeight-t.height;this.xCenter=Math.floor(this.left+e/2+t.left),this.yCenter=Math.floor(relay-node.invalid+i/2+t.top),this.drawingArea=Math.floor(Math.min(e,i)/2)}determineDataLimits(){const{min:t,max:e}=this.getMinMax(!1);this.min=a(t)&&!isNaN(t)?t:0,this.max=a(e)&&!isNaN(e)?e:0,this.handleTickRangeOptions()}computeTickLimit(){return Math.ceil(this.drawingArea/So(this.options))}generateTickLabels(t){bo.prototype.generateTickLabels.call(this,t),this._pointLabels=this.getLabels().map(((t,e)=>{const i=d(this.options.pointLabels.callback,[t,e],this);return i||0===i?i:\"\"})).filter(((t,e)=>this.chart.getDataVisibility(e)))}fit(){const t=this.options;t.display&&t.pointLabels.display?Do(this):this.setCenterPoint(0,0,0,0)}setCenterPoint(t,e,i,s){this.xCenter+=Math.floor((t-e)/2),this.yCenter+=Math.floor((i-s)/2),this.drawingArea-=Math.min(this.drawingArea/2,Math.max(t,e,i,s))}getIndexAngle(t){return G(t*(O/(this._pointLabels.length||1))+$(this.options.startAngle||0))}getDistanceFromCenterForValue(t){if(s(t))return NaN;const e=this.drawingArea/(this.max-this.min);return this.options.reverse?(this.max-t)*e:(t-this.min)*e}getValueForDistanceFromCenter(t){if(s(t))return NaN;const e=t/(this.drawingArea/(this.max-this.min));return this.options.reverse?this.max-e:this.min+e}getPointLabelContext(t){const e=this._pointLabels||[];if(t>=0&&t<e.length){const i=e[t];return function(t,e,i){return Ci(t,{label:i,index:e,type:\"pointLabel\"})}(this.getContext(),t,i)}}getPointPosition(t,e,i=0){const s=this.getIndexAngle(t)-E+i;return{x:Math.cos(s)*e+this.xCenter,y:Math.sin(s)*e+this.yCenter,angle:s}}getPointPositionForValue(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))}getBasePosition(t){return this.getPointPositionForValue(t||0,this.getBaseValue())}getPointLabelPosition(t){const{left:e,top:i,right:s,bottom:n}=this._pointLabelItems[t];return{left:e,top:i,right:s,bottom:n}}drawBackground(){const{backgroundColor:t,grid:{circular:e}}=this.options;if(t){const i=this.ctx;i.save(),i.beginPath(),Lo(this,this.getDistanceFromCenterForValue(this._endValue),e,this._pointLabels.length),i.closePath(),i.fillStyle=t,i.fill(),i.restore()}}drawGrid(){const t=this.ctx,e=this.options,{angleLines:i,grid:s,border:n}=e,o=this._pointLabels.length;let a,r,l;if(e.pointLabels.display&&function(t,e){const{ctx:i,options:{pointLabels:s}}=t;for(let n=e-1;n>=0;n--){const e=t._pointLabelItems[n];if(!e.visible)continue;const o=s.setContext(t.getPointLabelContext(n));To(i,o,e);const a=Si(o.font),{x:r,y:l,textAlign:h}=e;Ne(i,t._pointLabels[n],r,l+a.lineHeight/2,a,{color:o.color,textAlign:h,textBaseline:\"middle\"})}}(this,o),s.display&&this.ticks.forEach(((t,e)=>{if(0!==e){r=this.getDistanceFromCenterForValue(t.value);const i=this.getContext(e),a=s.setContext(i),l=n.setContext(i);!function(t,e,i,s,n){const o=t.ctx,a=e.circular,{color:r,lineWidth:l}=e;!a&&!s||!r||!l||i<0||(o.save(),o.strokeStyle=r,o.lineWidth=l,o.setLineDash(n.dash),o.lineDashOffset=n.dashOffset,o.beginPath(),Lo(t,i,a,s),o.closePath(),o.stroke(),o.restore())}(this,a,r,o,l)}})),i.display){for(t.save(),a=o-1;a>=0;a--){const s=i.setContext(this.getPointLabelContext(a)),{color:n,lineWidth:o}=s;o&&n&&(t.lineWidth=o,t.strokeStyle=n,t.setLineDash(s.borderDash),t.lineDashOffset=s.borderDashOffset,r=this.getDistanceFromCenterForValue(e.ticks.reverse?this.min:this.max),l=this.getPointPosition(a,r),t.beginPath(),t.moveTo(this.xCenter,this.yCenter),t.lineTo(l.x,l.y),t.stroke())}t.restore()}}drawBorder(){}drawLabels(){const t=this.ctx,e=this.options,i=e.ticks;if(!i.display)return;const s=this.getIndexAngle(0);let n,o;t.save(),t.translate(this.xCenter,this.yCenter),t.rotate(s),t.textAlign=\"center\",t.textBaseline=\"middle\",this.ticks.forEach(((s,a)=>{if(0===a&&!e.reverse)return;const r=i.setContext(this.getContext(a)),l=Si(r.font);if(n=this.getDistanceFromCenterForValue(this.ticks[a].value),r.showLabelBackdrop){t.font=l.string,o=t.measureText(s.label).width,t.fillStyle=r.backdropColor;const e=ki(r.backdropPadding);t.fillRect(-o/2-e.left,-n-l.size/relay-node.invalid,o+e.width,l.size+e.height)}Ne(t,s.label,0,-n,l,{color:r.color,strokeColor:r.textStrokeColor,strokeWidth:r.textStrokeWidth})})),t.restore()}drawTitle(){}}const Ro={millisecond:{common:!0,size:1,steps:1e3},second:{common:!0,size:1e3,steps:60},minute:{common:!0,size:6e4,steps:60},hour:{common:!0,size:36e5,steps:24},day:{common:!0,size:864e5,steps:30},week:{common:!1,size:6048e5,steps:4},month:{common:!0,size:2628e6,steps:12},quarter:{common:!1,size:7884e6,steps:4},year:{common:!0,size:3154e7}},Io=Object.keys(Ro);function zo(t,e){return t-e}function Fo(t,e){if(s(e))return null;const i=t._adapter,{parser:n,round:o,isoWeekday:r}=t._parseOpts;let l=e;return\"function\"==typeof n&&(l=n(l)),a(l)||(l=\"string\"==typeof n?i.parse(l,n):i.parse(l)),null===l?null:(o&&(l=\"week\"!==o||!N(r)&&!0!==r?i.startOf(l,o):i.startOf(l,\"isoWeek\",r)),+l)}function Vo(t,e,i,s){const n=Io.length;for(let o=Io.indexOf(t);o<n-1;++o){const t=Ro[Io[o]],n=t.steps?t.steps:Number.MAX_SAFE_INTEGER;if(t.common&&Math.ceil((i-e)/(n*t.size))<=s)return Io[o]}return Io[n-1]}function Bo(t,e,i){if(i){if(i.length){const{lo:s,hi:n}=et(i,e);t[i[s]>=e?i[s]:i[n]]=!0}}else t[e]=!0}function Wo(t,e,i){const s=[],n={},o=e.length;let a,r;for(a=0;a<o;++a)r=e[a],n[r]=a,s.push({value:r,major:!1});return 0!==o&&i?function(t,e,i,s){const n=t._adapter,o=+n.startOf(e[0].value,s),a=e[e.length-1].value;let r,l;for(r=o;r<=a;r=+n.add(r,1,s))l=i[r],l>=0&&(e[l].major=!0);return e}(t,s,n,i):s}class No extends Js{static id=\"time\";static defaults={bounds:\"data\",adapters:{},time:{parser:!1,unit:!1,round:!1,isoWeekday:!1,minUnit:\"millisecond\",displayFormats:{}},ticks:{source:\"auto\",callback:!1,major:{enabled:!1}}};constructor(t){super(t),this._cache={data:[],labels:[],all:[]},this._unit=\"day\",this._majorUnit=void 0,this._offsets={},this._normalized=!1,this._parseOpts=void 0}init(t,e={}){const i=t.time||(t.time={}),s=this._adapter=new Rn._date(t.adapters.date);s.init(e),x(i.displayFormats,s.formats()),this._parseOpts={parser:i.parser,round:i.round,isoWeekday:i.isoWeekday},super.init(t),this._normalized=e.normalized}parse(t,e){return void 0===t?null:Fo(this,t)}beforeLayout(){super.beforeLayout(),this._cache={data:[],labels:[],all:[]}}determineDataLimits(){const t=this.options,e=this._adapter,i=t.time.unit||\"day\";let{min:s,max:n,minDefined:o,maxDefined:r}=this.getUserBounds();function l(t){o||isNaN(t.min)||(s=Math.min(s,t.min)),r||isNaN(t.max)||(n=Math.max(n,t.max))}o&&r||(l(this._getLabelBounds()),\"ticks\"===t.bounds&&\"labels\"===t.ticks.source||l(this.getMinMax(!1))),s=a(s)&&!isNaN(s)?s:+e.startOf(Date.now(),i),n=a(n)&&!isNaN(n)?n:+e.endOf(Date.now(),i)+1,this.min=Math.min(s,n-1),this.max=Math.max(s+1,n)}_getLabelBounds(){const t=this.getLabelTimestamps();let e=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY;return t.length&&(e=t[0],i=t[t.length-1]),{min:e,max:i}}buildTicks(){const t=this.options,e=t.time,i=t.ticks,s=\"labels\"===i.source?this.getLabelTimestamps():this._generate();\"ticks\"===t.bounds&&s.length&&(this.min=this._userMin||s[0],this.max=this._userMax||s[s.length-1]);const n=this.min,o=nt(s,n,this.max);return this._unit=e.unit||(i.autoSkip?Vo(e.minUnit,this.min,this.max,this._getLabelCapacity(n)):function(t,e,i,s,n){for(let o=Io.length-1;o>=Io.indexOf(i);o--){const i=Io[o];if(Ro[i].common&&t._adapter.diff(n,s,i)>=e-1)return i}return Io[i?Io.indexOf(i):0]}(this,o.length,e.minUnit,this.min,this.max)),this._majorUnit=i.major.enabled&&\"year\"!==this._unit?function(t){for(let e=Io.indexOf(t)+1,i=Io.length;e<i;++e)if(Ro[Io[e]].common)return Io[e]}(this._unit):void 0,this.initOffsets(s),t.reverse&&o.reverse(),Wo(this,o,this._majorUnit)}afterAutoSkip(){this.options.offsetAfterAutoskip&&this.initOffsets(this.ticks.map((t=>+t.value)))}initOffsets(t=[]){let e,i,s=0,n=0;this.options.offset&&t.length&&(e=this.getDecimalForValue(t[0]),s=1===t.length?1-e:(this.getDecimalForValue(t[1])-e)/2,i=this.getDecimalForValue(t[t.length-1]),n=1===t.length?i:(i-this.getDecimalForValue(t[t.length-2]))/2);const o=t.length<3?.5:.25;s=J(s,0,o),n=J(n,0,o),this._offsets={start:s,end:n,factor:1/(s+1+n)}}_generate(){const t=this._adapter,e=this.min,i=this.max,s=this.options,n=s.time,o=n.unit||Vo(n.minUnit,e,i,this._getLabelCapacity(e)),a=l(s.ticks.stepSize,1),r=\"week\"===o&&n.isoWeekday,h=N(r)||!0===r,c={};let d,u,f=e;if(h&&(f=+t.startOf(f,\"isoWeek\",r)),f=+t.startOf(f,h?\"day\":o),t.diff(i,e,o)>1e5*a)throw new Error(e+\" and \"+i+\" are too far apart with stepSize of \"+a+\" \"+o);const g=\"data\"===s.ticks.source&&this.getDataTimestamps();for(d=f,u=0;d<i;d=+t.add(d,a,o),u++)Bo(c,d,g);return d!==i&&\"ticks\"!==s.bounds&&1!==u||Bo(c,d,g),Object.keys(c).sort(zo).map((t=>+t))}getLabelForValue(t){const e=this._adapter,i=this.options.time;return i.tooltipFormat?e.format(t,i.tooltipFormat):e.format(t,i.displayFormats.datetime)}format(t,e){const i=this.options.time.displayFormats,s=this._unit,n=e||i[s];return this._adapter.format(t,n)}_tickFormatFunction(t,e,i,s){const n=this.options,o=n.ticks.callback;if(o)return d(o,[t,e,i],this);const a=n.time.displayFormats,r=this._unit,l=this._majorUnit,h=r&&a[r],c=l&&a[l],u=i[e],f=l&&c&&u&&u.major;return this._adapter.format(t,s||(f?c:h))}generateTickLabels(t){let e,i,s;for(e=0,i=t.length;e<i;++e)s=t[e],s.label=this._tickFormatFunction(s.value,e,t)}getDecimalForValue(t){return null===t?NaN:(t-this.min)/(this.max-this.min)}getPixelForValue(t){const e=this._offsets,i=this.getDecimalForValue(t);return this.getPixelForDecimal((e.start+i)*e.factor)}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return this.min+i*(this.max-this.min)}_getLabelSize(t){const e=this.options.ticks,i=this.ctx.measureText(t).width,s=$(this.isHorizontal()?e.maxRotation:e.minRotation),n=Math.cos(s),o=Math.sin(s),a=this._resolveTickFontOptions(0).size;return{w:i*n+a*o,h:i*o+a*n}}_getLabelCapacity(t){const e=this.options.time,i=e.displayFormats,s=i[e.unit]||i.millisecond,n=this._tickFormatFunction(t,0,Wo(this,[t],this._majorUnit),s),o=this._getLabelSize(n),a=Math.floor(this.isHorizontal()?this.width/o.w:this.height/o.h)-1;return a>0?a:1}getDataTimestamps(){let t,e,i=this._cache.data||[];if(i.length)return i;const s=this.getMatchingVisibleMetas();if(this._normalized&&s.length)return this._cache.data=s[0].controller.getAllParsedValues(this);for(t=0,e=s.length;t<e;++t)i=i.concat(s[t].controller.getAllParsedValues(this));return this._cache.data=this.normalize(i)}getLabelTimestamps(){const t=this._cache.labels||[];let e,i;if(t.length)return t;const s=this.getLabels();for(e=0,i=s.length;e<i;++e)t.push(Fo(this,s[e]));return this._cache.labels=this._normalized?t:this.normalize(t)}normalize(t){return lt(t.sort(zo))}}function Ho(t,e,i){let s,n,o,a,r=0,l=t.length-1;i?(e>=t[r].pos&&e<=t[l].pos&&({lo:r,hi:l}=it(t,\"pos\",e)),({pos:s,time:o}=t[r]),({pos:n,time:a}=t[l])):(e>=t[r].time&&e<=t[l].time&&({lo:r,hi:l}=it(t,\"time\",e)),({time:s,pos:o}=t[r]),({time:n,pos:a}=t[l]));const h=n-s;return h?o+(a-o)*(e-s)/h:o}var jo=Object.freeze({__proto__:null,CategoryScale:class extends Js{static id=\"category\";static defaults={ticks:{callback:po}};constructor(t){super(t),this._startValue=void 0,this._valueRange=0,this._addedLabels=[]}init(t){const e=this._addedLabels;if(e.length){const t=this.getLabels();for(const{index:i,label:s}of e)t[i]===s&&t.splice(i,1);this._addedLabels=[]}super.init(t)}parse(t,e){if(s(t))return null;const i=this.getLabels();return((t,e)=>null===t?null:J(Math.round(t),0,e))(e=isFinite(e)&&i[e]===t?e:go(i,t,l(e,t),this._addedLabels),i.length-1)}determineDataLimits(){const{minDefined:t,maxDefined:e}=this.getUserBounds();let{min:i,max:s}=this.getMinMax(!0);\"ticks\"===this.options.bounds&&(t||(i=0),e||(s=this.getLabels().length-1)),this.min=i,this.max=s}buildTicks(){const t=this.min,e=this.max,i=this.options.offset,s=[];let n=this.getLabels();n=0===t&&e===n.length-1?n:n.slice(t,e+1),this._valueRange=Math.max(n.length-(i?0:1),1),this._startValue=this.min-(i?.5:0);for(let i=t;i<=e;i++)s.push({value:i});return s}getLabelForValue(t){return po.call(this,t)}configure(){super.configure(),this.isHorizontal()||(this._reversePixels=!this._reversePixels)}getPixelForValue(t){return\"number\"!=typeof t&&(t=this.parse(t)),null===t?NaN:this.getPixelForDecimal((t-this._startValue)/this._valueRange)}getPixelForTick(t){const e=this.ticks;return t<0||t>e.length-1?null:this.getPixelForValue(e[t].value)}getValueForPixel(t){return Math.round(this._startValue+this.getDecimalForPixel(t)*this._valueRange)}getBasePixel(){return this.bottom}},LinearScale:xo,LogarithmicScale:ko,RadialLinearScale:Eo,TimeScale:No,TimeSeriesScale:class extends No{static id=\"timeseries\";static defaults=No.defaults;constructor(t){super(t),this._table=[],this._minPos=void 0,this._tableRange=void 0}initOffsets(){const t=this._getTimestampsForTable(),e=this._table=this.buildLookupTable(t);this._minPos=Ho(e,this.min),this._tableRange=Ho(e,this.max)-this._minPos,super.initOffsets(t)}buildLookupTable(t){const{min:e,max:i}=this,s=[],n=[];let o,a,r,l,h;for(o=0,a=t.length;o<a;++o)l=t[o],l>=e&&l<=i&&s.push(l);if(s.length<2)return[{time:e,pos:0},{time:i,pos:1}];for(o=0,a=s.length;o<a;++o)h=s[o+1],r=s[o-1],l=s[o],Math.round((h+r)/2)!==l&&n.push({time:l,pos:o/(a-1)});return n}_generate(){const t=this.min,e=this.max;let i=super.getDataTimestamps();return i.includes(t)&&i.length||i.splice(0,0,t),i.includes(e)&&1!==i.length||i.push(e),i.sort(((t,e)=>t-e))}_getTimestampsForTable(){let t=this._cache.all||[];if(t.length)return t;const e=this.getDataTimestamps(),i=this.getLabelTimestamps();return t=e.length&&i.length?this.normalize(e.concat(i)):e.length?e:i,t=this._cache.all=t,t}getDecimalForValue(t){return(Ho(this._table,t)-this._minPos)/this._tableRange}getValueForPixel(t){const e=this._offsets,i=this.getDecimalForPixel(t)/e.factor-e.end;return Ho(this._table,i*this._tableRange+this._minPos,!0)}}});const $o=[\"rgb(54, 162, 235)\",\"rgb(255, 99, 132)\",\"rgb(255, 159, 64)\",\"rgb(255, 205, 86)\",\"rgb(75, 192, 192)\",\"rgb(153, 102, 255)\",\"rgb(201, 203, 207)\"],Yo=$o.map((t=>t.replace(\"rgb(\",\"rgba(\").replace(\")\",\", 0.5)\")));function Uo(t){return $o[t%$o.length]}function Xo(t){return Yo[t%Yo.length]}function qo(t){let e=0;return(i,s)=>{const n=t.getDatasetMeta(s).controller;n instanceof jn?e=function(t,e){return t.backgroundColor=t.data.map((()=>Uo(e++))),e}(i,e):n instanceof $n?e=function(t,e){return t.backgroundColor=t.data.map((()=>Xo(e++))),e}(i,e):n&&(e=function(t,e){return t.borderColor=Uo(e),t.backgroundColor=Xo(e),++e}(i,e))}}function Ko(t){let e;for(e in t)if(t[e].borderColor||t[e].backgroundColor)return!0;return!1}var Go={id:\"colors\",defaults:{enabled:!0,forceOverride:!1},beforeLayout(t,e,i){if(!i.enabled)return;const{data:{datasets:s},options:n}=t.config,{elements:o}=n;if(!i.forceOverride&&(Ko(s)||(a=n)&&(a.borderColor||a.backgroundColor)||o&&Ko(o)))return;var a;const r=qo(t);s.forEach(r)}};function Zo(t){if(t._decimated){const e=t._data;delete t._decimated,delete t._data,Object.defineProperty(t,\"data\",{configurable:!0,enumerable:!0,writable:!0,value:e})}}function Jo(t){t.data.datasets.forEach((t=>{Zo(t)}))}var Qo={id:\"decimation\",defaults:{algorithm:\"min-max\",enabled:!1},beforeElementsUpdate:(t,e,i)=>{if(!i.enabled)return void Jo(t);const n=t.width;t.data.datasets.forEach(((e,o)=>{const{_data:a,indexAxis:r}=e,l=t.getDatasetMeta(o),h=a||e.data;if(\"y\"===Pi([r,t.options.indexAxis]))return;if(!l.controller.supportsDecimation)return;const c=t.scales[l.xAxisID];if(\"linear\"!==c.type&&\"time\"!==c.type)return;if(t.options.parsing)return;let{start:d,count:u}=function(t,e){const i=e.length;let s,n=0;const{iScale:o}=t,{min:a,max:r,minDefined:l,maxDefined:h}=o.getUserBounds();return l&&(n=J(it(e,o.axis,a).lo,0,i-1)),s=h?J(it(e,o.axis,r).hi+1,n,i)-n:i-n,{start:n,count:s}}(l,h);if(u<=(i.threshold||4*n))return void Zo(e);let f;switch(s(a)&&(e._data=h,delete e.data,Object.defineProperty(e,\"data\",{configurable:!0,enumerable:!0,get:function(){return this._decimated},set:function(t){this._data=t}})),i.algorithm){case\"lttb\":f=function(t,e,i,s,n){const o=n.samples||s;if(o>=i)return t.slice(e,e+i);const a=[],r=(i-2)/(o-2);let l=0;const h=e+i-1;let c,d,u,f,g,p=e;for(a[l++]=t[p],c=0;c<o-2;c++){let s,n=0,o=0;const h=Math.floor((c+1)*r)+1+e,m=Math.min(Math.floor((c+2)*r)+1,i)+e,b=m-h;for(s=h;s<m;s++)n+=t[s].x,o+=t[s].y;n/=b,o/=b;const x=Math.floor(c*r)+1+e,_=Math.min(Math.floor((c+1)*r)+1,i)+e,{x:y,y:v}=t[p];for(u=f=-1,s=x;s<_;s++)f=.5*Math.abs((y-n)*(t[s].y-v)-(y-t[s].x)*(o-v)),f>u&&(u=f,d=t[s],g=s);a[l++]=d,p=g}return a[l++]=t[h],a}(h,d,u,n,i);break;case\"min-max\":f=function(t,e,i,n){let o,a,r,l,h,c,d,u,f,g,p=0,m=0;const b=[],x=e+i-1,_=t[e].x,y=t[x].x-_;for(o=e;o<e+i;++o){a=t[o],r=(a.x-_)/y*n,l=a.y;const e=0|r;if(e===h)l<f?(f=l,c=o):l>g&&(g=l,d=o),p=(m*p+a.x)/++m;else{const i=o-1;if(!s(c)&&!s(d)){const e=Math.min(c,d),s=Math.max(c,d);e!==u&&e!==i&&b.push({...t[e],x:p}),s!==u&&s!==i&&b.push({...t[s],x:p})}o>0&&i!==u&&b.push(t[i]),b.push(a),h=e,m=0,f=g=l,c=d=u=o}}return b}(h,d,u,n);break;default:throw new Error(`Unsupported decimation algorithm '${i.algorithm}'`)}e._decimated=f}))},destroy(t){Jo(t)}};function ta(t,e,i,s){if(s)return;let n=e[t],o=i[t];return\"angle\"===t&&(n=G(n),o=G(o)),{property:t,start:n,end:o}}function ea(t,e,i){for(;e>t;e--){const t=i[e];if(!isNaN(t.x)&&!isNaN(t.y))break}return e}function ia(t,e,i,s){return t&&e?s(t[i],e[i]):t?t[i]:e?e[i]:0}function sa(t,e){let i=[],s=!1;return n(t)?(s=!0,i=t):i=function(t,e){const{x:i=null,y:s=null}=t||{},n=e.points,o=[];return e.segments.forEach((({start:t,end:e})=>{e=ea(t,e,n);const a=n[t],r=n[e];null!==s?(o.push({x:a.x,y:s}),o.push({x:r.x,y:s})):null!==i&&(o.push({x:i,y:a.y}),o.push({x:i,y:r.y}))})),o}(t,e),i.length?new no({points:i,options:{tension:0},_loop:s,_fullLoop:s}):null}function na(t){return t&&!1!==t.fill}function oa(t,e,i){let s=t[e].fill;const n=[e];let o;if(!i)return s;for(;!1!==s&&-1===n.indexOf(s);){if(!a(s))return s;if(o=t[s],!o)return!1;if(o.visible)return s;n.push(s),s=o.fill}return!1}function aa(t,e,i){const s=function(t){const e=t.options,i=e.fill;let s=l(i&&i.target,i);void 0===s&&(s=!!e.backgroundColor);if(!1===s||null===s)return!1;if(!0===s)return\"origin\";return s}(t);if(o(s))return!isNaN(s.value)&&s;let n=parseFloat(s);return a(n)&&Math.floor(n)===n?function(t,e,i,s){\"-\"!==t&&\"+\"!==t||(i=e+i);if(i===e||i<0||i>=s)return!1;return i}(s[0],e,n,i):[\"origin\",\"start\",\"end\",\"stack\",\"shape\"].indexOf(s)>=0&&s}function ra(t,e,i){const s=[];for(let n=0;n<i.length;n++){const o=i[n],{first:a,last:r,point:l}=la(o,e,\"x\");if(!(!l||a&&r))if(a)s.unshift(l);else if(t.push(l),!r)break}t.push(...s)}function la(t,e,i){const s=t.interpolate(e,i);if(!s)return{};const n=s[i],o=t.segments,a=t.points;let r=!1,l=!1;for(let t=0;t<o.length;t++){const e=o[t],s=a[e.start][i],h=a[e.end][i];if(tt(n,s,h)){r=n===s,l=n===h;break}}return{first:r,last:l,point:s}}class ha{constructor(t){this.x=t.x,this.y=t.y,this.radius=t.radius}pathSegment(t,e,i){const{x:s,y:n,radius:o}=this;return e=e||{start:0,end:O},t.arc(s,n,o,e.end,e.start,!0),!i.bounds}interpolate(t){const{x:e,y:i,radius:s}=this,n=t.angle;return{x:e+Math.cos(n)*s,y:i+Math.sin(n)*s,angle:n}}}function ca(t){const{chart:e,fill:i,line:s}=t;if(a(i))return function(t,e){const i=t.getDatasetMeta(e),s=i&&t.isDatasetVisible(e);return s?i.dataset:null}(e,i);if(\"stack\"===i)return function(t){const{scale:e,index:i,line:s}=t,n=[],o=s.segments,a=s.points,r=function(t,e){const i=[],s=t.getMatchingVisibleMetas(\"line\");for(let t=0;t<s.length;t++){const n=s[t];if(n.index===e)break;n.hidden||i.unshift(n.dataset)}return i}(e,i);r.push(sa({x:null,y:e.bottom},s));for(let t=0;t<o.length;t++){const e=o[t];for(let t=e.start;t<=e.end;t++)ra(n,a[t],r)}return new no({points:n,options:{}})}(t);if(\"shape\"===i)return!0;const n=function(t){const e=t.scale||{};if(e.getPointPositionForValue)return function(t){const{scale:e,fill:i}=t,s=e.options,n=e.getLabels().length,a=s.reverse?e.max:e.min,r=function(t,e,i){let s;return s=\"start\"===t?i:\"end\"===t?e.options.reverse?e.min:e.max:o(t)?t.value:e.getBaseValue(),s}(i,e,a),l=[];if(s.grid.circular){const t=e.getPointPositionForValue(0,a);return new ha({x:t.x,y:t.y,radius:e.getDistanceFromCenterForValue(r)})}for(let t=0;t<n;++t)l.push(e.getPointPositionForValue(t,r));return l}(t);return function(t){const{scale:e={},fill:i}=t,s=function(t,e){let i=null;return\"start\"===t?i=e.bottom:\"end\"===t?i=e.top:o(t)?i=e.getPixelForValue(t.value):e.getBasePixel&&(i=e.getBasePixel()),i}(i,e);if(a(s)){const t=e.isHorizontal();return{x:t?s:null,y:t?null:s}}return null}(t)}(t);return n instanceof ha?n:sa(n,s)}function da(t,e,i){const s=ca(e),{line:n,scale:o,axis:a}=e,r=n.options,l=r.fill,h=r.backgroundColor,{above:c=h,below:d=h}=l||{};s&&n.points.length&&(Ie(t,i),function(t,e){const{line:i,target:s,above:n,below:o,area:a,scale:r}=e,l=i._loop?\"angle\":e.axis;t.save(),\"x\"===l&&o!==n&&(ua(t,s,a.top),fa(t,{line:i,target:s,color:n,scale:r,property:l}),t.restore(),t.save(),ua(t,s,a.bottom));fa(t,{line:i,target:s,color:o,scale:r,property:l}),t.restore()}(t,{line:n,target:s,above:c,below:d,area:i,scale:o,axis:a}),ze(t))}function ua(t,e,i){const{segments:s,points:n}=e;let o=!0,a=!1;t.beginPath();for(const r of s){const{start:s,end:l}=r,h=n[s],c=n[ea(s,l,n)];o?(t.moveTo(h.x,h.y),o=!1):(t.lineTo(h.x,i),t.lineTo(h.x,h.y)),a=!!e.pathSegment(t,r,{move:a}),a?t.closePath():t.lineTo(c.x,i)}t.lineTo(e.first().x,i),t.closePath(),t.clip()}function fa(t,e){const{line:i,target:s,property:n,color:o,scale:a}=e,r=function(t,e,i){const s=t.segments,n=t.points,o=e.points,a=[];for(const t of s){let{start:s,end:r}=t;r=ea(s,r,n);const l=ta(i,n[s],n[r],t.loop);if(!e.segments){a.push({source:t,target:l,start:n[s],end:n[r]});continue}const h=Ii(e,l);for(const e of h){const s=ta(i,o[e.start],o[e.end],e.loop),r=Ri(t,n,s);for(const t of r)a.push({source:t,target:e,start:{[i]:ia(l,s,\"start\",Math.max)},end:{[i]:ia(l,s,\"end\",Math.min)}})}}return a}(i,s,n);for(const{source:e,target:l,start:h,end:c}of r){const{style:{backgroundColor:r=o}={}}=e,d=!0!==s;t.save(),t.fillStyle=r,ga(t,a,d&&ta(n,h,c)),t.beginPath();const u=!!i.pathSegment(t,e);let f;if(d){u?t.closePath():pa(t,s,c,n);const e=!!s.pathSegment(t,l,{move:u,reverse:!0});f=u&&e,f||pa(t,s,h,n)}t.closePath(),t.fill(f?\"evenodd\":\"nonzero\"),t.restore()}}function ga(t,e,i){const{top:s,bottom:n}=e.chart.chartArea,{property:o,start:a,end:r}=i||{};\"x\"===o&&(t.beginPath(),t.rect(a,s,r-a,n-s),t.clip())}function pa(t,e,i,s){const n=e.interpolate(i,s);n&&t.lineTo(n.x,n.y)}var ma={id:\"filler\",afterDatasetsUpdate(t,e,i){const s=(t.data.datasets||[]).length,n=[];let o,a,r,l;for(a=0;a<s;++a)o=t.getDatasetMeta(a),r=o.dataset,l=null,r&&r.options&&r instanceof no&&(l={visible:t.isDatasetVisible(a),index:a,fill:aa(r,a,s),chart:t,axis:o.controller.options.indexAxis,scale:o.vScale,line:r}),o.$filler=l,n.push(l);for(a=0;a<s;++a)l=n[a],l&&!1!==l.fill&&(l.fill=oa(n,a,i.propagate))},beforeDraw(t,e,i){const s=\"beforeDraw\"===i.drawTime,n=t.getSortedVisibleDatasetMetas(),o=t.chartArea;for(let e=n.length-1;e>=0;--e){const i=n[e].$filler;i&&(i.line.updateControlPoints(o,i.axis),s&&i.fill&&da(t.ctx,i,o))}},beforeDatasetsDraw(t,e,i){if(\"beforeDatasetsDraw\"!==i.drawTime)return;const s=t.getSortedVisibleDatasetMetas();for(let e=s.length-1;e>=0;--e){const i=s[e].$filler;na(i)&&da(t.ctx,i,t.chartArea)}},beforeDatasetDraw(t,e,i){const s=e.meta.$filler;na(s)&&\"beforeDatasetDraw\"===i.drawTime&&da(t.ctx,s,t.chartArea)},defaults:{propagate:!0,drawTime:\"beforeDatasetDraw\"}};const ba=(t,e)=>{let{boxHeight:i=e,boxWidth:s=e}=t;return t.usePointStyle&&(i=Math.min(i,e),s=t.pointStyleWidth||Math.min(s,e)),{boxWidth:s,boxHeight:i,itemHeight:Math.max(e,i)}};class xa extends Hs{constructor(t){super(),this._added=!1,this.legendHitBoxes=[],this._hoveredItem=null,this.doughnutMode=!1,this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this.legendItems=void 0,this.columnSizes=void 0,this.lineWidths=void 0,this.maxHeight=void 0,this.maxWidth=void 0,relay-node.invalid=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.height=void 0,this.width=void 0,this._margins=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e,i){this.maxWidth=t,this.maxHeight=e,this._margins=i,this.setDimensions(),this.buildLabels(),this.fit()}setDimensions(){this.isHorizontal()?(this.width=this.maxWidth,this.left=this._margins.left,this.right=this.width):(this.height=this.maxHeight,relay-node.invalid=this._margins.top,this.bottom=this.height)}buildLabels(){const t=this.options.labels||{};let e=d(t.generateLabels,[this.chart],this)||[];t.filter&&(e=e.filter((e=>t.filter(e,this.chart.data)))),t.sort&&(e=e.sort(((e,i)=>t.sort(e,i,this.chart.data)))),this.options.reverse&&e.reverse(),this.legendItems=e}fit(){const{options:t,ctx:e}=this;if(!t.display)return void(this.width=this.height=0);const i=t.labels,s=Si(i.font),n=s.size,o=this._computeTitleHeight(),{boxWidth:a,itemHeight:r}=ba(i,n);let l,h;e.font=s.string,this.isHorizontal()?(l=this.maxWidth,h=this._fitRows(o,n,a,r)+10):(h=this.maxHeight,l=this._fitCols(o,s,a,r)+10),this.width=Math.min(l,t.maxWidth||this.maxWidth),this.height=Math.min(h,t.maxHeight||this.maxHeight)}_fitRows(t,e,i,s){const{ctx:n,maxWidth:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.lineWidths=[0],h=s+a;let c=t;n.textAlign=\"left\",n.textBaseline=\"middle\";let d=-1,u=-h;return this.legendItems.forEach(((t,f)=>{const g=i+e/2+n.measureText(t.text).width;(0===f||l[l.length-1]+g+2*a>o)&&(c+=h,l[l.length-(f>0?0:1)]=0,u+=h,d++),r[f]={left:0,top:u,row:d,width:g,height:s},l[l.length-1]+=g+a})),c}_fitCols(t,e,i,s){const{ctx:n,maxHeight:o,options:{labels:{padding:a}}}=this,r=this.legendHitBoxes=[],l=this.columnSizes=[],h=o-t;let c=a,d=0,u=0,f=0,g=0;return this.legendItems.forEach(((t,o)=>{const{itemWidth:p,itemHeight:m}=function(t,e,i,s,n){const o=function(t,e,i,s){let n=t.text;n&&\"string\"!=typeof n&&(n=n.reduce(((t,e)=>t.length>e.length?t:e)));return e+i.size/2+s.measureText(n).width}(s,t,e,i),a=function(t,e,i){let s=t;\"string\"!=typeof e.text&&(s=_a(e,i));return s}(n,s,e.lineHeight);return{itemWidth:o,itemHeight:a}}(i,e,n,t,s);o>0&&u+m+2*a>h&&(c+=d+a,l.push({width:d,height:u}),f+=d+a,g++,d=u=0),r[o]={left:f,top:u,col:g,width:p,height:m},d=Math.max(d,p),u+=m+a})),c+=d,l.push({width:d,height:u}),c}adjustHitBoxes(){if(!this.options.display)return;const t=this._computeTitleHeight(),{legendHitBoxes:e,options:{align:i,labels:{padding:s},rtl:n}}=this,o=Oi(n,this.left,this.width);if(this.isHorizontal()){let n=0,a=ft(i,this.left+s,this.right-this.lineWidths[n]);for(const r of e)n!==r.row&&(n=r.row,a=ft(i,this.left+s,this.right-this.lineWidths[n])),r.top+=relay-node.invalid+t+s,r.left=o.leftForLtr(o.x(a),r.width),a+=r.width+s}else{let n=0,a=ft(i,relay-node.invalid+t+s,this.bottom-this.columnSizes[n].height);for(const r of e)r.col!==n&&(n=r.col,a=ft(i,relay-node.invalid+t+s,this.bottom-this.columnSizes[n].height)),r.top=a,r.left+=this.left+s,r.left=o.leftForLtr(o.x(r.left),r.width),a+=r.height+s}}isHorizontal(){return\"top\"===this.options.position||\"bottom\"===this.options.position}draw(){if(this.options.display){const t=this.ctx;Ie(t,this),this._draw(),ze(t)}}_draw(){const{options:t,columnSizes:e,lineWidths:i,ctx:s}=this,{align:n,labels:o}=t,a=ue.color,r=Oi(t.rtl,this.left,this.width),h=Si(o.font),{padding:c}=o,d=h.size,u=d/2;let f;this.drawTitle(),s.textAlign=r.textAlign(\"left\"),s.textBaseline=\"middle\",s.lineWidth=.5,s.font=h.string;const{boxWidth:g,boxHeight:p,itemHeight:m}=ba(o,d),b=this.isHorizontal(),x=this._computeTitleHeight();f=b?{x:ft(n,this.left+c,this.right-i[0]),y:relay-node.invalid+c+x,line:0}:{x:this.left+c,y:ft(n,relay-node.invalid+x+c,this.bottom-e[0].height),line:0},Ai(this.ctx,t.textDirection);const _=m+c;this.legendItems.forEach(((y,v)=>{s.strokeStyle=y.fontColor,s.fillStyle=y.fontColor;const M=s.measureText(y.text).width,w=r.textAlign(y.textAlign||(y.textAlign=o.textAlign)),k=g+u+M;let S=f.x,P=f.y;r.setWidth(this.width),b?v>0&&S+k+c>this.right&&(P=f.y+=_,f.line++,S=f.x=ft(n,this.left+c,this.right-i[f.line])):v>0&&P+_>this.bottom&&(S=f.x=S+e[f.line].width+c,f.line++,P=f.y=ft(n,relay-node.invalid+x+c,this.bottom-e[f.line].height));if(function(t,e,i){if(isNaN(g)||g<=0||isNaN(p)||p<0)return;s.save();const n=l(i.lineWidth,1);if(s.fillStyle=l(i.fillStyle,a),s.lineCap=l(i.lineCap,\"butt\"),s.lineDashOffset=l(i.lineDashOffset,0),s.lineJoin=l(i.lineJoin,\"miter\"),s.lineWidth=n,s.strokeStyle=l(i.strokeStyle,a),s.setLineDash(l(i.lineDash,[])),o.usePointStyle){const a={radius:p*Math.SQRT2/2,pointStyle:i.pointStyle,rotation:i.rotation,borderWidth:n},l=r.xPlus(t,g/2);Ee(s,a,l,e+u,o.pointStyleWidth&&g)}else{const o=e+Math.max((d-p)/2,0),a=r.leftForLtr(t,g),l=wi(i.borderRadius);s.beginPath(),Object.values(l).some((t=>0!==t))?He(s,{x:a,y:o,w:g,h:p,radius:l}):s.rect(a,o,g,p),s.fill(),0!==n&&s.stroke()}s.restore()}(r.x(S),P,y),S=gt(w,S+g+u,b?S+k:this.right,t.rtl),function(t,e,i){Ne(s,i.text,t,e+m/2,h,{strikethrough:i.hidden,textAlign:r.textAlign(i.textAlign)})}(r.x(S),P,y),b)f.x+=k+c;else if(\"string\"!=typeof y.text){const t=h.lineHeight;f.y+=_a(y,t)+c}else f.y+=_})),Ti(this.ctx,t.textDirection)}drawTitle(){const t=this.options,e=t.title,i=Si(e.font),s=ki(e.padding);if(!e.display)return;const n=Oi(t.rtl,this.left,this.width),o=this.ctx,a=e.position,r=i.size/2,l=s.top+r;let h,c=this.left,d=this.width;if(this.isHorizontal())d=Math.max(...this.lineWidths),h=relay-node.invalid+l,c=ft(t.align,c,this.right-d);else{const e=this.columnSizes.reduce(((t,e)=>Math.max(t,e.height)),0);h=l+ft(t.align,relay-node.invalid,this.bottom-e-t.labels.padding-this._computeTitleHeight())}const u=ft(a,c,c+d);o.textAlign=n.textAlign(ut(a)),o.textBaseline=\"middle\",o.strokeStyle=e.color,o.fillStyle=e.color,o.font=i.string,Ne(o,e.text,u,h,i)}_computeTitleHeight(){const t=this.options.title,e=Si(t.font),i=ki(t.padding);return t.display?e.lineHeight+i.height:0}_getLegendItemAt(t,e){let i,s,n;if(tt(t,this.left,this.right)&&tt(e,relay-node.invalid,this.bottom))for(n=this.legendHitBoxes,i=0;i<n.length;++i)if(s=n[i],tt(t,s.left,s.left+s.width)&&tt(e,s.top,s.top+s.height))return this.legendItems[i];return null}handleEvent(t){const e=this.options;if(!function(t,e){if((\"mousemove\"===t||\"mouseout\"===t)&&(e.onHover||e.onLeave))return!0;if(e.onClick&&(\"click\"===t||\"mouseup\"===t))return!0;return!1}(t.type,e))return;const i=this._getLegendItemAt(t.x,t.y);if(\"mousemove\"===t.type||\"mouseout\"===t.type){const o=this._hoveredItem,a=(n=i,null!==(s=o)&&null!==n&&s.datasetIndex===n.datasetIndex&&s.index===n.index);o&&!a&&d(e.onLeave,[t,o,this],this),this._hoveredItem=i,i&&!a&&d(e.onHover,[t,i,this],this)}else i&&d(e.onClick,[t,i,this],this);var s,n}}function _a(t,e){return e*(t.text?t.text.length:0)}var ya={id:\"legend\",_element:xa,start(t,e,i){const s=t.legend=new xa({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s)},stop(t){as.removeBox(t,t.legend),delete t.legend},beforeUpdate(t,e,i){const s=t.legend;as.configure(t,s,i),s.options=i},afterUpdate(t){const e=t.legend;e.buildLabels(),e.adjustHitBoxes()},afterEvent(t,e){e.replay||t.legend.handleEvent(e.event)},defaults:{display:!0,position:\"top\",align:\"center\",fullSize:!0,reverse:!1,weight:1e3,onClick(t,e,i){const s=e.datasetIndex,n=i.chart;n.isDatasetVisible(s)?(n.hide(s),e.hidden=!0):(n.show(s),e.hidden=!1)},onHover:null,onLeave:null,labels:{color:t=>t.chart.options.color,boxWidth:40,padding:10,generateLabels(t){const e=t.data.datasets,{labels:{usePointStyle:i,pointStyle:s,textAlign:n,color:o,useBorderRadius:a,borderRadius:r}}=t.legend.options;return t._getSortedDatasetMetas().map((t=>{const l=t.controller.getStyle(i?0:void 0),h=ki(l.borderWidth);return{text:e[t.index].label,fillStyle:l.backgroundColor,fontColor:o,hidden:!t.visible,lineCap:l.borderCapStyle,lineDash:l.borderDash,lineDashOffset:l.borderDashOffset,lineJoin:l.borderJoinStyle,lineWidth:(h.width+h.height)/4,strokeStyle:l.borderColor,pointStyle:s||l.pointStyle,rotation:l.rotation,textAlign:n||l.textAlign,borderRadius:a&&(r||l.borderRadius),datasetIndex:t.index}}),this)}},title:{color:t=>t.chart.options.color,display:!1,position:\"center\",text:\"\"}},descriptors:{_scriptable:t=>!t.startsWith(\"on\"),labels:{_scriptable:t=>![\"generateLabels\",\"filter\",\"sort\"].includes(t)}}};class va extends Hs{constructor(t){super(),this.chart=t.chart,this.options=t.options,this.ctx=t.ctx,this._padding=void 0,relay-node.invalid=void 0,this.bottom=void 0,this.left=void 0,this.right=void 0,this.width=void 0,this.height=void 0,this.position=void 0,this.weight=void 0,this.fullSize=void 0}update(t,e){const i=this.options;if(this.left=0,relay-node.invalid=0,!i.display)return void(this.width=this.height=this.right=this.bottom=0);this.width=this.right=t,this.height=this.bottom=e;const s=n(i.text)?i.text.length:1;this._padding=ki(i.padding);const o=s*Si(i.font).lineHeight+this._padding.height;this.isHorizontal()?this.height=o:this.width=o}isHorizontal(){const t=this.options.position;return\"top\"===t||\"bottom\"===t}_drawArgs(t){const{top:e,left:i,bottom:s,right:n,options:o}=this,a=o.align;let r,l,h,c=0;return this.isHorizontal()?(l=ft(a,i,n),h=e+t,r=n-i):(\"left\"===o.position?(l=i+t,h=ft(a,s,e),c=-.5*C):(l=n-t,h=ft(a,e,s),c=.5*C),r=s-e),{titleX:l,titleY:h,maxWidth:r,rotation:c}}draw(){const t=this.ctx,e=this.options;if(!e.display)return;const i=Si(e.font),s=i.lineHeight/2+this._padding.top,{titleX:n,titleY:o,maxWidth:a,rotation:r}=this._drawArgs(s);Ne(t,e.text,0,0,i,{color:e.color,maxWidth:a,rotation:r,textAlign:ut(e.align),textBaseline:\"middle\",translation:[n,o]})}}var Ma={id:\"title\",_element:va,start(t,e,i){!function(t,e){const i=new va({ctx:t.ctx,options:e,chart:t});as.configure(t,i,e),as.addBox(t,i),t.titleBlock=i}(t,i)},stop(t){const e=t.titleBlock;as.removeBox(t,e),delete t.titleBlock},beforeUpdate(t,e,i){const s=t.titleBlock;as.configure(t,s,i),s.options=i},defaults:{align:\"center\",display:!1,font:{weight:\"bold\"},fullSize:!0,padding:10,position:\"top\",text:\"\",weight:2e3},defaultRoutes:{color:\"color\"},descriptors:{_scriptable:!0,_indexable:!1}};const wa=new WeakMap;var ka={id:\"subtitle\",start(t,e,i){const s=new va({ctx:t.ctx,options:i,chart:t});as.configure(t,s,i),as.addBox(t,s),wa.set(t,s)},stop(t){as.removeBox(t,wa.get(t)),wa.delete(t)},beforeUpdate(t,e,i){const s=wa.get(t);as.configure(t,s,i),s.options=i},defaults:{align:\"center\",display:!1,font:{weight:\"normal\"},fullSize:!0,padding:0,position:\"top\",text:\"\",weight:1500},defaultRoutes:{color:\"color\"},descriptors:{_scriptable:!0,_indexable:!1}};const Sa={average(t){if(!t.length)return!1;let e,i,s=0,n=0,o=0;for(e=0,i=t.length;e<i;++e){const i=t[e].element;if(i&&i.hasValue()){const t=i.tooltipPosition();s+=t.x,n+=t.y,++o}}return{x:s/o,y:n/o}},nearest(t,e){if(!t.length)return!1;let i,s,n,o=e.x,a=e.y,r=Number.POSITIVE_INFINITY;for(i=0,s=t.length;i<s;++i){const s=t[i].element;if(s&&s.hasValue()){const t=q(e,s.getCenterPoint());t<r&&(r=t,n=s)}}if(n){const t=n.tooltipPosition();o=t.x,a=t.y}return{x:o,y:a}}};function Pa(t,e){return e&&(n(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function Da(t){return(\"string\"==typeof t||t instanceof String)&&t.indexOf(\"\\n\")>-1?t.split(\"\\n\"):t}function Ca(t,e){const{element:i,datasetIndex:s,index:n}=e,o=t.getDatasetMeta(s).controller,{label:a,value:r}=o.getLabelAndValue(n);return{chart:t,label:a,parsed:o.getParsed(n),raw:t.data.datasets[s].data[n],formattedValue:r,dataset:o.getDataset(),dataIndex:n,datasetIndex:s,element:i}}function Oa(t,e){const i=t.chart.ctx,{body:s,footer:n,title:o}=t,{boxWidth:a,boxHeight:r}=e,l=Si(e.bodyFont),h=Si(e.titleFont),c=Si(e.footerFont),d=o.length,f=n.length,g=s.length,p=ki(e.padding);let m=p.height,b=0,x=s.reduce(((t,e)=>t+e.before.length+e.lines.length+e.after.length),0);if(x+=t.beforeBody.length+t.afterBody.length,d&&(m+=d*h.lineHeight+(d-1)*e.titleSpacing+e.titleMarginBottom),x){m+=g*(e.displayColors?Math.max(r,l.lineHeight):l.lineHeight)+(x-g)*l.lineHeight+(x-1)*e.bodySpacing}f&&(m+=e.footerMarginTop+f*c.lineHeight+(f-1)*e.footerSpacing);let _=0;const y=function(t){b=Math.max(b,i.measureText(t).width+_)};return i.save(),i.font=h.string,u(t.title,y),i.font=l.string,u(t.beforeBody.concat(t.afterBody),y),_=e.displayColors?a+2+e.boxPadding:0,u(s,(t=>{u(t.before,y),u(t.lines,y),u(t.after,y)})),_=0,i.font=c.string,u(t.footer,y),i.restore(),b+=p.width,{width:b,height:m}}function Aa(t,e,i,s){const{x:n,width:o}=i,{width:a,chartArea:{left:r,right:l}}=t;let h=\"center\";return\"center\"===s?h=n<=(r+l)/2?\"left\":\"right\":n<=o/2?h=\"left\":n>=a-o/2&&(h=\"right\"),function(t,e,i,s){const{x:n,width:o}=s,a=i.caretSize+i.caretPadding;return\"left\"===t&&n+o+a>e.width||\"right\"===t&&n-o-a<0||void 0}(h,t,e,i)&&(h=\"center\"),h}function Ta(t,e,i){const s=i.yAlign||e.yAlign||function(t,e){const{y:i,height:s}=e;return i<s/2?\"top\":i>t.height-s/2?\"bottom\":\"center\"}(t,i);return{xAlign:i.xAlign||e.xAlign||Aa(t,e,i,s),yAlign:s}}function La(t,e,i,s){const{caretSize:n,caretPadding:o,cornerRadius:a}=t,{xAlign:r,yAlign:l}=i,h=n+o,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(a);let g=function(t,e){let{x:i,width:s}=t;return\"right\"===e?i-=s:\"center\"===e&&(i-=s/2),i}(e,r);const p=function(t,e,i){let{y:s,height:n}=t;return\"top\"===e?s+=i:s-=\"bottom\"===e?n+i:n/2,s}(e,l,h);return\"center\"===l?\"left\"===r?g+=h:\"right\"===r&&(g-=h):\"left\"===r?g-=Math.max(c,u)+n:\"right\"===r&&(g+=Math.max(d,f)+n),{x:J(g,0,s.width-e.width),y:J(p,0,s.height-e.height)}}function Ea(t,e,i){const s=ki(i.padding);return\"center\"===e?t.x+t.width/2:\"right\"===e?t.x+t.width-s.right:t.x+s.left}function Ra(t){return Pa([],Da(t))}function Ia(t,e){const i=e&&e.dataset&&e.dataset.tooltip&&e.dataset.tooltip.callbacks;return i?t.override(i):t}const za={beforeTitle:e,title(t){if(t.length>0){const e=t[0],i=e.chart.data.labels,s=i?i.length:0;if(this&&this.options&&\"dataset\"===this.options.mode)return e.dataset.label||\"\";if(e.label)return e.label;if(s>0&&e.dataIndex<s)return i[e.dataIndex]}return\"\"},afterTitle:e,beforeBody:e,beforeLabel:e,label(t){if(this&&this.options&&\"dataset\"===this.options.mode)return t.label+\": \"+t.formattedValue||t.formattedValue;let e=t.dataset.label||\"\";e&&(e+=\": \");const i=t.formattedValue;return s(i)||(e+=i),e},labelColor(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{borderColor:e.borderColor,backgroundColor:e.backgroundColor,borderWidth:e.borderWidth,borderDash:e.borderDash,borderDashOffset:e.borderDashOffset,borderRadius:0}},labelTextColor(){return this.options.bodyColor},labelPointStyle(t){const e=t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);return{pointStyle:e.pointStyle,rotation:e.rotation}},afterLabel:e,afterBody:e,beforeFooter:e,footer:e,afterFooter:e};function Fa(t,e,i,s){const n=t[e].call(i,s);return void 0===n?za[e].call(i,s):n}class Va extends Hs{static positioners=Sa;constructor(t){super(),this.opacity=0,this._active=[],this._eventPosition=void 0,this._size=void 0,this._cachedAnimations=void 0,this._tooltipItems=[],this.$animations=void 0,this.$context=void 0,this.chart=t.chart,this.options=t.options,this.dataPoints=void 0,this.title=void 0,this.beforeBody=void 0,this.body=void 0,this.afterBody=void 0,this.footer=void 0,this.xAlign=void 0,this.yAlign=void 0,this.x=void 0,this.y=void 0,this.height=void 0,this.width=void 0,this.caretX=void 0,this.caretY=void 0,this.labelColors=void 0,this.labelPointStyles=void 0,this.labelTextColors=void 0}initialize(t){this.options=t,this._cachedAnimations=void 0,this.$context=void 0}_resolveAnimations(){const t=this._cachedAnimations;if(t)return t;const e=this.chart,i=this.options.setContext(this.getContext()),s=i.enabled&&e.options.animation&&i.animations,n=new Os(this.chart,s);return s._cacheable&&(this._cachedAnimations=Object.freeze(n)),n}getContext(){return this.$context||(this.$context=(t=this.chart.getContext(),e=this,i=this._tooltipItems,Ci(t,{tooltip:e,tooltipItems:i,type:\"tooltip\"})));var t,e,i}getTitle(t,e){const{callbacks:i}=e,s=Fa(i,\"beforeTitle\",this,t),n=Fa(i,\"title\",this,t),o=Fa(i,\"afterTitle\",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}getBeforeBody(t,e){return Ra(Fa(e.callbacks,\"beforeBody\",this,t))}getBody(t,e){const{callbacks:i}=e,s=[];return u(t,(t=>{const e={before:[],lines:[],after:[]},n=Ia(i,t);Pa(e.before,Da(Fa(n,\"beforeLabel\",this,t))),Pa(e.lines,Fa(n,\"label\",this,t)),Pa(e.after,Da(Fa(n,\"afterLabel\",this,t))),s.push(e)})),s}getAfterBody(t,e){return Ra(Fa(e.callbacks,\"afterBody\",this,t))}getFooter(t,e){const{callbacks:i}=e,s=Fa(i,\"beforeFooter\",this,t),n=Fa(i,\"footer\",this,t),o=Fa(i,\"afterFooter\",this,t);let a=[];return a=Pa(a,Da(s)),a=Pa(a,Da(n)),a=Pa(a,Da(o)),a}_createItems(t){const e=this._active,i=this.chart.data,s=[],n=[],o=[];let a,r,l=[];for(a=0,r=e.length;a<r;++a)l.push(Ca(this.chart,e[a]));return t.filter&&(l=l.filter(((e,s,n)=>t.filter(e,s,n,i)))),t.itemSort&&(l=l.sort(((e,s)=>t.itemSort(e,s,i)))),u(l,(e=>{const i=Ia(t.callbacks,e);s.push(Fa(i,\"labelColor\",this,e)),n.push(Fa(i,\"labelPointStyle\",this,e)),o.push(Fa(i,\"labelTextColor\",this,e))})),this.labelColors=s,this.labelPointStyles=n,this.labelTextColors=o,this.dataPoints=l,l}update(t,e){const i=this.options.setContext(this.getContext()),s=this._active;let n,o=[];if(s.length){const t=Sa[i.position].call(this,s,this._eventPosition);o=this._createItems(i),this.title=this.getTitle(o,i),this.beforeBody=this.getBeforeBody(o,i),this.body=this.getBody(o,i),this.afterBody=this.getAfterBody(o,i),this.footer=this.getFooter(o,i);const e=this._size=Oa(this,i),a=Object.assign({},t,e),r=Ta(this.chart,i,a),l=La(i,a,r,this.chart);this.xAlign=r.xAlign,this.yAlign=r.yAlign,n={opacity:1,x:l.x,y:l.y,width:e.width,height:e.height,caretX:t.x,caretY:t.y}}else 0!==this.opacity&&(n={opacity:0});this._tooltipItems=o,this.$context=void 0,n&&this._resolveAnimations().update(this,n),t&&i.external&&i.external.call(this,{chart:this.chart,tooltip:this,replay:e})}drawCaret(t,e,i,s){const n=this.getCaretPosition(t,i,s);e.lineTo(n.x1,n.y1),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3)}getCaretPosition(t,e,i){const{xAlign:s,yAlign:n}=this,{caretSize:o,cornerRadius:a}=i,{topLeft:r,topRight:l,bottomLeft:h,bottomRight:c}=wi(a),{x:d,y:u}=t,{width:f,height:g}=e;let p,m,b,x,_,y;return\"center\"===n?(_=u+g/2,\"left\"===s?(p=d,m=p-o,x=_+o,y=_-o):(p=d+f,m=p+o,x=_-o,y=_+o),b=p):(m=\"left\"===s?d+Math.max(r,h)+o:\"right\"===s?d+f-Math.max(l,c)-o:this.caretX,\"top\"===n?(x=u,_=x-o,p=m-o,b=m+o):(x=u+g,_=x+o,p=m+o,b=m-o),y=x),{x1:p,x2:m,x3:b,y1:x,y2:_,y3:y}}drawTitle(t,e,i){const s=this.title,n=s.length;let o,a,r;if(n){const l=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.titleAlign,i),e.textAlign=l.textAlign(i.titleAlign),e.textBaseline=\"middle\",o=Si(i.titleFont),a=i.titleSpacing,e.fillStyle=i.titleColor,e.font=o.string,r=0;r<n;++r)e.fillText(s[r],l.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+a,r+1===n&&(t.y+=i.titleMarginBottom-a)}}_drawColorBox(t,e,i,s,n){const a=this.labelColors[i],r=this.labelPointStyles[i],{boxHeight:l,boxWidth:h}=n,c=Si(n.bodyFont),d=Ea(this,\"left\",n),u=s.x(d),f=l<c.lineHeight?(c.lineHeight-l)/2:0,g=e.y+f;if(n.usePointStyle){const e={radius:Math.min(h,l)/2,pointStyle:r.pointStyle,rotation:r.rotation,borderWidth:1},i=s.leftForLtr(u,h)+h/2,o=g+l/2;t.strokeStyle=n.multiKeyBackground,t.fillStyle=n.multiKeyBackground,Le(t,e,i,o),t.strokeStyle=a.borderColor,t.fillStyle=a.backgroundColor,Le(t,e,i,o)}else{t.lineWidth=o(a.borderWidth)?Math.max(...Object.values(a.borderWidth)):a.borderWidth||1,t.strokeStyle=a.borderColor,t.setLineDash(a.borderDash||[]),t.lineDashOffset=a.borderDashOffset||0;const e=s.leftForLtr(u,h),i=s.leftForLtr(s.xPlus(u,1),h-2),r=wi(a.borderRadius);Object.values(r).some((t=>0!==t))?(t.beginPath(),t.fillStyle=n.multiKeyBackground,He(t,{x:e,y:g,w:h,h:l,radius:r}),t.fill(),t.stroke(),t.fillStyle=a.backgroundColor,t.beginPath(),He(t,{x:i,y:g+1,w:h-2,h:l-2,radius:r}),t.fill()):(t.fillStyle=n.multiKeyBackground,t.fillRect(e,g,h,l),t.strokeRect(e,g,h,l),t.fillStyle=a.backgroundColor,t.fillRect(i,g+1,h-2,l-2))}t.fillStyle=this.labelTextColors[i]}drawBody(t,e,i){const{body:s}=this,{bodySpacing:n,bodyAlign:o,displayColors:a,boxHeight:r,boxWidth:l,boxPadding:h}=i,c=Si(i.bodyFont);let d=c.lineHeight,f=0;const g=Oi(i.rtl,this.x,this.width),p=function(i){e.fillText(i,g.x(t.x+f),t.y+d/2),t.y+=d+n},m=g.textAlign(o);let b,x,_,y,v,M,w;for(e.textAlign=o,e.textBaseline=\"middle\",e.font=c.string,t.x=Ea(this,m,i),e.fillStyle=i.bodyColor,u(this.beforeBody,p),f=a&&\"right\"!==m?\"center\"===o?l/2+h:l+2+h:0,y=0,M=s.length;y<M;++y){for(b=s[y],x=this.labelTextColors[y],e.fillStyle=x,u(b.before,p),_=b.lines,a&&_.length&&(this._drawColorBox(e,t,y,g,i),d=Math.max(c.lineHeight,r)),v=0,w=_.length;v<w;++v)p(_[v]),d=c.lineHeight;u(b.after,p)}f=0,d=c.lineHeight,u(this.afterBody,p),t.y-=n}drawFooter(t,e,i){const s=this.footer,n=s.length;let o,a;if(n){const r=Oi(i.rtl,this.x,this.width);for(t.x=Ea(this,i.footerAlign,i),t.y+=i.footerMarginTop,e.textAlign=r.textAlign(i.footerAlign),e.textBaseline=\"middle\",o=Si(i.footerFont),e.fillStyle=i.footerColor,e.font=o.string,a=0;a<n;++a)e.fillText(s[a],r.x(t.x),t.y+o.lineHeight/2),t.y+=o.lineHeight+i.footerSpacing}}drawBackground(t,e,i,s){const{xAlign:n,yAlign:o}=this,{x:a,y:r}=t,{width:l,height:h}=i,{topLeft:c,topRight:d,bottomLeft:u,bottomRight:f}=wi(s.cornerRadius);e.fillStyle=s.backgroundColor,e.strokeStyle=s.borderColor,e.lineWidth=s.borderWidth,e.beginPath(),e.moveTo(a+c,r),\"top\"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+l-d,r),e.quadraticCurveTo(a+l,r,a+l,r+d),\"center\"===o&&\"right\"===n&&this.drawCaret(t,e,i,s),e.lineTo(a+l,r+h-f),e.quadraticCurveTo(a+l,r+h,a+l-f,r+h),\"bottom\"===o&&this.drawCaret(t,e,i,s),e.lineTo(a+u,r+h),e.quadraticCurveTo(a,r+h,a,r+h-u),\"center\"===o&&\"left\"===n&&this.drawCaret(t,e,i,s),e.lineTo(a,r+c),e.quadraticCurveTo(a,r,a+c,r),e.closePath(),e.fill(),s.borderWidth>0&&e.stroke()}_updateAnimationTarget(t){const e=this.chart,i=this.$animations,s=i&&i.x,n=i&&i.y;if(s||n){const i=Sa[t.position].call(this,this._active,this._eventPosition);if(!i)return;const o=this._size=Oa(this,t),a=Object.assign({},i,this._size),r=Ta(e,t,a),l=La(t,a,r,e);s._to===l.x&&n._to===l.y||(this.xAlign=r.xAlign,this.yAlign=r.yAlign,this.width=o.width,this.height=o.height,this.caretX=i.x,this.caretY=i.y,this._resolveAnimations().update(this,l))}}_willRender(){return!!this.opacity}draw(t){const e=this.options.setContext(this.getContext());let i=this.opacity;if(!i)return;this._updateAnimationTarget(e);const s={width:this.width,height:this.height},n={x:this.x,y:this.y};i=Math.abs(i)<.001?0:i;const o=ki(e.padding),a=this.title.length||this.beforeBody.length||this.body.length||this.afterBody.length||this.footer.length;e.enabled&&a&&(t.save(),t.globalAlpha=i,this.drawBackground(n,t,s,e),Ai(t,e.textDirection),n.y+=o.top,this.drawTitle(n,t,e),this.drawBody(n,t,e),this.drawFooter(n,t,e),Ti(t,e.textDirection),t.restore())}getActiveElements(){return this._active||[]}setActiveElements(t,e){const i=this._active,s=t.map((({datasetIndex:t,index:e})=>{const i=this.chart.getDatasetMeta(t);if(!i)throw new Error(\"Cannot find a dataset at index \"+t);return{datasetIndex:t,element:i.data[e],index:e}})),n=!f(i,s),o=this._positionChanged(s,e);(n||o)&&(this._active=s,this._eventPosition=e,this._ignoreReplayEvents=!0,this.update(!0))}handleEvent(t,e,i=!0){if(e&&this._ignoreReplayEvents)return!1;this._ignoreReplayEvents=!1;const s=this.options,n=this._active||[],o=this._getActiveElements(t,n,e,i),a=this._positionChanged(o,t),r=e||!f(o,n)||a;return r&&(this._active=o,(s.enabled||s.external)&&(this._eventPosition={x:t.x,y:t.y},this.update(!0,e))),r}_getActiveElements(t,e,i,s){const n=this.options;if(\"mouseout\"===t.type)return[];if(!s)return e.filter((t=>this.chart.data.datasets[t.datasetIndex]&&void 0!==this.chart.getDatasetMeta(t.datasetIndex).controller.getParsed(t.index)));const o=this.chart.getElementsAtEventForMode(t,n.mode,n,i);return n.reverse&&o.reverse(),o}_positionChanged(t,e){const{caretX:i,caretY:s,options:n}=this,o=Sa[n.position].call(this,t,e);return!1!==o&&(i!==o.x||s!==o.y)}}var Ba={id:\"tooltip\",_element:Va,positioners:Sa,afterInit(t,e,i){i&&(t.tooltip=new Va({chart:t,options:i}))},beforeUpdate(t,e,i){t.tooltip&&t.tooltip.initialize(i)},reset(t,e,i){t.tooltip&&t.tooltip.initialize(i)},afterDraw(t){const e=t.tooltip;if(e&&e._willRender()){const i={tooltip:e};if(!1===t.notifyPlugins(\"beforeTooltipDraw\",{...i,cancelable:!0}))return;e.draw(t.ctx),t.notifyPlugins(\"afterTooltipDraw\",i)}},afterEvent(t,e){if(t.tooltip){const i=e.replay;t.tooltip.handleEvent(e.event,i,e.inChartArea)&&(e.changed=!0)}},defaults:{enabled:!0,external:null,position:\"average\",backgroundColor:\"rgba(0,0,0,0.8)\",titleColor:\"#fff\",titleFont:{weight:\"bold\"},titleSpacing:2,titleMarginBottom:6,titleAlign:\"left\",bodyColor:\"#fff\",bodySpacing:2,bodyFont:{},bodyAlign:\"left\",footerColor:\"#fff\",footerSpacing:2,footerMarginTop:6,footerFont:{weight:\"bold\"},footerAlign:\"left\",padding:6,caretPadding:2,caretSize:5,cornerRadius:6,boxHeight:(t,e)=>e.bodyFont.size,boxWidth:(t,e)=>e.bodyFont.size,multiKeyBackground:\"#fff\",displayColors:!0,boxPadding:0,borderColor:\"rgba(0,0,0,0)\",borderWidth:0,animation:{duration:400,easing:\"easeOutQuart\"},animations:{numbers:{type:\"number\",properties:[\"x\",\"y\",\"width\",\"height\",\"caretX\",\"caretY\"]},opacity:{easing:\"linear\",duration:200}},callbacks:za},defaultRoutes:{bodyFont:\"font\",footerFont:\"font\",titleFont:\"font\"},descriptors:{_scriptable:t=>\"filter\"!==t&&\"itemSort\"!==t&&\"external\"!==t,_indexable:!1,callbacks:{_scriptable:!1,_indexable:!1},animation:{_fallback:!1},animations:{_fallback:\"animation\"}},additionalOptionScopes:[\"interaction\"]};return An.register(Yn,jo,fo,t),An.helpers={...Wi},An._adapters=Rn,An.Animation=Cs,An.Animations=Os,An.animator=xt,An.controllers=en.controllers.items,An.DatasetController=Ns,An.Element=Hs,An.elements=fo,An.Interaction=Xi,An.layouts=as,An.platforms=Ss,An.Scale=Js,An.Ticks=ae,Object.assign(An,Yn,jo,fo,t,Ss),An.Chart=An,\"undefined\"!=typeof window&&(window.Chart=An),An}));\n//# sourceMappingURL=chart.umd.js.map\n";
// ============================================================================
// 【脱敏版】/cf 测试配置：从节点清单【动态生成】，仓库里不存任何真实地址
//
//   作用没变：给用户一份 clash/mihomo 测速配置，用来挑最快的接入点。
//   区别是：代理条目由 RAW_NODES 生成，域名与 UUID 取自环境变量 ——
//   把自己的 NODE_xx_IP / TUNNEL_HOST / VLESS_UUID 配好，这份配置自动就对。
// ============================================================================
function buildCfTestYaml(host, uuid) {
  const names = RAW_NODES.map((n, i) => 'CF-' + String(i + 1).padStart(3, '0'));
  const proxies = RAW_NODES.map((n, i) =>
    '  - name: "' + names[i] + '"\n' +
    '    type: vless\n' +
    '    server: ' + n.server + '\n' +
    '    port: 443\n' +
    '    uuid: ' + uuid + '\n' +
    '    udp: false\n' +
    '    tls: true\n' +
    '    servername: ' + host + '\n' +
    '    network: xhttp\n' +
    '    client-fingerprint: chrome\n' +
    '    xhttp-opts:\n' +
    '      mode: auto\n' +
    '      path: ' + n.path + '\n' +
    '      host: ' + host
  ).join('\n\n');
  const group = names.map(n => '      - "' + n + '"').join('\n');
  return '# 接入点优选测速配置（由服务端按当前节点清单生成）\n' +
    '# 协议: VLESS + xhttp | 需要 mihomo / Clash.Meta（原版 Clash 不支持 xhttp）\n' +
    'mixed-port: 7890\n' +
    'allow-lan: true\n' +
    'mode: rule\n' +
    'log-level: warning\n\n' +
    'proxies:\n' + proxies + '\n\n' +
    'proxy-groups:\n' +
    '  - name: "PROXY"\n' +
    '    type: select\n' +
    '    proxies:\n' + group + '\n\n' +
    'rules:\n' +
    '  - GEOIP,LAN,DIRECT,no-resolve\n' +
    '  - GEOIP,CN,DIRECT\n' +
    '  - MATCH,PROXY\n';
}


const ADMIN_PASSWORD = (env.ADMIN_PASSWORD || "CHANGE_ME");
const SYNC_SECRET = (env.SYNC_SECRET || "CHANGE_ME");
const NOTICE_NAME = "※请优先选择低延迟接入点※";

// 辅助函数：根据 Token 确定性生成用户专属 UUID (保证与手机端一致)
function tokenToUUID(token) {
  if (!token) return '${USER_UUID}';
  const fixedMap = {
    'USER_TOKEN_1': '${USER_UUID}',
    'USER_TOKEN_2': `env.VLESS_UUID`,
    'USER_TOKEN_3': '${USER_UUID}',
    'USER_TOKEN_4': '${USER_UUID}'
  };
  if (fixedMap[token]) return fixedMap[token];

  // 任何新 Token 均采用确定性哈希算法直接生成合法唯一 UUID v4，保证双向永远一致
  let h1 = 0xdeadbeef, h2 = 0x41c64e6d, h3 = 0x9e3779b9, h4 = 0x85ebca6b;
  for (let i = 0; i < token.length; i++) {
    const ch = token.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822519);
    h4 = Math.imul(h4 ^ ch, 3266489917);
  }
  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  const hex = toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
  return `${hex.substring(0,8)}-${hex.substring(8,12)}-4${hex.substring(13,16)}-a${hex.substring(17,20)}-${hex.substring(20,32)}`;
}

// 辅助函数：根据当前活跃用户生成配置指纹版本号
function getUserStoreVersion(userStore) {
  const keys = Object.keys(userStore).sort();
  const summary = keys.map(k => `${k}:${userStore[k].enabled}:${userStore[k].name}:${tokenToUUID(k)}`).join('|');
  let h = 0;
  for (let i = 0; i < summary.length; i++) {
    h = (Math.imul(31, h) + summary.charCodeAt(i)) | 0;
  }
  return 'v_xhttp_' + Math.abs(h).toString(16);
}

// 辅助函数：动态编译生成与手机 Xray 运行架构 100% 匹配的完整 JSON 配置
function generatePhoneXrayConfig(userStore) {
  const clients = [
    { "id": "${USER_UUID}", "email": "shared_legacy", "level": 0 }
  ];
  for (const token in userStore) {
    const u = userStore[token];
    if (u && u.enabled !== false && token) {
      clients.push({
        id: tokenToUUID(token),
        email: `user_${token}`,
        level: 0
      });
    }
  }

  return {
    "log": { "loglevel": "warning" },
    "dns": { "servers": ["8.8.8.8", "1.1.1.1", "localhost"] },
    "api": { "tag": "api", "services": ["StatsService", "HandlerService"] },
    "stats": {},
    "policy": {
      "levels": {
        "0": {
          "statsUserUplink": true,
          "statsUserDownlink": true,
          "statsUserOnline": true
        }
      },
      "system": {
        "statsInboundUplink": true,
        "statsInboundDownlink": true,
        "statsOutboundUplink": true,
        "statsOutboundDownlink": true
      }
    },
    "inbounds": [
      {
        "tag": "api",
        "port": 10085,
        "listen": "127.0.0.1",
        "protocol": "dokodemo-door",
        "settings": { "address": "127.0.0.1" }
      },
      {
        "tag": "proxy-in",
        "port": 8080,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/",
            "mode": "auto"
          }
        }
      },
      {
        "tag": "in-kl",
        "port": 8081,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/kl",
            "mode": "auto"
          }
        }
      },
      {
        "tag": "in-hk",
        "port": 8082,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/hk",
            "mode": "auto"
          }
        }
      },
      {
        "tag": "in-sg",
        "port": 8083,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/sg",
            "mode": "auto"
          }
        }
      },
      {
        "tag": "in-tw",
        "port": 8084,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/tw",
            "mode": "auto"
          }
        }
      },
      {
        "tag": "in-jp",
        "port": 8085,
        "listen": "127.0.0.1",
        "protocol": "vless",
        "settings": {
          "clients": clients,
          "decryption": "none"
        },
        "streamSettings": {
          "network": "xhttp",
          "xhttpSettings": {
            "path": "/jp",
            "mode": "auto"
          }
        }
      }
    ],
    "outbounds": [
      {
        "protocol": "freedom",
        "settings": { "domainStrategy": "UseIP" }
      }
    ],
    "routing": {
      "rules": [
        {
          "inboundTag": ["api"],
          "outboundTag": "api",
          "type": "field"
        }
      ]
    }
  };
}

// ==========================================
// 2. 55个实测全绿节点列表（按五大地区精准绑定分流路径）
// ==========================================
const RAW_NODES = [
  // 🚀 核心专线段（5个，实测 专线直达接入点1）
  { name: "节点所在地-专线-01", server: "${NODE_01_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-专线-02", server: "${NODE_02_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-专线-03", server: "${NODE_03_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-专线-04", server: "${NODE_04_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-专线-05", server: "${NODE_05_IP}", region: "R1", path: "/kl" },

  // 三网极速专线段（6个，实测 100% 强锁 POP1/POP2，三网）
  { name: "节点所在地-移动-极速01", server: "${NODE_06_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-移动-极速02", server: "${NODE_07_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-电信-极速01", server: "${NODE_08_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-电信-极速02", server: "${NODE_09_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-联通-极速01", server: "${NODE_10_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-联通-极速02", server: "${NODE_11_IP}", region: "R2", path: "/sg" },

  // 🌐 智能动态调度 Anycast CNAME 段（实测 100% 命中 POP1）
  { name: "节点所在地-智能调度", server: "${NODE_12_IP}", region: "R1", path: "/kl" },

  //  接入点1段（20个，路径 /kl）
  { name: "节点所在地-接入点1-01", server: "${NODE_13_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-02", server: "${NODE_14_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-03", server: "${NODE_15_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-04", server: "${NODE_16_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-05", server: "${NODE_17_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-06", server: "${NODE_18_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-07", server: "${NODE_19_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-08", server: "${NODE_20_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-09", server: "${NODE_21_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-10", server: "${NODE_22_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-11", server: "${NODE_23_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-12", server: "${NODE_24_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-13", server: "${NODE_25_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-14", server: "${NODE_26_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-15", server: "${NODE_27_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-16", server: "${NODE_28_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-17", server: "${NODE_29_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-18", server: "${NODE_30_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-19", server: "${NODE_31_IP}", region: "R1", path: "/kl" },
  { name: "节点所在地-接入点1-20", server: "${NODE_32_IP}", region: "R1", path: "/kl" },

  //  接入点3段（8个，路径 /hk）
  { name: "节点所在地-接入点3-01", server: "${NODE_33_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-02", server: "${NODE_34_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-03", server: "${NODE_35_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-04", server: "${NODE_36_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-05", server: "${NODE_37_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-06", server: "${NODE_38_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-07", server: "${NODE_39_IP}", region: "R3", path: "/hk" },
  { name: "节点所在地-接入点3-08", server: "${NODE_40_IP}", region: "R3", path: "/hk" },

  //  接入点2段（7个，路径 /sg）
  { name: "节点所在地-接入点2-01", server: "${NODE_41_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-02", server: "${NODE_42_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-03", server: "${NODE_43_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-04", server: "${NODE_44_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-05", server: "${NODE_45_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-06", server: "${NODE_46_IP}", region: "R2", path: "/sg" },
  { name: "节点所在地-接入点2-07", server: "${NODE_47_IP}", region: "R2", path: "/sg" },

  //  R5 段（4 个，路径 /tw）
  { name: "节点所在地-R5-01", server: "${NODE_48_IP}", region: "R5", path: "/tw" },
  { name: "节点所在地-R5-02", server: "${NODE_49_IP}", region: "R5", path: "/tw" },
  { name: "节点所在地-R5-03", server: "${NODE_50_IP}", region: "R5", path: "/tw" },
  { name: "节点所在地-R5-04", server: "${NODE_51_IP}", region: "R5", path: "/tw" },

  //  接入点4段（4个，路径 /jp）
  { name: "节点所在地-接入点4-01", server: "${NODE_52_IP}", region: "R4", path: "/jp" },
  { name: "节点所在地-接入点4-02", server: "${NODE_53_IP}", region: "R4", path: "/jp" },
  { name: "节点所在地-接入点4-03", server: "${NODE_54_IP}", region: "R4", path: "/jp" },
  { name: "节点所在地-接入点4-04", server: "${NODE_55_IP}", region: "R4", path: "/jp" }
];

// ============================================================
// 【2026-10-04 用户要求】节点显示名全线统一为:
//     节点所在地-<实测落点三位码>-<两位序号>        例: 节点所在地-POP1-01 / 节点所在地-POP2-33
//   · 落点 = 手机实测的 colo(读 /cdn-cgi/trace), 不是猜的城市
//   · 序号 = 节点在清单里的全局序号(两位, 稳定不跳), 与落点解耦
//   · 订阅(/sub, clash+v2ray) 与大屏蜂窝矩阵都调用本函数 -> 永远同源同步
//   · 某节点暂时没采到落点时, 用"同路径多数节点"的落点兜底; 再没有就用本地机房
// ============================================================
const NODE_NAME_PREFIX = '节点所在地-';
const PATH_DEFAULT_COLO = { '/kl': 'POP1', '/hk': 'POP2', '/sg': 'POP2', '/tw': 'POP2', '/jp': 'POP2' };

function buildNodeDisplayNames(coloByIp) {
  const map = coloByIp || {};
  // 同路径多数落点(兜底用)
  const pathVotes = {};
  RAW_NODES.forEach(function (n) {
    const c = map[n.server];
    if (c && /^[A-Z]{3}$/.test(c)) {
      pathVotes[n.path] = pathVotes[n.path] || {};
      pathVotes[n.path][c] = (pathVotes[n.path][c] || 0) + 1;
    }
  });
  const pathBest = {};
  Object.keys(pathVotes).forEach(function (p) {
    let best = null, bestN = 0;
    Object.keys(pathVotes[p]).forEach(function (c) {
      if (pathVotes[p][c] > bestN) { bestN = pathVotes[p][c]; best = c; }
    });
    pathBest[p] = best;
  });
  return RAW_NODES.map(function (n, idx) {
    let colo = map[n.server];
    if (!colo || !/^[A-Z]{3}$/.test(colo)) colo = pathBest[n.path] || PATH_DEFAULT_COLO[n.path] || 'UNK';
    const seq = (idx + 1 < 10 ? '0' : '') + (idx + 1);
    return NODE_NAME_PREFIX + colo + '-' + seq;
  });
}

// 读本机房共享快照里的实测落点(ip -> colo)。读不到就返回空对象, 由兜底逻辑补。
async function getNodeColoMap() {
  try {
    const r = await caches.default.match(new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`));
    if (r) {
      const s = await r.json();
      const m = {};
      (s && s.nodeStatus || []).forEach(function (x) {
        if (x && x.ip && typeof x.colo === 'string' && /^[A-Z]{3}$/.test(x.colo)) m[x.ip] = x.colo;
      });
      return m;
    }
  } catch (e) {}
  return {};
}

// ==========================================
// 全局内存级运行状态 (零 KV 消耗，无限次秒级流速读写)
// ==========================================

// ================================================================
// 【跨 isolate 状态统一辅助 · 2026-10-03】
// 背景: Workers 的模块级变量是【每个 isolate 私有的】。同一机房里会有多个
//       isolate, 不同机房更是各有各的。手机上报落在一个 isolate, 而大屏查询
//       常常落在另一个 => 直接读内存会读到 null 或陈旧值。
//       本项目已经因此踩坑 4 次(用户库 / 遥测 / 实时推送 / 手动刷新确认)。
// 规则: 凡是"一个请求写、另一个请求读"的状态, 一律走下面这两个函数。
//       Cache API 在同一机房内所有 isolate 间共享, 免费且无操作次数限制。
// ================================================================
const CACHE_ORIGIN = `https://env.WORKER_HOST/internal_cache/`;

async function cacheGetJson(name) {
  try {
    const r = await caches.default.match(new URL(CACHE_ORIGIN + name));
    if (r) return await r.json();
  } catch (e) {}
  return null;
}

async function cacheGetText(name) {
  try {
    const r = await caches.default.match(new URL(CACHE_ORIGIN + name));
    if (r) return await r.text();
  } catch (e) {}
  return null;
}

async function cachePutJson(name, obj, maxAge) {
  try {
    await caches.default.put(new URL(CACHE_ORIGIN + name),
      new Response(JSON.stringify(obj), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=' + (maxAge || 300) }
      }));
    return true;
  } catch (e) { return false; }
}

let globalMemoryStats = null;
let globalMemoryDaySnapshots = {};
let userAccumulators = {};
let accumulatorsAt = 0;   // 上次把累加器落缓存的时间(节流)
// 【2026-10-04 真实性修复】这里原本硬编码了 5 个 token 的"域名访问次数":
//   USER_TOKEN_5: { google.com:122, chatgpt.com:78, github.com:4, ... }
//   USER_TOKEN_6: { gstatic.com:275, wechat.com:37, ... }  等等
// 这些数字会被直接展示在"用户域名偏好"上, 看起来像真实统计, 但全是编造的,
// 而且会与手机上报的真实统计【叠加】(见下方累加逻辑), 把真数据也污染了。
// 现改为空对象起步: 只显示手机真实上报过的域名统计, 没有就显示空。
let userDomainAccumulators = {};
const DEFAULT_USERS = {
  'USER_TOKEN_7': { name: '用户A', token: 'USER_TOKEN_8', enabled: true, pullCount: 5, lastSeen: '刚刚', lastIp: '-' },
  'USER_TOKEN_9': { name: '用户B', token: 'USER_TOKEN_10', enabled: true, pullCount: 1, lastSeen: '刚刚', lastIp: '-' },
  'USER_TOKEN_11': { name: '用户C', token: 'USER_TOKEN_12', enabled: true, pullCount: 4, lastSeen: '刚刚', lastIp: '-' },
  'USER_TOKEN_13': { name: '测试', token: 'USER_TOKEN_14', enabled: true, pullCount: 14, lastSeen: '刚刚', lastIp: '-' },
  'USER_TOKEN_15': { name: '用户D', token: 'USER_TOKEN_16', enabled: true, pullCount: 0, lastSeen: '从未', lastIp: '-' },
  'USER_TOKEN_17': { name: '用户E', token: 'USER_TOKEN_18', enabled: true, pullCount: 1, lastSeen: '刚刚', lastIp: '-' },
  'USER_TOKEN_19': { name: '用户F', token: 'USER_TOKEN_20', enabled: true, pullCount: 0, lastSeen: '刚刚', lastActive: Date.now() },
};

// ==========================================================
// 【D 2026-10-04】各地区客户端接入质量 —— 观看者浏览器实测回传、按 Cloudflare 机房聚合
// ----------------------------------------------------------
// 为什么必须从客户端采集:
//   手机侧只能测"手机→各地区", 测不到"各地区用户→边缘"; 后者才是真正的用户体验。
//   浏览器已经在测自己的 /api/rtt 往返(1×RTT), 这里只把这个真实测量收上来。
// 为什么按 colo 聚合而不是按国家猜:
//   request.cf.colo 是 Cloudflare 判定该用户实际接入的机房代码(如 POP2/POP1/POP4),
//   由边缘直接给出, 客户端无法伪造 —— 比任何 GeoIP 猜测都准。
// 存储: 独立 Cache API key(免费无限量, 【不占 KV 额度】), 刻意与遥测快照分开 ——
//   手机上报与本接口都会"读-改-写", 共用一个 key 会互相覆盖丢样本。
// ==========================================================
const CLIENT_RTT_KEY = `https://env.WORKER_HOST/internal_cache/client_rtt`;
const CLIENT_RTT_MAX_SAMPLES = 20;   // 每个机房保留最近 20 个真实样本
const CLIENT_RTT_MAX_COLOS = 12;     // 最多保留 12 个机房, 防止无限增长

function medianJs(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

async function readClientRtt() {
  try {
    const r = await caches.default.match(new URL(CLIENT_RTT_KEY));
    if (r) {
      const j = await r.json();
      if (j && typeof j === 'object') return j;
    }
  } catch (e) {}
  return {};
}

async function mergeClientRtt(colo, rtt) {
  const all = await readClientRtt();
  const prev = (all[colo] && Array.isArray(all[colo].s)) ? all[colo].s : [];
  const s = prev.concat([rtt]);
  while (s.length > CLIENT_RTT_MAX_SAMPLES) s.shift();
  all[colo] = { s: s, t: Date.now(), n: ((all[colo] && all[colo].n) || 0) + 1 };
  const keys = Object.keys(all);
  if (keys.length > CLIENT_RTT_MAX_COLOS) {
    keys.sort(function (a, b) { return ((all[a] && all[a].t) || 0) - ((all[b] && all[b].t) || 0); });
    for (let i = 0; i < keys.length - CLIENT_RTT_MAX_COLOS; i++) delete all[keys[i]];
  }
  try {
    await caches.default.put(new URL(CLIENT_RTT_KEY), new Response(JSON.stringify(all), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' }
    }));
  } catch (e) {}
  return all;
}

// 读取最新实时快照, 供 SSE 每秒推送。只走内存与免费 Cache API, 不碰 KV。
async function readLiveSnapshot() {
  // 【关键】优先读本机房 Cache API: 免费、无限量、同机房所有 isolate 共享。
  // 为什么不能只读 isolate 内存: 手机的上报与浏览器的长轮询很可能落在
  // 【不同的 isolate】上, 各自的内存互相看不见 —— 实测会导致推送数据冻结
  // (标签显示"5秒前 -> 9秒前 -> 13秒前"一直变大)。Cache API 是同机房共享的, 能跨 isolate。
  let s = null;
  try {
    const r = await caches.default.match(new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`));
    if (r) s = await r.json();
  } catch (e) {}
  if (!s) s = globalMemoryStats;
  if (!s) return null;
  const hist = s.history15m || [];
  const lastPt = hist.length ? hist[hist.length - 1] : null;
  const live = s.liveRate || {};
  return {
    stamp: (s.timestamp || 0) + ':' + (live.at || 0),
    // 【2026-10-04 修复 T8.6】conns 缺失时返回 null 而不是 0: 前端只接受
    //   数字, 这样 live 推送不会再拿 0 去覆盖轮询到的真实连接数(数字闪烁)。
    conns: (typeof s.conns === 'number' && s.conns > 0) ? s.conns : null,
    up: (typeof live.up === 'number') ? live.up : (lastPt ? Number(lastPt.up) : null),
    down: (typeof live.down === 'number') ? live.down : (lastPt ? Number(lastPt.down) : null),
    rateAt: live.at || null,
    histUp: lastPt ? Number(lastPt.up) : null,
    histDown: lastPt ? Number(lastPt.down) : null,
    ageS: s.timestamp ? Math.max(0, Math.round((Date.now() - s.timestamp) / 1000)) : null,
    // 【2026-10-03 修复】把每区域的时延与真实测量时刻也放进推送快照。
    // 原来每区域年龄只在 60 秒整页轮询时才刷新, 两次轮询之间 UI 会把
    // "距上次抓取的本地耗时"一路累加到 60 秒, 导致显示年龄虚增(实测 81 秒,
    // 而手机上的真实年龄只有 11~16 秒)。现在每次推送都刷新年龄基准。
    buildId: BUILD_ID,
    pingTimes: s.pingTimes || null,
    pings: s.pings || null,
    // 【RTT 修复 2026-10-04】手机↔边缘 的单次 RTT: 与轮询 /api/stats_data 同一口径,
    // 缺失/null 时前端保持原值, 不会用 0 覆盖掉真实数字。
    edgeRtt: (typeof s.edgeRtt === 'number' && s.edgeRtt > 0) ? s.edgeRtt : null,
    // 【RTT 提速 · 方案 C】真实测量历史(去重后每项 = 一次独立测量)
    edgeRttHist: Array.isArray(s.edgeRttHist) ? s.edgeRttHist : null,
    egressHist: Array.isArray(s.egressHist) ? s.egressHist : null,
    // 【方案 A+C】CF 锚点实测落点机房码
    colos: s.colos || null,
    jitters: s.jitters || null,
    // 【2026-10-04 用户要求】55 节点矩阵要跟着实时推送刷新(原来只有 60 秒轮询才更新),
    //   并且带当前探测索引 —— 测速中按 nodes.txt 顺序推进, 不按时间戳乱跳。
    nodeStatus: Array.isArray(s.nodeStatus) ? s.nodeStatus : null,
    nodeIdx: (typeof s.nodeIdx === 'number') ? s.nodeIdx : null,
    nodeTotal: (typeof s.nodeTotal === 'number') ? s.nodeTotal : null,
    nodeFast: (typeof s.nodeFast === 'number') ? s.nodeFast : null,
    serverTime: Date.now(),
    at: Date.now()
  };
}

// ==========================================================
// 全局一致的用户库  (2026-10-03 修复「跨机房用户列表不一致」)
// ----------------------------------------------------------
// 【旧实现的病根】
//   用户库只存在 Cache API + isolate 内存里, 而 Cloudflare 的
//   缓存是【按机房独立】的。手机推 users.json 只会推到一个机房,
//   其它机房永远学不到 → 实测同一天两个入口列表不同:
//     env.WORKER_HOST          7 人 (含 用户F)
//     my-worker.example-pixel...      6 人 (缺 用户F, 且 用户D 重复)
//
// 【新实现】
//   KV 单 key 作为【全局权威源】, 内存 + Cache API 仅作加速。
//   写入只发生在两处: ① 后台增删改用户  ② 手机同步用户库。
//   /sub 拉订阅【绝不写 KV】, 只更新展示字段(lastSeen/pullCount)。
//   → 每天 KV 写入量为个位数, 远离免费额度 1000 次/天。
//   读取带 cacheTtl=60, 重复读走边缘缓存, 不消耗 KV 读配额。
// ==========================================================
const USERS_KV_KEY = 'noc:users:master';
const USERS_KV_READ_TTL = 60;    // 秒: KV 边缘缓存, 让高频读不落 KV
const USERS_MEM_TTL = 120000;    // 毫秒: isolate 内存缓存 (120 秒)
// Cache API 条目有效期(秒) —— 同时决定"单机房最多陈旧多久"。
// 已确认: 某些机房看到用户增删改延迟 2 分钟是可接受的。
const USERS_CACHE_TTL = 120;
const USERS_CACHE_KEY = `https://env.WORKER_HOST/internal_cache/users_master_store`;

// KV 写入预算 (兜底保险丝)
// 主控手段是结构性的: 写入只发生在【成员变更】(增/减/禁用/删除)时。
// 这里是防"将来有人改错代码把写入放进请求路径"的第二道防线。
// 免费额度是 1000 次/天, 单 isolate 限 200 次留足安全余量。
const KV_WRITE_BUDGET = 200;
let kvWriteCount = 0;
let kvWriteDay = '';

// ==========================================================
// 手机主库「手动刷新」同步请求  (2026-10-03)
// ----------------------------------------------------------
// 语义:
//   用户在后台点【刷新】-> Worker 写一个同步请求到 KV
//   -> 手机下次上报(约 6 秒)时收到该请求 -> 强制重新拉取用户库与配置
//   -> 手机回传 syncAck 确认 -> Worker 删除该 key 并记录确认时间
//
// KV 用量核算 (免费额度: 写 1000/天, 读 100000/天):
//   读: 手机每次上报读一次 CMD_KV_KEY (故意不加 cacheTtl, 保证手动刷新即时生效)
//       约 6 秒一次 => 约 14400 次/天, 占免费读额度 100000 的 14.4%, 合规
// ==========================================================
// 【2026-10-04 修复 T5.1】把原来的两个键 noc:sync:req + noc:scan:req 合并为
//   单键 noc:cmd { type:'sync'|'scan', id, at } —— 每次上报只读 1 次 KV
//   (原来是 2 次), 每天省约 1.44 万次读。
// 【2026-10-04 修复 T7.3/T6.5】一次性指令改为【手机 ack 后才删除】:
//   旧实现"读后即删", 一旦响应在网络上丢失, 指令就永久消失(用户点刷新无效)。
//   现在指令保留到手机回报 ack(syncAck / scanAck), 未 ack 则下轮继续下发。
const CMD_KV_KEY = 'noc:cmd';
let syncReqMemory = null;       // 本 isolate 最近一次 sync 请求(供后台页即时显示)
let phoneMasterInfo = null;     // 手机上报的主库状态(版本/生效名单/确认)

async function readCmd(env) {
  if (!env || !env.SUB_DB) return null;
  try {
    const raw = await env.SUB_DB.get(CMD_KV_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

async function writeCmd(env, type, id) {
  const payload = { type: type, id: id, at: Date.now() };
  if (type === 'sync') syncReqMemory = payload;
  let kvOk = true;
  if (env && env.SUB_DB) {
    try { await env.SUB_DB.put(CMD_KV_KEY, JSON.stringify(payload)); } catch (e) { kvOk = false; }
  }
  return { payload: payload, kvOk: kvOk };
}

async function clearCmd(env, onlyType) {
  if (onlyType === 'sync') syncReqMemory = null;
  if (env && env.SUB_DB) {
    try { await env.SUB_DB.delete(CMD_KV_KEY); return true; } catch (e) { return false; }
  }
  return true;
}

async function mergePhoneMaster(patch) {
  // ================================================================
  // 【跨 isolate 治本 · 2026-10-03】
  // 旧写法: phoneMasterInfo = {...phoneMasterInfo, ...patch} 再覆盖共享缓存。
  //   -> 以【本 isolate 私有内存】为基底。手机每 6 秒上报一次都会调本函数,
  //      一旦这次落在"内存里没有确认信息"的 isolate, 就会用无 ack 的版本
  //      覆盖掉共享缓存里已有的 ack => 确认丢失(实测 ackedId 从有变无)。
  // 现写法: 以【共享缓存】为基底合并, 内存与 patch 依次叠加。
  //      确认(ackedAt/ackedId)是只增不减的信息, 永远取最新且绝不被抹掉。
  // ================================================================
  const base = (await cacheGetJson('phone_master')) || {};
  const mem = phoneMasterInfo || {};
  const merged = { ...mem, ...base, ...patch };

  // 确认类只增不减: 从缓存与内存里取较新的那个, 不允许被 patch 抹掉
  const bAt = base.ackedAt || 0, mAt = mem.ackedAt || 0;
  const newestAckAt = Math.max(bAt, mAt, patch.ackedAt || 0);
  if (newestAckAt > 0) {
    merged.ackedAt = newestAckAt;
    const src = (bAt >= mAt) ? base : mem;
    merged.ackedId = (patch.ackedAt === newestAckAt ? patch.ackedId : src.ackedId) || merged.ackedId;
  }
  // 变更时刻同理: 只增不减
  merged.storeChangedAt = Math.max(base.storeChangedAt || 0, mem.storeChangedAt || 0,
                                   patch.storeChangedAt || 0, userStoreChangedAt || 0) || merged.storeChangedAt;

  phoneMasterInfo = merged;
  // 必须 await: Worker 在响应返回后会取消尚未完成的异步工作
  await cachePutJson('phone_master', merged, 2592000);
  return merged;
}

// 读取手机主库状态: 优先本机房共享缓存(跨 isolate 可见), 再退回 isolate 内存
async function getPhoneMaster() {
  const cached = await cacheGetJson('phone_master');
  const mem = phoneMasterInfo || {};
  if (cached && typeof cached === 'object') {
    // 【逐字段合并 · 2026-10-03】原来用 reportedAt 做整体取舍, 会丢掉确认:
    // 本 isolate 内存的 reportedAt 更新(它刚处理过手机上报)但没有 ack,
    // 而共享缓存里有 ack 但 reportedAt 较旧 => 整体丢弃缓存 => ack 丢失。
    // 现在每个字段按自己的时效规则取: 时间戳类取较新, 确认类只增不减。
    const merged = { ...mem };
    if ((cached.reportedAt || 0) > (merged.reportedAt || 0)) merged.reportedAt = cached.reportedAt;
    if (cached.version) merged.version = cached.version;
    if (Array.isArray(cached.tokens) && cached.tokens.length) merged.tokens = cached.tokens;
    if (cached.cloudVersion) merged.cloudVersion = cached.cloudVersion;
    if (typeof cached.inSync === 'boolean') merged.inSync = cached.inSync;
    // 确认信息只增不减: 一旦确认过, 绝不允许被"更旧"的来源抹掉
    if ((cached.ackedAt || 0) > (merged.ackedAt || 0)) {
      merged.ackedId = cached.ackedId;
      merged.ackedAt = cached.ackedAt;
    }
    if (cached.storeChangedAt && !merged.storeChangedAt) merged.storeChangedAt = cached.storeChangedAt;
    phoneMasterInfo = merged;
    return merged;
  }
  return mem || null;
}

let globalMemoryUsers = { ...DEFAULT_USERS };
let globalMemoryUsersAt = 0;
// 用户库版本【真正发生变化】的时刻(毫秒)。区别于 reportedAt(手机每6秒上报一次):
// 那个只说明"手机在线", 不代表用户库同步过 —— 徽标此前把它当成"刚同步", 属于误导。
const USERS_CHANGED_KEY = 'noc:users:changedAt';
let userStoreChangedAt = 0;
let userStoreChangedAtAt = 0;   // 【2026-10-04 T4.2】内存缓存时刻, 60 秒后失效重读
// 绑定是部署级的, 同一 isolate 内所有请求的 env 相同, 故可安全缓存供旧调用点使用
let boundEnv = null;

function usersEmpty(o) {
  return !o || typeof o !== 'object' || Object.keys(o).length === 0;
}

// 写入本机房 Cache API 快路径。刻意使用有限 max-age:
// 到期条目自然失效 -> 下次请求回源 KV -> 一致性仍由 KV 保证。
async function writeUsersCache(usersMap) {
  try {
    await caches.default.put(new URL(USERS_CACHE_KEY), new Response(JSON.stringify(usersMap), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=' + USERS_CACHE_TTL
      }
    }));
  } catch (e) {}
}

// 读取"用户库最后变更时刻": 内存(60s TTL) -> Cache API(60s, 同机房) -> KV(冷启动兜底)
// 【2026-10-04 修复 T4.2】原实现内存无 TTL、Cache 30 天 => 跨机房/跨 isolate 长期
//   读到旧值, "用户库已变更"徽标冻结。现统一 60 秒 TTL。
async function getUserStoreChangedAt() {
  const now = Date.now();
  if (userStoreChangedAt && (now - userStoreChangedAtAt) < 60000) return userStoreChangedAt;
  try {
    const r = await caches.default.match(new URL(`https://env.WORKER_HOST/internal_cache/users_changed_at`));
    if (r) {
      const v = parseInt(await r.text(), 10);
      if (v > 0) { userStoreChangedAt = v; userStoreChangedAtAt = now; return v; }
    }
  } catch (e) {}
  const env = boundEnv;
  if (env && env.SUB_DB) {
    try {
      const raw = await env.SUB_DB.get(USERS_CHANGED_KEY);
      const v = parseInt(raw, 10);
      if (v > 0) { userStoreChangedAt = v; userStoreChangedAtAt = now; return v; }
    } catch (e) {}
  }
  return 0;
}

async function getCachedUsers() {
  const env = boundEnv;
  const now = Date.now();

  // 0) isolate 内存 (最快, 120 秒)
  if (globalMemoryUsersAt && (now - globalMemoryUsersAt) < USERS_MEM_TTL) {
    return { ...globalMemoryUsers };
  }

  // 1) 本机房 Cache API —— 免费、无限量、同机房所有 isolate 共享
  //    【2026-10-03 性能优化】把它提到 KV 之前作为快路径。
  //    旧实现先读 KV: 请求分散落在不同 isolate 上时, 每个新 isolate 内存都是空的,
  //    于是几乎每次请求都真读一次 KV —— 实测 serverMs 中位 170ms, 绝大部分花在这里。
  //    现在: 命中同机房缓存 => 约 1~5ms; 未命中才回源 KV, 并顺手回填缓存。
  try {
    const cachedRes = await caches.default.match(new URL(USERS_CACHE_KEY));
    if (cachedRes) {
      const parsed = await cachedRes.json();
      if (!usersEmpty(parsed)) {
        // 【2026-10-04 修复 T4.5】不再 { ...DEFAULT_USERS, ...parsed } 永久合并。
        // 默认名单只作"空库时的首次种子", 一旦有任何权威数据就以它为准,
        // 否则后台删除默认成员后会在缓存命中瞬间复活。
        globalMemoryUsers = parsed;
        globalMemoryUsersAt = now;
        return { ...globalMemoryUsers };
      }
    }
  } catch (e) {}

  // 2) KV: 全局权威源 (仅在缓存未命中时读, 读后回填本机房缓存)
  if (env && env.SUB_DB) {
    try {
      const raw = await env.SUB_DB.get(USERS_KV_KEY, { cacheTtl: USERS_KV_READ_TTL });
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!usersEmpty(parsed)) {
          // 【2026-10-04 修复 T4.5】KV 是唯一权威源, 不再混入 DEFAULT_USERS。
          globalMemoryUsers = parsed;
          globalMemoryUsersAt = now;
          await writeUsersCache(globalMemoryUsers);
          return { ...globalMemoryUsers };
        }
      }
    } catch (e) {}
  }

  // 3) 再兜底: 内存(若空则为内置默认名单 —— 仅作为空库时的首次种子, 不落 KV)
  globalMemoryUsersAt = now;
  return (globalMemoryUsers && Object.keys(globalMemoryUsers).length)
    ? { ...globalMemoryUsers }
    : { ...DEFAULT_USERS };
}

// 【权威读取】回源 KV, 绕过本机房 Cache API 快路径。
// 可选参数 kvCacheTtl:
//   不传 (undefined) -> 不加任何 KV 边缘缓存, 读到的一定是最新值。
//                       用于后台增删改(正确性必需)与后台页面渲染。
//   传数字(秒)      -> 允许 KV 边缘缓存该秒数以换取速度。
//                       用于大屏轮询这类"能容忍几十秒陈旧"的高频读。
// 说明: 为什么后台增删改必须不加缓存 —— 若基于陈旧数据做修改再写回,
//       会把别的机房刚做的改动直接覆盖掉, 造成真实的数据丢失。
// 高频路径 (/api/report_traffic 每天 14400 次、/sub) 走免费快路径, 不在这里。
async function getAuthoritativeUsers(kvCacheTtl) {
  const env = boundEnv;
  const now = Date.now();
  if (env && env.SUB_DB) {
    try {
      const raw = (typeof kvCacheTtl === 'number')
        ? await env.SUB_DB.get(USERS_KV_KEY, { cacheTtl: kvCacheTtl })
        : await env.SUB_DB.get(USERS_KV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!usersEmpty(parsed)) {
          // 【2026-10-04 修复 T4.5】KV 是唯一权威源, 不再混入 DEFAULT_USERS。
          globalMemoryUsers = parsed;
          globalMemoryUsersAt = now;
          return { ...globalMemoryUsers };
        }
      }
    } catch (e) {}
  }
  return getCachedUsers();
}

// 【权威写入】只在后台增删改用户 与 手机同步用户库 时调用
// 内置写入熔断：只有当"用户集合发生实质变化"时才真正写 KV。
// getUserStoreVersion 只哈希 token/enabled/name/uuid 这类稳定字段，
// 不含 lastSeen/pullCount 等展示字段，所以纯展示更新不会触发写入。
// 这样即使将来有人不小心在请求路径上调用了本函数，也不会打爆配额。
async function saveCachedUsers(usersMap) {
  const env = boundEnv;
  const beforeVer = getUserStoreVersion(globalMemoryUsers);
  const afterVer = getUserStoreVersion(usersMap);

  globalMemoryUsers = { ...usersMap };
  globalMemoryUsersAt = Date.now();

  // 刷新本机房快路径缓存 (有限有效期, 到期后自然回源 KV)
  await writeUsersCache(usersMap);

  // 【用户库最后变更时刻】只在版本真正变化时更新。
  // 写 Cache API(免费无限, 同机房所有 isolate 共享) + KV(冷启动后仍能读到)。
  // 用户增删改很罕见, 所以这点 KV 写入完全在预算内。
  if (afterVer !== beforeVer) {
    userStoreChangedAt = Date.now();
    userStoreChangedAtAt = Date.now();
    try {
      await caches.default.put(new URL(`https://env.WORKER_HOST/internal_cache/users_changed_at`),
        new Response(String(userStoreChangedAt), {
          // 【2026-10-04 T4.2】30 天 -> 60 秒, 避免徽标长期读旧值
          headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=60' }
        }));
    } catch (e) {}
    if (env && env.SUB_DB) {
      try { await env.SUB_DB.put(USERS_CHANGED_KEY, String(userStoreChangedAt)); } catch (e) {}
    }
  }

  // KV 只在实质变化时写, 且受写入预算保护
  // 【2026-10-04 修复 T7.2】返回写入是否成功: 失败/超预算时调用方能提示用户,
  //   不再静默吞掉"用户库没真正落盘"的故障。
  if (env && env.SUB_DB && afterVer !== beforeVer) {
    const today = new Date().toISOString().slice(0, 10);
    if (kvWriteDay !== today) { kvWriteDay = today; kvWriteCount = 0; }
    if (kvWriteCount >= KV_WRITE_BUDGET) {
      console.warn(`KV write budget exhausted (${kvWriteCount}/${KV_WRITE_BUDGET}) - skipped`);
      return false;
    } else {
      try {
        await env.SUB_DB.put(USERS_KV_KEY, JSON.stringify(usersMap));
        kvWriteCount++;
      } catch (e) { return false; }
    }
  }
  return true;
}

// 【非权威触碰】只更新 lastSeen/pullCount 等展示字段。
// 绝不写 KV; 也【不写 Cache API】—— 这里拿到的是本机房当前视图,
// 若把它连同新的 TTL 一起写回缓存, 会让本已过期的数据被无限续期,
// 永远等不到"回源 KV"这一步, 一致性就彻底失效了。
// 只更新 isolate 内存即可; 展示字段轻微不精确不影响任何功能。
async function touchUser(token, patch) {
  const store = await getCachedUsers();
  if (!store[token]) return store;
  store[token] = { ...store[token], ...patch };
  globalMemoryUsers = { ...store };
  globalMemoryUsersAt = Date.now();
  return store;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    boundEnv = env;   // 绑定是部署级的, 供用户库读写函数取用
    const reqStartMs = Date.now();   // 用于统计 CF 边缘真实处理耗时

    // -------------------------------------------------------------
    // -1. 纯 RTT 探针 (/api/rtt)
    //   不做任何计算、不读任何存储, 立刻返回 204。
    //   浏览器用它实测【客户端 ↔ Cloudflare 边缘】的真实网络往返时延。
    //   这是大屏上唯一能真实测到"客户端到边缘"那一跳的办法 ——
    //   你自己 Clash 客户端的 TLS 握手发生在本机, 大屏从原理上测不到。
    // -------------------------------------------------------------
    if (url.pathname === '/api/rtt') {
      return new Response(null, {
        status: 204,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }


    // -------------------------------------------------------------
    // -1.5 客户端接入质量回传 (/api/client_rtt)  【D 2026-10-04】
    //   浏览器把 /api/rtt 实测到的真实往返耗时 POST 回来, 服务端按
    //   request.cf.colo(Cloudflare 判定的实际接入机房)聚合。
    //   这是"各地区用户体验"的唯一正确数据源: 手机侧测不到别人的网络。
    //   成本: 每个观看者 15 秒 1 次(与已有探针同频, 不增加频率), 载荷约 20 字节,
    //         存储走免费 Cache API, 零 KV。
    // -------------------------------------------------------------
    if (url.pathname === '/api/client_rtt') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      const hdr = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
      const colo = (request.cf && request.cf.colo) ? String(request.cf.colo).toUpperCase() : '';
      if (!colo || colo.length > 8 || !/^[A-Z]{3}$/.test(colo)) {
        return new Response(JSON.stringify({ ok: false, reason: 'no_colo' }), { status: 200, headers: hdr });
      }
      let rtt = 0;
      try {
        const b = await request.json();
        rtt = (typeof b.rtt === 'number' && isFinite(b.rtt) && b.rtt > 0 && b.rtt < 60000) ? Math.round(b.rtt) : 0;
      } catch (e) { rtt = 0; }
      if (!rtt) {
        return new Response(JSON.stringify({ ok: false, reason: 'bad_rtt' }), { status: 200, headers: hdr });
      }
      const merged = await mergeClientRtt(colo, rtt);
      const e = merged[colo] || { s: [], n: 0 };
      return new Response(JSON.stringify({ ok: true, colo: colo, n: e.s.length, total: e.n }), { status: 200, headers: hdr });
    }

    // -------------------------------------------------------------
    // -2. 秒级实时推送 (/api/live) —— 长轮询 (long-polling)
    // -------------------------------------------------------------
    // 【为什么不用 SSE】
    //   SSE 需要 new ReadableStream(), 而本 Worker 未设置 compatibility_date
    //   (走 Cloudflare 旧默认), 会抛 1101 异常; 而补上 compatibility_date
    //   会同时改变大量其它运行时行为, 对线上服务有真实风险。
    //   长轮询在语义上完全等价: 服务端一有新数据就立刻返回, 浏览器收到后
    //   立即再挂起。请求量约 3600 次/天(观看 6 小时), 远优于每秒轮询的 21600 次。
    // 【数据来源】本机房 isolate 内存 -> 免费 Cache API; (实测手机与浏览器同在 POP2 机房)
    // -------------------------------------------------------------
    if (url.pathname === '/api/live') {
      if (url.searchParams.get('pwd') !== ADMIN_PASSWORD) {
        return new Response('Unauthorized', { status: 401 });
      }
      const since = url.searchParams.get('since') || '';
      const t0 = Date.now();
      let snap = null;
      let first = true;
      while (first || (Date.now() - t0) < 15000) {
        first = false;
        snap = await readLiveSnapshot();
        if (snap && snap.stamp !== since) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!snap) snap = await readLiveSnapshot();
      return new Response(JSON.stringify(snap || { stamp: since, empty: true }), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }


    // -------------------------------------------------------------
    // Cloudflare 节点优选测速配置 (供国内朋友导入 mihomo/Clash.Meta 实测)
    //   访问 https://env.WORKER_HOST/cf 即可拿到最新的候选节点配置
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // 手动刷新: 大屏按钮 -> 这里记一个 flag -> 手机下次上报(约6秒)拿到
    //   -> 手机落 scan_req 标记 -> ping_scheduler 启动 fast_scan.sh
    //   -> 六大地区背靠背连续测(去掉10秒间隔, 仍10次采样), 每测完一个立即落盘
    //   -> 大屏逐个点亮。约 20 秒全部完成。
    // -------------------------------------------------------------
    if (url.pathname === '/api/manual_scan') {
      if (url.searchParams.get('pwd') !== ADMIN_PASSWORD) {
        return new Response('Unauthorized', { status: 401 });
      }
      // 【2026-10-04 修复 T7.3】只允许 POST, 防止 GET/爬虫误触发全速扫描
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ status: 'error', note: 'manual_scan 仅支持 POST' }), {
          status: 405, headers: { 'Content-Type': 'application/json' }
        });
      }
      const rid = 'sc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      // 【2026-10-04 T7.3/T6.5】写入单键 noc:cmd, 手机 ack 后才删除(不再读后即删)
      const wr = await writeCmd(boundEnv, 'scan', rid);
      return new Response(JSON.stringify({
        status: 'ok',
        id: rid,
        kvOk: wr.kvOk,
        note: '已下发全速扫描指令, 手机约 6 秒内收到, 约 20 秒完成; 手机未确认前会自动补发'
      }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/cf' || url.pathname === '/cf_test.yaml') {
      // 【脱敏版】按当前配置动态生成，代码里不存任何地址
      const _cfYaml = buildCfTestYaml(env.TUNNEL_HOST || 'vpn.example.com',
                                     env.VLESS_UUID || '00000000-0000-0000-0000-000000000000');
      return new Response(_cfYaml, {
        headers: {
          'Content-Type': 'text/yaml; charset=utf-8',
          'Content-Disposition': 'attachment; filename="clash_cf_test.yaml"',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    // -------------------------------------------------------------
    // 0. 手机端 Xray Stats 上报接口 (/api/report_traffic) - 零 KV 写入开销
    // -------------------------------------------------------------
    if (url.pathname === '/api/report_traffic' && request.method === 'POST') {
      const syncKey = request.headers.get('X-Sync-Key');
      if (syncKey !== SYNC_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      try {
        const body = await request.json();
        // 【2026-10-04 T7.3/T6.5】待下发指令的暂存: 必须在 if 块外声明,
        //   供块外的响应构建代码使用(否则 ReferenceError)。
        let pendingSync = null;
        let pendingScan = null;
        if (body && (body.stat || body.pings)) {
          // 0. 冷启动自愈：如果容器新起 globalMemoryStats 为空，先从 Cache API 或 KV 恢复已有历史数据
          if (!globalMemoryStats) {
            try {
              const cache = caches.default;
              const cacheKey = new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`);
              const cachedRes = await cache.match(cacheKey);
              if (cachedRes) {
                globalMemoryStats = await cachedRes.json();
              }
            } catch (e) {}
          }

          if (Object.keys(userAccumulators).length === 0) {
            try {
              const cache = caches.default;
              const cacheKey = new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`);
              const cachedRes = await cache.match(cacheKey);
              if (cachedRes) {
                const parsed = await cachedRes.json();
                if (parsed && parsed.userTraffics && Object.keys(parsed.userTraffics).length > 0) {
                  userAccumulators = { ...parsed.userTraffics };
                }
              }
            } catch (e) {}
          }

          // 【2026-10-04 修复 T4.3】域名统计累加器原来只活在 isolate 内存,
          //   isolate 冷启动/回收即清零, 且不同 isolate 各显示各的。
          //  现在冷启动时从共享快照恢复(快照里带 userDomains), 恢复后继续累加。
          if (Object.keys(userDomainAccumulators).length === 0 && globalMemoryStats && globalMemoryStats.userDomains) {
            try {
              userDomainAccumulators = { ...globalMemoryStats.userDomains };
            } catch (e) {}
          }

          const now = new Date();
          const nowStr = now.toLocaleTimeString('zh-CN', { timeZone: 'UTC' });
          const todayDateStr = now.toLocaleDateString('zh-CN', { timeZone: 'UTC' }).replace(/\//g, '-');

          // 1. 优先更新各用户增量累加器（仅当包含有效 body.stat 数组时）
          if (Array.isArray(body.stat)) {
            const rawUserBytes = {};
            for (const item of body.stat) {
              const val = item.value || 0;
              const m = item.name.match(/user>>>([a-zA-Z0-9_-]+)>>>traffic>>>(downlink|uplink)/);
              if (m) {
                let uToken = m[1];
                if (uToken.startsWith('user_')) uToken = uToken.substring(5);
                rawUserBytes[uToken] = (rawUserBytes[uToken] || 0) + val;
              }
            }

            // 关键归属补丁：如果历史客户端连接了 shared_legacy，将其产生的真实物理流量归属给用户C (USER_TOKEN_21)
            if (rawUserBytes['shared_legacy']) {
              rawUserBytes['USER_TOKEN_22'] = (rawUserBytes['USER_TOKEN_23'] || 0) + rawUserBytes['shared_legacy'];
            }

            const dayOfWeek = now.getDay() || 7;
            const mondayDate = new Date(now);
            mondayDate.setDate(now.getDate() - dayOfWeek + 1);
            const mondayStr = mondayDate.toLocaleDateString('zh-CN', { timeZone: 'UTC' }).replace(/\//g, '-');

            // 【2026-10-04 真实性修复】这里原本有一个 HISTORICAL_BASE:
            //     const HISTORICAL_BASE = { 'USER_TOKEN_24': 1015110466 };  // 1.01 GB
            // 注释称其为"真实物理流量", 但它是【硬编码在代码里的估值】:
            // 每个 token 的流量都被强制 >= 这个数, 于是"用户C"的流量榜上
            // 永远挂着 1.01 GB 从未被真实测量过的流量, 并计入总吞吐。
            // 现已删除: 流量统计只认手机上报的真实累计值, 从 0 开始累加。
            const HISTORICAL_BASE = {};

            for (const uToken in rawUserBytes) {
              const raw = rawUserBytes[uToken];
              const base = HISTORICAL_BASE[uToken] || 0;
              if (!userAccumulators[uToken]) {
                userAccumulators[uToken] = {
                  total: base + raw,
                  day: base + raw,
                  week: base + raw,
                  lastDate: todayDateStr,
                  lastMonday: mondayStr,
                  lastRaw: raw
                };
              } else {
                const acc = userAccumulators[uToken];
                if (acc.total < base) acc.total += base;
                if (acc.day < base) acc.day += base;
                if (acc.week < base) acc.week += base;
                if (acc.lastDate !== todayDateStr) {
                  acc.day = 0;
                  acc.lastDate = todayDateStr;
                }
                if (acc.lastMonday !== mondayStr) {
                  acc.week = 0;
                  acc.lastMonday = mondayStr;
                }
                let delta = 0;
                if (raw >= acc.lastRaw) {
                  delta = raw - acc.lastRaw;
                } else {
                  delta = raw; // Xray 重启时直接视为新增量
                }
                acc.lastRaw = raw;
                acc.total += delta;
                acc.day += delta;
                acc.week += delta;
              }
            }
          }

          if (body.domainStats) {
            for (const key in body.domainStats) {
              const parts = key.split('|');
              if (parts.length === 2) {
                let uToken = parts[0];
                const dom = parts[1];
                if (uToken.startsWith('user_')) uToken = uToken.substring(5);
                if (uToken === 'shared_legacy') uToken = 'USER_TOKEN_25';
                const count = body.domainStats[key];
                if (!userDomainAccumulators[uToken]) userDomainAccumulators[uToken] = {};
                userDomainAccumulators[uToken][dom] = (userDomainAccumulators[uToken][dom] || 0) + count;
              }
            }
          }

          // 【2026-10-04 真实性修复】下面 4 个兜底对象原本是【编造的数据】:
          //   pings    { kl:186, gz:140, sg:213, hk:192, jp:186, tw:185, egress:15 }
          //   jitters  { kl:4, gz:4, sg:4, hk:4, jp:4, tw:4 }       (恒定 4ms, 假得最明显)
          //   losses   { kl:0, gz:0, sg:0, hk:0, jp:0, tw:0 }
          // 冷启动/内存为空时, 这些假数字会直接顶到大屏上, 且看起来完全正常。
          // 现改为空对象: 没有真实上报就什么都不显示(前端按缺值渲染 "--" / "未测到")。
          // 注意不能再用 0 兜底 —— 0 的语义是"测了但不可达", 与"没有数据"必须区分。
          const prevPings = (globalMemoryStats && globalMemoryStats.pings) ? globalMemoryStats.pings : {};
          const mergedPings = body.pings ? { ...prevPings, ...body.pings } : prevPings;

          const prevJitters = (globalMemoryStats && globalMemoryStats.jitters) ? globalMemoryStats.jitters : {};
          const mergedJitters = body.jitters ? { ...prevJitters, ...body.jitters } : prevJitters;

          const prevPingTimes = (globalMemoryStats && globalMemoryStats.pingTimes) ? globalMemoryStats.pingTimes : {};
          const mergedPingTimes = body.pingTimes ? { ...prevPingTimes, ...body.pingTimes } : prevPingTimes;

          const prevLosses = (globalMemoryStats && globalMemoryStats.losses) ? globalMemoryStats.losses : {};
          const mergedLosses = body.losses ? { ...prevLosses, ...body.losses } : prevLosses;

          // 【RTT 修复 2026-10-04】手机 ↔ CF 边缘 的真实单次 RTT(TCP time_connect)。
          // 语义: body 里有正整数就用新的; 手机没带(旧脚本/探测全失败)则沿用快照里
          // 已有的值; 两者都没有才记 0(前端按"--"渲染, 不编造)。
          const prevEdge = (globalMemoryStats && typeof globalMemoryStats.edgeRtt === 'number') ? globalMemoryStats.edgeRtt : 0;
          const mergedEdgeRtt = (typeof body.edgeRtt === 'number' && body.edgeRtt > 0) ? body.edgeRtt : prevEdge;

          // 【RTT 提速 2026-10-04 · 方案 C】把最近 10 次【真实测量】存成环形数组随快照下发,
          // 这样浏览器首次轮询就拿到一批独立样本, 不必自己攒 3 轮。
          // 关键: 只在数值变化时追加(去重)。手机虽然每 6 秒上报一次, 但边缘 RTT 每 15 秒
          // 才真正测一次, 中间几次是同一个值的重复; 若照单全收, 所谓"10 个样本的中位"
          // 就是 2~3 个真实测量被复制 10 份 —— 那是变相造假。去重后:
          //   数组里每一个元素 = 一次独立的真实测量。
          const pushHist = function (arr, v, cap) {
            if (typeof v !== 'number' || !isFinite(v) || v <= 0) return Array.isArray(arr) ? arr.slice() : [];
            const a = Array.isArray(arr) ? arr.slice() : [];
            if (a.length && a[a.length - 1] === v) return a;   // 同一次测量被重复上报 => 不重复计数
            a.push(v);
            while (a.length > cap) a.shift();
            return a;
          };
          const edgeRttHist = pushHist(globalMemoryStats && globalMemoryStats.edgeRttHist,
            (typeof body.edgeRtt === 'number' && body.edgeRtt > 0) ? body.edgeRtt : 0, 10);
          const egressHist = pushHist(globalMemoryStats && globalMemoryStats.egressHist,
            (body.pings && typeof body.pings.egress === 'number') ? body.pings.egress : 0, 10);

          // 【第二行 2026-10-04】国际出口质量(六地区【真单播】目标)。
          // 手机每 60 秒只轮测 1 个地区 => 必须【逐键合并】: 没被轮到的地区要保留上一轮
          // 的值与时间戳, 否则整行每 60 秒只剩 1 个数字、其余全空。
          // 0 值不覆盖旧值(0 = 未测到/不可达, 前端显示 "--", 不能把上一轮的好值抹掉)。
          const _numMap = function (m) {
            const o = {};
            if (m && typeof m === 'object') {
              for (const k in m) {
                const v = m[k];
                if (typeof v === 'number' && isFinite(v) && v > 0) o[k] = v;
              }
            }
            return o;
          };

          // 【方案 A+C 2026-10-04】CF 锚点的【实测落点机房码】(colo=XXX)。
          // 白名单校验: 只接受 3 位大写字母(真实机房码) 或 '?'(未测到)。
          // 【2026-10-04】'ALI' 已从白名单移除 —— 阿里锚点被彻底删除, 不该再被接受。
          // 前端拿到的永远是安全字符串, 不会因为手机写坏文件就把脏值渲染出来。
          const _coloMap = function (m) {
            const o = {};
            if (m && typeof m === 'object') {
              for (const k in m) {
                const v = m[k];
                if (typeof v === 'string' && /^([A-Z]{3}|\?)$/.test(v) && v !== 'ALI') o[k] = v;
              }
            }
            return o;
          };
          const mergedColos = Object.assign({}, _coloMap(globalMemoryStats && globalMemoryStats.colos), _coloMap(body.colos));

          // ---- 手机主库状态 与 手动刷新确认 ----
          // 【2026-10-04 修复 T4.4】只信 KV 权威源: 不再 || syncReqMemory 兜底
          // (isolate 私有内存里的旧指令会在跨 isolate 场景下复活已消费的请求)。
          // 【2026-10-04 修复 T7.3/T6.5】指令改为 ack 后才删除, 未 ack 继续下发。
          const curReq = await readCmd(env);
          if (typeof body.phoneVersion === 'string') {
            await mergePhoneMaster({
              version: body.phoneVersion,
              tokens: Array.isArray(body.phoneTokens) ? body.phoneTokens : [],
              reportedAt: Date.now()
            });
          }
          let syncAcked = false;
          if (body.syncAck && curReq && curReq.type === 'sync' && curReq.id === body.syncAck) {
            // 手机确认已按指令重新拉取并生效 -> 撤销请求(1 次 KV 删除), 记录确认时间
            syncAcked = true;
            await mergePhoneMaster({ ackedId: body.syncAck, ackedAt: Date.now() });
            await clearCmd(env, 'sync');
          }
          let scanAcked = false;
          if (body.scanAck && curReq && curReq.type === 'scan' && curReq.id === body.scanAck) {
            scanAcked = true;
            await clearCmd(env, 'scan');
          }
          pendingSync = (curReq && curReq.type === 'sync' && !syncAcked) ? curReq : null;
          pendingScan = (curReq && curReq.type === 'scan' && !scanAcked) ? curReq : null;
          // ============================================================
          // 真实实时速率: 用两次上报之间的字节增量换算 Mbps
          // (history15m 每 30 秒才一个点, 太粗; 每次上报(约 6 秒)都能算出真值)
          // 【2026-10-04 修复·关键, 两个根因叠加】
          //   ① 数据源必须是 xray 原始计数 stat(每 6 秒都有): 原来取
          //      body.userTraffics —— 那是【12 小时】才发一次的重载荷, 平时为空,
          //      于是 totUp/totDown 恒为 0、速率恒 0(实测"上行带宽恒 0.00")。
          //   ② 上一份采样必须来自【共享快照】(同机房共享): 原来取 isolate 本地
          //      内存, 而手机上报与浏览器请求常落在不同 isolate, 根本拿不到。
          //   ③ 变量用【块外声明、块内赋值】传递, 供下面写快照用(上一版把块内变量
          //      用到块外, 直接 ReferenceError 把上报打断, 已回滚)。
          // ============================================================
          let _totalSampleOut = null;
          {
            let totUp = 0, totDown = 0;
            try {
              (body.stat || []).forEach(function (it) {
                const nm = (it && it.name) || '';
                if (nm.indexOf('user>>>user_') !== 0) return;   // 只统计【用户】流量
                const v = Number(it.value) || 0;
                if (nm.indexOf('traffic>>>uplink') >= 0) totUp += v;
                else if (nm.indexOf('traffic>>>downlink') >= 0) totDown += v;
              });
            } catch (e) {}
            let _snapRate = null;
            try { _snapRate = await cacheGetJson('stats_latest'); } catch (e) {}
            const prev = (_snapRate && _snapRate.totalSample)
                      || (globalMemoryStats && globalMemoryStats.totalSample);
            let liveRate = { up: null, down: null, at: Date.now() };
            let liveRateComputed = false;
            if (prev && prev.at && totUp >= prev.up && totDown >= prev.down) {
              const dtSec = (Date.now() - prev.at) / 1000;
              if (dtSec >= 2 && dtSec <= 300) {
                liveRate = {
                  up: ((totUp - prev.up) * 8) / dtSec / 1000000,
                  down: ((totDown - prev.down) * 8) / dtSec / 1000000,
                  at: Date.now()
                };
                liveRateComputed = true;
              }
            }
            // 冷启动/上一份过旧时沿用共享快照里的旧速率(避免速率卡闪空)
            if (!liveRateComputed) {
              if (_snapRate && _snapRate.liveRate) liveRate = _snapRate.liveRate;
              else if (globalMemoryStats && globalMemoryStats.liveRate) liveRate = globalMemoryStats.liveRate;
            }
            globalMemoryStats = globalMemoryStats || {};
            globalMemoryStats.liveRate = liveRate;
            const _ts = { up: totUp, down: totDown, at: Date.now() };
            globalMemoryStats.totalSample = _ts;
            _totalSampleOut = _ts;          // 交给下面的快照(块外变量)
          }

          // 【2026-10-04】从 xray 原始计数(stat)提取 per-user 字节总和,
          //   存进快照 —— 用于"新接入用户"的实时在线判定:
          //   userTraffics 是 12 小时重载荷, 新用户不在里面, 但 stat 每 6 秒都有。
          const statUserBytes = {};
          try {
            (body.stat || []).forEach(function (it) {
              const _m = /^user>>>user_(.+)>>>traffic>>>(uplink|downlink)$/.exec(it.name || '');
              if (_m) statUserBytes[_m[1]] = (statUserBytes[_m[1]] || 0) + (Number(it.value) || 0);
            });
          } catch (e) {}

          // ============================================================
          // 【2026-10-04 在线判定彻底改为实时】用两次上报的 xray 字节差算
          //   "最后增长时刻"与实时速率。绝不使用重载荷里的 online/lastActive ——
          //   那是 12 小时才更新一次的快照值, 实测会把一天前的会话一直显示成
          //   "在线待命"(用户核查时发现)。
          // 【注意】这里必须【自己读一份上一快照】: 下面的 _prevSnap 是"缺字段时才读"
          //   的条件变量, 且在更后面才声明 —— 直接引用它会命中 let 的 TDZ 而抛
          //   ReferenceError, 把整个上报处理打断(上一版就是这样把数据流搞停的)。
          // ============================================================
          let _prevSnapForRate = null;
          try { _prevSnapForRate = await cacheGetJson('stats_latest'); } catch (e) {}
          const _prevBytes2 = (_prevSnapForRate && _prevSnapForRate.statUserBytes) || {};
          const _prevGrowAt = (_prevSnapForRate && _prevSnapForRate.userGrowAt) || {};
          const _prevRates = (_prevSnapForRate && _prevSnapForRate.userRates) || {};
          const _prevBytesAt2 = (_prevSnapForRate && _prevSnapForRate.statUserBytesAt) || 0;
          const _nowMs2 = Date.now();
          const userGrowAt = {};
          const userRates = {};
          try {
            const _toks = {};
            Object.keys(statUserBytes).forEach(function (t) { _toks[t] = 1; });
            Object.keys(_prevGrowAt).forEach(function (t) { _toks[t] = 1; });
            Object.keys(_prevBytes2).forEach(function (t) { _toks[t] = 1; });
            Object.keys(_toks).forEach(function (tk) {
              const cur = statUserBytes[tk] || 0;
              const old = _prevBytes2[tk] || 0;
              if (cur > old) {
                userGrowAt[tk] = Math.floor(_nowMs2 / 1000);
                if (_prevBytesAt2 > 0) {
                  const dt = Math.max(1, (_nowMs2 - _prevBytesAt2) / 1000);
                  const bps = (cur - old) / dt;
                  if (bps > 0) userRates[tk] = Math.round(bps);
                }
              } else {
                if (_prevGrowAt[tk]) userGrowAt[tk] = _prevGrowAt[tk];
                if (_prevRates[tk] && (_nowMs2 / 1000 - (userGrowAt[tk] || 0)) < 120) {
                  userRates[tk] = _prevRates[tk];
                }
              }
            });
          } catch (e) {}

          // 【2026-10-04 修复 · 重载荷字段丢失】
          //   userTraffics / history15m / nodeStatus 是"按需或变更时才发"的字段,
          //   而下面的兜底只查 isolate 内存。手机每 6 秒上报一次会落到不同 isolate,
          //   内存里没有这些字段时表达式得到 undefined, JSON.stringify 会【整个键丢掉】。
          //   实测后果: 每人累计流量(手机侧 8.79 GB)在快照里永远为空, 大屏退回
          //   Worker 侧会话累加器, 只显示 24 MB —— 数据是真的, 但不是"总消耗"。
          //   修法: 缺字段时读一次共享缓存快照(浏览器读的是同一份)兜底; 三个字段共用。
          let _prevSnap = null;
          if (!body.userTraffics || !body.history15m || !body.nodeStatus || !body.nodeStatus.length) {
            try { _prevSnap = await cacheGetJson('stats_latest'); } catch (e) {}
          }

          // 【2026-10-04 修复 v2 · 每用户累计流量的持久化兜底】
          //   上一版只用共享快照兜底, 但快照 Cache-Control 是 max-age=300 —— 过期后
          //   match 未命中就拿到 null, 于是又写回空对象, 累计值被抹掉
          //   (实测: 几分钟后从 6 用户 8.79 GB 退回 0)。
          //   现在加最底层: 重载荷时写 KV(约 2 次/天), 缺字段时读 KV 并带 cacheTtl=300
          //   (实际 KV 读约 288 次/天, 远低于 10 万/天配额; 写 2 次/天, 远低于 1000/天)。
          const USER_TRAFFIC_KV_KEY = 'noc:user_traffics';
          if (body.userTraffics && Object.keys(body.userTraffics).length > 0) {
            try { await env.SUB_DB.put(USER_TRAFFIC_KV_KEY, JSON.stringify(body.userTraffics)); } catch (e) {}
          }
          let _kvUserTraffics = null;
          if (!body.userTraffics
              && !(globalMemoryStats && globalMemoryStats.userTraffics)
              && !(_prevSnap && _prevSnap.userTraffics)) {
            try {
              const _utRaw = await env.SUB_DB.get(USER_TRAFFIC_KV_KEY, { cacheTtl: 300 });
              if (_utRaw) _kvUserTraffics = JSON.parse(_utRaw);
            } catch (e) {}
          }

          globalMemoryStats = {
            updatedAt: nowStr,
            todayDate: todayDateStr,
            data: body.stat !== undefined ? body.stat : (globalMemoryStats ? globalMemoryStats.data : []),
            pings: mergedPings,
            jitters: mergedJitters,
            pingTimes: mergedPingTimes,
            losses: mergedLosses,
            // 【RTT 修复】手机↔边缘 的单次 RTT(TCP 1×RTT), 与 pings 同层存快照
            edgeRtt: mergedEdgeRtt,
            // 【RTT 提速 · 方案 C】去重后的真实测量历史(每项 = 一次独立测量)
            edgeRttHist: edgeRttHist,
            egressHist: egressHist,
            // 【第二行】国际出口质量: 六地区真单播目标 + 接入链路基线(POP1 机房)
            // 【方案 A+C】CF 锚点实测落点机房码 —— 卡片名以它为准, 不再照抄城市名
            colos: mergedColos,
            // 节点连通性状态: 手机端独立探测进程(node_probe.sh)每 10 秒探 1 个节点,
            // 结果随上报带上; 存在共享快照里, 所有 isolate 都能读到。
            nodeStatus: (body.nodeStatus && body.nodeStatus.length) ? body.nodeStatus
              : ((globalMemoryStats && globalMemoryStats.nodeStatus)
                 || (_prevSnap && _prevSnap.nodeStatus) || []),
            activeSlot: body.activeSlot !== undefined ? body.activeSlot : (globalMemoryStats ? globalMemoryStats.activeSlot : 0),
            // 【2026-10-03】必须用 !== undefined 判断: 手机在一轮测完后会传空字符串
            // 表示"当前没有区域在测", 用 || 会把空串当假值而保留旧节点,
            // 导致界面上"正在测速 XXX"永久卡住。
            activeNode: (body.activeNode !== undefined) ? body.activeNode
              : (globalMemoryStats ? globalMemoryStats.activeNode : ''),
            telemetry: body.telemetry || (globalMemoryStats ? globalMemoryStats.telemetry : null),
            history15m: body.history15m
              || (globalMemoryStats ? globalMemoryStats.history15m : null)
              || (_prevSnap && _prevSnap.history15m) || [],
            conns: body.conns !== undefined ? body.conns : (globalMemoryStats ? globalMemoryStats.conns : 0),
            // 【2026-10-04 修复】每用户累计流量是 12 小时才随重载荷发一次,
            //   必须用共享快照兜底, 否则中间那些上报会把这个键抹掉(见上方注释)。
            // 【2026-10-04 再修复 · 数据只能增】手机端某轮若 `xray api statsquery`
            //   读取失败, 合成值会退化成"只剩 user_traffic_base.txt 的历史偏移",
            //   数值骤降(实测"测试"用户 1077.7 -> 768.8 MB)。累计流量物理上不可逆,
            //   所以这里逐用户与上一份快照比对, 取较大值, 保证单调不减。
            userTraffics: (function () {
              const out = body.userTraffics
                || (globalMemoryStats ? globalMemoryStats.userTraffics : null)
                || (_prevSnap && _prevSnap.userTraffics)
                || _kvUserTraffics || {};
              try {
                const prev = (_prevSnap && _prevSnap.userTraffics) || {};
                for (const tk in out) {
                  const c = out[tk] || {};
                  const p = prev[tk];
                  if (p && (p.total || 0) > (c.total || 0)) out[tk] = p;   // 回退保护
                }
                // 上一份快照里有、这一份没有的用户也补回来(不能被抹掉)
                for (const tk in prev) { if (!out[tk]) out[tk] = prev[tk]; }
              } catch (e) {}
              return out;
            })(),
            // 【2026-10-04】per-user 实时字节(见上方注释)
            statUserBytes: statUserBytes,
            statUserBytesAt: Date.now(),
            // 【2026-10-04】当前探测索引(测速中按顺序推进) + 单节点真实总数
            nodeIdx: (typeof body.nodeIdx === 'number') ? body.nodeIdx : (_prevSnap && _prevSnap.nodeIdx) || 0,
            nodeTotal: (typeof body.nodeTotal === 'number' && body.nodeTotal > 0) ? body.nodeTotal
                       : ((_prevSnap && _prevSnap.nodeTotal) || 0),
            // 【2026-10-04】当前巡检节奏(1=提速 2 秒/个, 0=常规 10 秒/个) —— 大屏插值用
            nodeFast: (typeof body.nodeFast === 'number') ? body.nodeFast
                      : ((_prevSnap && _prevSnap.nodeFast) || 0),
            prevStatUserBytes: (globalMemoryStats && globalMemoryStats.statUserBytes) || {},
            // 【2026-10-04】实时在线判定数据(见上方注释)
            userGrowAt: userGrowAt,
            userRates: userRates,
            // 【2026-10-04】速率采样点存进共享快照: 下次任何 isolate 都能算速率
            totalSample: _totalSampleOut || null,
            userDomains: { ...userDomainAccumulators },
            liveRate: (globalMemoryStats && globalMemoryStats.liveRate) || null,
            totalSample: (globalMemoryStats && globalMemoryStats.totalSample) || null,
            phoneMaster: phoneMasterInfo,
            syncRequest: pendingSync,
            timestamp: Date.now()
          }
          // 【关键】把最新快照写入本机房 Cache API —— 免费、无限量、同机房共享。
          // 为什么必须这么做: 手机的上报与浏览器的长轮询会落在【不同的 isolate】上,
          // isolate 内存互相不可见, 只靠内存会导致推送数据冻结
          // (实测标签从"5秒前"一路涨到"13秒前"再也不更新)。
          // 【2026-10-04 修复 T4.1】这里原来还有第二次 put, 把 Cache-Control 覆盖成
          //   max-age=86400 —— 同机房陈旧快照上限被放大到 24 小时(与"5 分钟内才接受"
          //   的判据冲突)。现只保留一次 put, max-age=300。
          try {
            await caches.default.put(new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`),
              new Response(JSON.stringify(globalMemoryStats), {
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'public, max-age=300'
                }
              }));
          } catch (e) {}
        }
        const userStore = await getCachedUsers();
        const vHash = getUserStoreVersion(userStore);
        await mergePhoneMaster({ inSync: !!(phoneMasterInfo && phoneMasterInfo.version === vHash), cloudVersion: vHash });
        // 【2026-10-04 T4.4】不再回退 syncReqMemory; pendingSync/pendingScan 来自 KV 权威源,
        // 且只有手机 ack 后才被清除 —— 指令在网络上丢失时下一轮自动补发。
        const pendingReq = pendingSync;
        const scanReqId = pendingScan ? pendingScan.id : null;
        return new Response(JSON.stringify({
          status: 'ok',
          version: vHash,
          userCount: Object.keys(userStore).length,
          syncRequest: pendingReq ? pendingReq.id : null,
          phoneInSync: !!(phoneMasterInfo && phoneMasterInfo.version === vHash),
          // 【节点清单下发】手机端 node_probe.sh 需要知道要探哪些节点。
          // 来源就是 RAW_NODES —— 增删节点后手机下一轮(约6秒)自动拿到新清单,
          // 所以节点矩阵 UI、订阅、手机探测三处永远同步。
          nodeList: RAW_NODES.map(function (n) { return { ip: n.server, path: n.path }; }),
          // 手动刷新指令: 一次性下发(发完即删), 避免手机反复做全速扫描
          scanReq: scanReqId
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response('Error parsing payload: ' + (err.message || err), { status: 400 });
      }
    }

    // -------------------------------------------------------------
    // 0.05 手机主库「手动刷新」接口 (/api/phone_sync)
    //   语义: 只有在后台点击【刷新】时才会调用 -> 写一次 KV 同步请求
    //         手机下次上报(约 6 秒)取走指令并强制重新拉取, 然后回报确认
    // -------------------------------------------------------------
    if (url.pathname === '/api/phone_sync') {
      if (url.searchParams.get('pwd') !== ADMIN_PASSWORD) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (request.method === 'POST') {
        const id = 'sr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const wr = await writeCmd(env, 'sync', id);
        return new Response(JSON.stringify({
          status: 'ok',
          requestId: wr.payload.id,
          requestedAt: wr.payload.at,
          kvOk: wr.kvOk,
          note: '已下发同步指令, 手机将在约 6 秒内重新拉取并回报确认'
        }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
      }
      const cur = await readCmd(env);
      return new Response(JSON.stringify({
        status: 'ok',
        pending: cur,
        phoneMaster: phoneMasterInfo
      }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }

    // -------------------------------------------------------------
    // 0.1 手机端用户主库双向同步接口 (/api/phone_users) - 方案 B 核心
    // -------------------------------------------------------------
    if (url.pathname === '/api/phone_users') {
      const syncKey = request.headers.get('X-Sync-Key') || url.searchParams.get('key');
      if (syncKey !== SYNC_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (body && typeof body === 'object') {
            // 兼容两种载荷:
            //   ① 裸用户库 { token: {...}, ... }        —— 旧客户端 / 手动恢复
            //   ② { version, users }                    —— 手机回推(带乐观并发校验)
            const wrapped = body.users && typeof body.users === 'object';
            const incoming = wrapped ? body.users : body;
            const claimedVer = (wrapped && typeof body.version === 'string') ? body.version : null;

            const current = await getAuthoritativeUsers();
            const currentVer = getUserStoreVersion(current);

            // 【2026-10-04 修复 T7.4】裸对象(不带 version 的旧客户端/手动恢复)
            //   会绕过乐观并发校验。现在只允许在"当前库为空"时接受裸对象;
            //   库里已有数据时一律 409 要求带版本, 绝不覆盖更新的改动。
            if (!wrapped && !usersEmpty(current)) {
              return new Response(JSON.stringify({
                status: 'stale',
                version: currentVer,
                users: current,
                note: '裸对象载荷已被拒绝: 当前库非空, 请携带 {version, users} 做乐观并发提交'
              }), {
                status: 409,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
              });
            }

            // 【乐观并发】手机推回的是"它刚刚拉到的那一版"。
            // 若期间后台又改过(版本不一致), 说明这份回推已经过期,
            // 拒绝并回传当前版本让手机重新拉取 —— 绝不覆盖更新的改动。
            if (claimedVer && claimedVer !== currentVer) {
              return new Response(JSON.stringify({
                status: 'stale',
                version: currentVer,
                users: current
              }), {
                status: 409,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
              });
            }

            // 【2026-10-04 修复 T4.5】手机回推(带 version 的载荷)是权威视图,
            // 直接以其为准, 不再 { ...DEFAULT_USERS, ...incoming } 混入默认名单
            // (否则后台删除的默认成员会被手机回推复活)。
            // 仅"裸对象(旧客户端/手动恢复)"这一条 legacy 路径保留默认名单合并。
            const merged = (wrapped || Object.keys(incoming).length === 0)
              ? { ...DEFAULT_USERS, ...incoming }
              : incoming;
            const kvOk = await saveCachedUsers(merged);   // 内置写入熔断: 内容未实质变化则不写 KV
            return new Response(JSON.stringify({
              status: 'ok',
              version: getUserStoreVersion(merged),
              restored: Object.keys(merged).length,
              kvOk: kvOk
            }), {
              headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
          }
        } catch (e) {
          return new Response('Invalid payload', { status: 400 });
        }
      }
      const userStore = await getAuthoritativeUsers();
      return new Response(JSON.stringify(userStore, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // -------------------------------------------------------------
    // 0.2 手机端 Xray 配置动态拉取接口 (/api/phone_xray_config) - 无线 OTA 全自动同步
    // -------------------------------------------------------------
    if (url.pathname === '/api/phone_xray_config') {
      const syncKey = request.headers.get('X-Sync-Key') || url.searchParams.get('key');
      if (syncKey !== SYNC_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      const userStore = await getAuthoritativeUsers();
      const cfg = generatePhoneXrayConfig(userStore);
      return new Response(JSON.stringify(cfg, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    // -------------------------------------------------------------
    // 1. 实时真实数据聚合轮询接口 (/api/stats_data) - 优先内存与 Cache API
    // -------------------------------------------------------------
    if (url.pathname === '/api/stats_data') {
      const auth = url.searchParams.get('pwd');
      if (auth !== ADMIN_PASSWORD) {
        return new Response('Unauthorized', { status: 401 });
      }

      const serverNow = Date.now();
      let payload = {
        updatedAt: '同步中...',
        downBytes: 0,
        upBytes: 0,
        conns: 0,
        // 【2026-10-03 修复】这里原本伪造了一整套"看起来合理"的假数据:
        //   pings(186/140/213...假延迟) · jitters(恒 4ms) · losses(恒 0)
        //   pingTimes(伪造成 10~50 秒前 => 大屏显示"看起来是新鲜的")
        //   telemetry(假电量 88% · 假 WiFi ${WIFI_SSID} · 假 uptime)
        // 手机一断线, 整个大屏就会展示这些假数据。现在全部如实留空:
        // 没有数据就显示 "--" / "未测到", 绝不编造。
        pings: {},
        jitters: {},
        losses: {},
        pingTimes: {},
        activeSlot: 0,
        activeNode: 'kl',
        // 同上: 原本是假电量/假 WiFi/假 uptime, 现如实留空
        telemetry: { battery: {}, wifi: {} },
        buildId: BUILD_ID,
        history15m: [],
        // 【2026-10-04 修复 T1.4】原来 timestamp=serverNow, 会让"没有任何数据"的
        //   冷启动状态显示成"刚刚/0 秒前"(伪装新鲜度)。现改为 0: 前端按
        //   "未测到"渲染, 收到第一份真实上报后自动变成真实年龄。
        timestamp: 0,
        serverTime: serverNow,
        isOnline: false,
        regions: { kl: 0, hk: 0, sg: 0, tw: 0, jp: 0, default: 0 },
        userTraffics: {},
        userDomains: userDomainAccumulators,
        phoneMaster: phoneMasterInfo || null,
        // 【2026-10-04 T4.4】不再展示 isolate 内存里的旧指令
        syncRequest: null
      };

      // 【跨 isolate 治本 · 2026-10-03】原来这里只读【本 isolate 私有内存】。
      // 手机的遥测上报只落在一个 isolate 上, 而大屏请求可能被 Cloudflare 调度到
      // 另一个 isolate => 那个 isolate 的内存里从来没有数据, 大屏就读到空值或旧值。
      // (这正是"数值有时候不更新"的真正原因, 与上报频率无关。)
      // 改为一律优先读【同机房共享快照】stats_latest —— 与 /api/live 同构,
      // 它在手机每次上报时写入, 同机房所有 isolate 都读得到。内存仅作兜底。
      let s = (await cacheGetJson('stats_latest')) || globalMemoryStats;
      const memAge = s && s.timestamp ? (serverNow - s.timestamp) : 999999;

      // 多实例同步：如果内存为空，或者当前隔离区内存落后于 1.5 秒前，优先从 Edge Cache 同步最新推流 (0 配额开销)
      if (!s || memAge > 1500) {
        try {
          const cache = caches.default;
          const cacheKey = new URL(`https://env.WORKER_HOST/internal_cache/stats_latest`);
          const cachedRes = await cache.match(cacheKey);
          if (cachedRes) {
            const parsed = await cachedRes.json();
            if (!s || (parsed.timestamp && parsed.timestamp > (s.timestamp || 0))) {
              s = parsed;
              globalMemoryStats = parsed;
            }
          }
        } catch (cErr) {}
      }


      if (s) {
        payload.updatedAt = s.updatedAt || '刚刚';
        payload.timestamp = s.timestamp || serverNow;
        if (s.conns !== undefined) payload.conns = s.conns;
        if (s.pings) payload.pings = s.pings;
        // 【RTT 修复 2026-10-04】手机↔边缘 的真实单次 RTT(TCP 1×RTT),
        // 与浏览器侧的 /api/rtt 同口径; 0/缺失时不下发, 前端显示 "--"。
        if (typeof s.edgeRtt === 'number' && s.edgeRtt > 0) payload.edgeRtt = s.edgeRtt;
        // 【RTT 提速 · 方案 C】真实测量历史数组: 前端据此在首次轮询就得到中位数
        if (Array.isArray(s.edgeRttHist)) payload.edgeRttHist = s.edgeRttHist;
        if (Array.isArray(s.egressHist)) payload.egressHist = s.egressHist;
        // 【第二行】国际出口质量(真单播六地区) + 接入链路基线
        // 【方案 A+C】CF 锚点实测落点机房码(前端据此命名并合并同机房卡片)
        if (s.colos) payload.colos = s.colos;
        if (s.jitters) payload.jitters = s.jitters;
        if (s.losses) payload.losses = s.losses;
        if (s.nodeStatus) payload.nodeStatus = s.nodeStatus;
        // 节点清单(与手机端保持一致): 前端据此渲染卡片, RAW_NODES 增删自动同步
        // 【2026-10-04】节点清单里的名字同样用统一显示名(与订阅/大屏一致)
      const _statColoMap = {};
      ((s && s.nodeStatus) || []).forEach(function (x) {
        if (x && x.ip && typeof x.colo === 'string' && /^[A-Z]{3}$/.test(x.colo)) _statColoMap[x.ip] = x.colo;
      });
      const _statNames = buildNodeDisplayNames(_statColoMap);
      payload.nodeList = RAW_NODES.map(function (n, i) { return { name: _statNames[i], ip: n.server, path: n.path, region: n.region || '' }; });
        if (s.liveRate) payload.liveRate = s.liveRate;
        if (s.pingTimes) payload.pingTimes = s.pingTimes;
        if (s.activeSlot !== undefined) payload.activeSlot = s.activeSlot;
        if (s.activeNode) payload.activeNode = s.activeNode;
        if (s.telemetry) payload.telemetry = s.telemetry;
        if (s.history15m && s.history15m.length > 0) payload.history15m = s.history15m;
        payload.phoneMaster = s.phoneMaster || phoneMasterInfo || null;
        // 【2026-10-04 T4.4】只信快照里的指令, 不再回退 isolate 内存旧指令;
        // 只要它的 id 已在确认记录里, 就说明处理完了, 不能再显示成"待取走"。
        {
          const cand = s.syncRequest || null;
          if (cand && cand.id) {
            const pmc = (await getPhoneMaster()) || {};
            payload.syncRequest = (pmc.ackedId && pmc.ackedId === cand.id) ? null : cand;
          } else {
            payload.syncRequest = null;
          }
        }

        if (Array.isArray(s.data)) {
          for (const item of s.data) {
            const val = item.value || 0;
            // 1. 全局上下行 (排除内部 api 探测流量)
            if (item.name.startsWith('inbound>>>') && !item.name.includes('inbound>>>api')) {
              if (item.name.includes('traffic>>>downlink')) payload.downBytes += val;
              if (item.name.includes('traffic>>>uplink')) payload.upBytes += val;
            }
            // 2. 五地区真实已接入物理流量
            if (item.name.includes('inbound>>>in-kl')) payload.regions.kl += val;
            if (item.name.includes('inbound>>>in-hk')) payload.regions.hk += val;
            if (item.name.includes('inbound>>>in-sg')) payload.regions.sg += val;
            if (item.name.includes('inbound>>>in-tw')) payload.regions.tw += val;
            if (item.name.includes('inbound>>>in-jp')) payload.regions.jp += val;
            if (item.name.includes('inbound>>>proxy-in')) payload.regions.default += val;
          }

          // 3. 提取各用户真实物理累计流量并结合累加器（保证 Today <= Week <= Total 严密成立，容器重启绝不归零）
          const rawUserTraffic = {};
          for (const item of s.data) {
            const val = item.value || 0;
            const m = item.name.match(/user>>>([a-zA-Z0-9_-]+)>>>traffic>>>(downlink|uplink)/);
            if (m) {
              let uToken = m[1];
              if (uToken.startsWith('user_')) uToken = uToken.substring(5);
              rawUserTraffic[uToken] = (rawUserTraffic[uToken] || 0) + val;
            }
          }
          if (rawUserTraffic['shared_legacy']) {
            rawUserTraffic['USER_TOKEN_26'] = (rawUserTraffic['USER_TOKEN_27'] || 0) + rawUserTraffic['shared_legacy'];
          }

          // 从始至终累计绝对流量 (手机端持久化权威数据，绝无复杂日周回环Bug)
          const authoritativeTraffics = (s && s.userTraffics && Object.keys(s.userTraffics).length > 0) ? s.userTraffics : userAccumulators;
          // 【2026-10-03 清理】这里原本硬编码了 5 个 token 的"流量"数值
          // (例如 USER_TOKEN_28=4.05GB / USER_TOKEN_29=1.03GB ...)。
          // 实测这些值平时会被手机上报的真实数据覆盖, 但一旦某个 token 的上报缺失,
          // 假数字就会直接显示在"用户流量榜"上, 并被他下面的求和计入
          // "总流量吞吐统计" —— 属于潜在的假数据陷阱。
          // 现在改为空对象起步: 有多少真实数据就显示多少, 缺了就显示 0。
          payload.userTraffics = {};
          for (const tk in authoritativeTraffics) {
            const item = authoritativeTraffics[tk];
            if (item) {
              const u_up = item.up || 0;
              const u_down = item.down || (item.total ? item.total - u_up : 0);
              const u_tot = item.total || (u_up + u_down);
              payload.userTraffics[tk] = {
                up: u_up,
                down: u_down,
                total: u_tot,
                online: relay-node.invalid || 0,
                rateDown: item.rateDown || 0,
                rateUp: item.rateUp || 0,
                lastActive: item.lastActive || 0
              };
            }
          }
          let sumDown = 0, sumUp = 0;
          for (const tk in payload.userTraffics) {
            sumDown += (payload.userTraffics[tk].down || 0);
            sumUp += (payload.userTraffics[tk].up || 0);
          }
          if (sumDown > 0 || sumUp > 0) {
            payload.downBytes = sumDown;
            payload.upBytes = sumUp;
          }
        }
      }

      // [真活闭环判定] 综合三维物理指标：心跳新鲜度 + Xray 存活状态 + 隧道穿透探活
      const lastSeenDiff = s && s.timestamp ? (serverNow - s.timestamp) : 999999;
      const isFresh = lastSeenDiff < 30000; // 30秒内必须有真实上报
      const isXrayLive = (s && s.telemetry && s.telemetry.xrayLive === 1);
      
      let isHostAlive = isFresh && isXrayLive;

      // 双重物理回路验证：主动探测 https://env.TUNNEL_HOST/kl
      // 【2026-10-04 修复 T7.1】原实现每个 /api/stats_data 请求都同步做一次
      //   HEAD 探活(1.5s 超时): 大屏每轮询一次就打一次隧道到手机, 响应被
      //   阻塞最多 1.5s+, 2 秒模式还会放大, 且探活抖动会误判"离线"闪红。
      //   现在把探活结果写进本机房 Cache API(20 秒有效期):
      //   同一机房所有 isolate 共享, 每 20 秒最多真探一次, 其余请求零开销。
      const HOST_PROBE_URL = new URL(`https://env.WORKER_HOST/internal_cache/host_probe`);
      let hostProbeAlive = null;
      try {
        const pc = await caches.default.match(HOST_PROBE_URL);
        if (pc) {
          const pj = await pc.json();
          if (pj && (serverNow - (pj.at || 0)) < 20000) hostProbeAlive = pj.alive;
        }
      } catch (e) {}
      if (hostProbeAlive === null) {
        try {
          const probe = await fetch(`https://env.TUNNEL_HOST/kl`, { method: 'HEAD', signal: AbortSignal.timeout(1500) });
          // Xray 在线时返回 403/400；隧道断开返回 502/504/530
          hostProbeAlive = !(probe.status >= 500);
        } catch (pErr) {
          hostProbeAlive = false; // 探测超时或断开
        }
        try {
          await caches.default.put(HOST_PROBE_URL,
            new Response(JSON.stringify({ alive: hostProbeAlive, at: Date.now() }), {
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=25' }
            }));
        } catch (e) {}
      }
      // 探测失败(隧道断)才强制判离线; 403/400(在线)保留心跳判定
      if (hostProbeAlive === false) isHostAlive = false;

      payload.isOnline = isHostAlive;
      payload.xrayLive = isXrayLive;
      payload.cfErrors = (s && s.telemetry && s.telemetry.cfErrors) || 0;

      // 4. 实时附带最新用户列表供前端实时无感同步 (A3 优化)
      //    大屏轮询每 60 秒一次; 这里允许 KV 边缘缓存 30 秒换取速度,
      //    实际陈旧上限 30 秒, 远严于已确认可接受的 2 分钟。
      const userStore = await getAuthoritativeUsers(30);
      // 【2026-10-04】把原始计数也发给前端(每条约 100 字节, 20 条 ≈ 2 KB),
      //   前端 renderUserTable 的实时在线兜底依赖它。
      payload.stat = (s && Array.isArray(s.data)) ? s.data : [];
      // 【2026-10-04】当前探测索引同步给 60 秒轮询路径
      payload.nodeIdx = (s && typeof s.nodeIdx === 'number') ? s.nodeIdx : 0;
      payload.nodeTotal = (s && typeof s.nodeTotal === 'number') ? s.nodeTotal : 0;
      payload.nodeFast = (s && typeof s.nodeFast === 'number') ? s.nodeFast : 0;
      payload.users = Object.values(userStore).map(u => {
        const ut = payload.userTraffics[u.token] || {};
        // 【2026-10-04 修复"新用户显示从未连接"】userTraffics 是 12 小时重载荷,
        //   新接入用户不在里面 -> 前端误判"🔴 从未连接 (0 B)"。
        //   兜底: 用快照里每 6 秒更新的 xray 实时字节(statUserBytes)补:
        //   字节>0 => 曾连接; 2 分钟内字节在增长 => 在线。
        // 【2026-10-04】在线/速率/最后活跃 全部用【实时】数据(每 6 秒更新一次),
        //   不再使用重载荷里 12 小时才更新一次的 online/lastActive(会误报在线)。
        let _sb = 0;
        try { _sb = (s && s.statUserBytes && s.statUserBytes[u.token]) || 0; } catch (e) {}
        const _growAt = (s && s.userGrowAt && s.userGrowAt[u.token]) || 0;
        const _rate = (s && s.userRates && s.userRates[u.token]) || 0;
        const _nowSec = Math.floor(Date.now() / 1000);
        // 在线 = 最近 90 秒内字节确实有增长(严格实时)
        const _fresh = _growAt > 0 && (_nowSec - _growAt) < 90;
        return {
          name: u.name,
          token: u.token,
          enabled: u.enabled,
          pullCount: u.pullCount || 0,
          lastSeen: u.lastSeen || '从未',
          lastIp: u.lastIp || '-',
          isAutoRecovered: Boolean(u.name && u.name.startsWith('恢复用户_')),
          online: _fresh ? 1 : 0,
          rateDown: _fresh ? _rate : 0,
          rateUp: 0,
          // 【2026-10-04】最后活跃取【两者较新者】:
          //   · _growAt  = 实时观察到的字节增长时刻(精确, 秒级)
          //   · ut.lastActive = 重载荷里的历史活跃(最长 12 小时延迟, 但是唯一的历史来源)
          //   只用 _growAt 会把历史全丢成"从未"(部署那一刻才开始记录)。
          //   注意 online 仍【严格只用实时】, 所以不会因为历史值而误报在线。
          lastActive: Math.max(_growAt || 0, ut.lastActive || 0),
          totalTraffic: Math.max(ut.total || 0, _sb)
        };
      });

      // 5. 手机主库同步状态 (实时计算, 供后台卡片右上角显示)
      //    inSync: 手机已生效的版本 == 云端当前版本
      const cloudVer = getUserStoreVersion(userStore);
      // 【跨 isolate】优先读本机房共享缓存, 否则读到的可能是别的机的旧值

      const pmBase = (await getPhoneMaster()) || payload.phoneMaster || phoneMasterInfo || null;
      payload.phoneMaster = pmBase ? {
        version: pmBase.version || null,
        tokens: pmBase.tokens || [],
        reportedAt: pmBase.reportedAt || null,
        storeChangedAt: await getUserStoreChangedAt(),
        ackedId: pmBase.ackedId || null,
        ackedAt: pmBase.ackedAt || null,
        cloudVersion: cloudVer,
        inSync: !!(pmBase.version && pmBase.version === cloudVer)
      } : { version: null, tokens: [], reportedAt: null, cloudVersion: cloudVer, inSync: false };
      // 【修复 · 2026-10-03】不再回退到 syncReqMemory(isolate 私有内存):
      // 点刷新落在 isolate A(A 记下指令) -> 手机确认落在 isolate B(B 清了 KV 和
      // 自己的内存) -> 大屏请求又落回 A => A 内存里那条指令还在 => 返回非空
      // => 徽标永久卡在"等待手机取走"。这解释了"有时卡有时不卡"。
      {
        const _c2 = payload.syncRequest || null;
        if (_c2 && _c2.id) {
          const _p2 = (await getPhoneMaster()) || {};
          payload.syncRequest = (_p2.ackedId && _p2.ackedId === _c2.id) ? null : _c2;
        } else {
          payload.syncRequest = null;
        }
      }

      // 后台正在执行手动刷新时才回源 KV 读一次请求 (带 &sync=1)。
      // 这样常态轮询不会额外消耗 KV 读, 只在那几秒的同步窗口里读。
      if (url.searchParams.get('sync') === '1' && !payload.syncRequest) {
        try {
          const kvReq = await readCmd(env);
          if (kvReq && kvReq.type === 'sync') {
            // 【2026-10-04 T4.4】只信 KV; ackedId 判定同前。
            const pmNow = (await getPhoneMaster()) || {};
            if (pmNow.ackedId && pmNow.ackedId === kvReq.id) {
              payload.syncRequest = null;
              syncReqMemory = null;
            } else {
              payload.syncRequest = kvReq;
            }
          }
        } catch (e) {}
      }

      // 【D 2026-10-04】各地区客户端接入质量 —— 放在 if (s) 之外:
      // 它只依赖浏览器回传的数据, 与手机遥测快照无关; 手机掉线时这一块仍应可见。
      // 只输出有真实样本的机房; 机房代码来自 request.cf.colo, 客户端无法伪造。
      try {
        const cbc = await readClientRtt();
        const out = {};
        for (const k in cbc) {
          const e = cbc[k];
          if (e && Array.isArray(e.s) && e.s.length) {
            out[k] = { med: medianJs(e.s), n: e.s.length, at: e.t || 0, total: e.n || e.s.length };
          }
        }
        if (Object.keys(out).length) payload.clientRttByColo = out;
      } catch (e) {}

      // CF 边缘真实处理耗时 (本函数从入口到出参的实测毫秒数)
      payload.serverMs = Date.now() - reqStartMs;

      return new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache'
        }
      });
    }

    // -------------------------------------------------------------
    // 2. 订阅分发接口 (/sub) - 节点全部分配独立区域 path 与用户 UUID
    // -------------------------------------------------------------
    if (url.pathname === '/sub') {
      const token = url.searchParams.get('token');
      const type = (url.searchParams.get('type') || 'clash').toLowerCase();

      if (!token) return new Response('错误：缺少必要参数', { status: 400 });

      const cached = await getCachedUsers();
      let user = cached[token] || null;

      if (!user && token && token.length >= 6) {
        // 容灾兜底：未知 token 仍下发配置(避免冷机房误判 403)，但【绝不入库】。
        // 旧实现在这里调用 saveCachedUsers()，会把任意随机 token 变成"正式用户"
        // 并写进共享用户库 —— 既污染后台列表(实测出现重复的"用户D")，又放大
        // KV 写入量。现在改为纯临时对象，不落任何持久层。
        user = {
          name: '临时_' + token.substring(0, 4),
          token: token,
          enabled: true,
          transient: true,
          lastSeen: '未登记',
          lastIp: request.headers.get('cf-connecting-ip') || '-',
          userAgent: request.headers.get('user-agent') || '-',
          pullCount: 0
        };
      }
      if (!user) return new Response('错误：订阅不存在或已被禁用', { status: 403 });
      if (!user.enabled) return new Response('错误：该订阅已被管理员停用', { status: 403 });

      // 展示字段(lastSeen/lastIp/pullCount)只在本机房内存 + Cache API 更新，
      // 【绝不写 KV】—— 否则每次客户端拉订阅都会产生一次 KV 写入。
      if (!user.transient) {
        try {
          await touchUser(token, {
            lastSeen: new Date().toLocaleString('zh-CN', { timeZone: 'UTC' }),
            lastIp: request.headers.get('cf-connecting-ip') || '-',
            userAgent: request.headers.get('user-agent') || '-',
            pullCount: (user.pullCount || 0) + 1
          });
        } catch (cacheErr) {}
      }

      const uuid = tokenToUUID(token);
      const host = "env.TUNNEL_HOST";
      // 【2026-10-04 用户要求】节点名全线统一: 节点所在地-<实测落点三位码>-<序号>
      const _coloMap = await getNodeColoMap();
      const DISPLAY_NAMES = buildNodeDisplayNames(_coloMap);

      if (type === 'v2ray') {
        const noticeLink = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?encryption=none&security=none&type=xhttp&host=example.com&path=%2F&mode=auto#${encodeURIComponent(NOTICE_NAME)}`;
        const nodeLinks = RAW_NODES.map((n, i) => {
          return `vless://${uuid}@${n.server}:443?encryption=none&security=tls&sni=${host}&fp=chrome&type=xhttp&host=${host}&path=${encodeURIComponent(n.path)}&mode=auto#${encodeURIComponent(DISPLAY_NAMES[i])}`;
        });
        return new Response(btoa(unescape(encodeURIComponent([noticeLink, ...nodeLinks].join('\n')))), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Subscription-Userinfo': 'upload=0; download=0; total=1073741824000; expire=2030000000'
          }
        });
      }

      const noticeClashNode = `  - name: "${NOTICE_NAME}"\n    type: vless\n    server: 127.0.0.1\n    port: 80\n    uuid: 00000000-0000-0000-0000-000000000000\n    udp: false\n    tls: false\n    network: xhttp\n    xhttp-opts:\n      mode: auto\n      path: /\n      host: example.com`;

      const clashProxies = RAW_NODES.map((n, i) => `  - name: "${DISPLAY_NAMES[i]}"\n    type: vless\n    server: ${n.server}\n    port: 443\n    uuid: ${uuid}\n    udp: false\n    tls: true\n    servername: ${host}\n    network: xhttp\n    client-fingerprint: chrome\n    xhttp-opts:\n      mode: auto\n      path: ${n.path}\n      host: ${host}`).join('\n\n');

      // 【2026-10-04 关键修复】原来这些分组靠"名字里含 移动/电信/接入点1/专线"筛节点,
      //   改名成 节点所在地-POP1-01 之后会全部筛空(分组变成空的, 用户选组就没节点)。
      //   现在与名字彻底解耦: 专线/三网极速 按【索引区间】(清单顺序固定),
      //   地区组按【region】。清单顺序: 0-4 专线, 5-10 三网极速, 11 智能调度,
      //   12-31 R1, 32-39 R3, 40-46 R2, 47-50 R5, 51-54 R4。
      const nameAt = i => `"${DISPLAY_NAMES[i]}"`;
      const nodeNames = RAW_NODES.map((n, i) => nameAt(i));
      const plus7Names = RAW_NODES.map((n, i) => i).filter(i => i >= 0 && i <= 4).map(nameAt);
      const znhNames = RAW_NODES.map((n, i) => i).filter(i => i >= 5 && i <= 11).map(nameAt);
      const myNames = RAW_NODES.map((n, i) => i).filter(i => i >= 12 && i <= 31).map(nameAt);
      // 注意: filter 的回调参数是索引, 拿不到 n —— 必须先配对成 [node, index] 再筛,
      //   否则 n 不在作用域内会抛 ReferenceError(实测导致 /sub 直接 500)。
      const idxWhere = fn => RAW_NODES.map((n, i) => [n, i]).filter(p => fn(p[0])).map(p => p[1]);
      const hkNames = idxWhere(n => n.region === 'R3').map(nameAt);
      const sgNames = idxWhere(n => n.region === 'R2').map(nameAt);
      const twNames = idxWhere(n => n.region === 'R5').map(nameAt);
      const jpNames = idxWhere(n => n.region === 'R4').map(nameAt);

      const yaml = `port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info

dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 1.1.1.1
    - 8.8.8.8

proxies:
${noticeClashNode}

${clashProxies}

proxy-groups:
  - name: "PROXY"
    type: select
    proxies:
      - "AUTO - 自动选优"
      - "FALLBACK - 故障转移"
      - "DM-Link"
      - "All-Nodes"
      - "Region-3"
      - "Region-2"
      - "Region-5"
      - "Region-4"
      - "Premium"
${nodeNames.map(name => `      - ${name}`).join('\n')}

  - name: "AUTO - 自动选优"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
${nodeNames.map(name => `      - ${name}`).join('\n')}

  - name: "FALLBACK - 故障转移"
    type: fallback
    url: http://www.gstatic.com/generate_204
    interval: 300
    proxies:
${nodeNames.map(name => `      - ${name}`).join('\n')}

  - name: "DM-Link"
    type: select
    proxies:
${znhNames.map(name => `      - ${name}`).join('\n')}

  - name: "All-Nodes"
    type: select
    proxies:
${myNames.map(name => `      - ${name}`).join('\n')}

  - name: "Region-3"
    type: select
    proxies:
${hkNames.map(name => `      - ${name}`).join('\n')}

  - name: "Region-2"
    type: select
    proxies:
${sgNames.map(name => `      - ${name}`).join('\n')}

  - name: "Region-5"
    type: select
    proxies:
${twNames.map(name => `      - ${name}`).join('\n')}

  - name: "Region-4"
    type: select
    proxies:
${jpNames.map(name => `      - ${name}`).join('\n')}

  - name: "Premium"
    type: select
    proxies:
${plus7Names.map(name => `      - ${name}`).join('\n')}

rules:
  - GEOIP,LAN,DIRECT,no-resolve
  - DOMAIN-SUFFIX,cn,DIRECT
  - DOMAIN-KEYWORD,weixin,DIRECT
  - DOMAIN-KEYWORD,qq,DIRECT
  - DOMAIN-KEYWORD,tencent,DIRECT
  - DOMAIN-KEYWORD,alipay,DIRECT
  - DOMAIN-KEYWORD,taobao,DIRECT
  - DOMAIN-KEYWORD,aliyun,DIRECT
  - DOMAIN-KEYWORD,jd,DIRECT
  - DOMAIN-KEYWORD,baidu,DIRECT
  - DOMAIN-KEYWORD,bilibili,DIRECT
  - DOMAIN-KEYWORD,douyin,DIRECT
  - DOMAIN-KEYWORD,bytedance,DIRECT
  - DOMAIN-KEYWORD,zhihu,DIRECT
  - DOMAIN-KEYWORD,163,DIRECT
  - DOMAIN-KEYWORD,netease,DIRECT
  - DOMAIN-KEYWORD,sina,DIRECT
  - DOMAIN-KEYWORD,weibo,DIRECT
  - GEOSITE,cn,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
`;
      return new Response(yaml, {
        headers: {
          'Content-Type': 'text/yaml; charset=utf-8',
          'Subscription-Userinfo': 'upload=0; download=0; total=1073741824000; expire=2030000000',
          'Profile-Update-Interval': '1'
        }
      });
    }

    // -------------------------------------------------------------
    // 内嵌 Chart.js 源码 (T8.8): 由 cf_deploy.py 部署时注入, 本地直出, 不依赖 CDN
    // -------------------------------------------------------------
    if (url.pathname === '/chart.js') {
      if (typeof CHART_JS_SOURCE === 'string' && CHART_JS_SOURCE.length > 100) {
        return new Response(CHART_JS_SOURCE, {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=604800'
          }
        });
      }
      return new Response('// chart.js source not embedded', { status: 404 });
    }

    // -------------------------------------------------------------
    // 3. 真实纯黑白 NOC 运营看板 (/admin)
    // -------------------------------------------------------------
    if (url.pathname === '/admin') {
      const auth = url.searchParams.get('pwd');
      if (auth !== ADMIN_PASSWORD) {
        return new Response(`
          <!DOCTYPE html><html><head><meta charset="utf-8"><title>系统认证</title>
          <style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;justify-content:center;align-items:center;height:85vh;background:#000;color:#fff;}
          .box{background:#0a0a0a;border:1px solid #222;padding:40px;border-radius:12px;text-align:center;width:280px;}
          input{padding:10px;width:100%;box-sizing:border-box;background:#000;border:1px solid #333;color:#fff;border-radius:6px;margin-bottom:14px;font-size:14px;outline:none;}
          button{width:100%;padding:10px;background:#fff;color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;}</style></head>
          <body><div class="box"><h3 style="margin-top:0;">系统安全认证</h3><p style="color:#666;font-size:12px;margin-bottom:20px;">请输入控制台密钥</p>
          <form method="GET"><input type="password" name="pwd" placeholder="Password" autofocus><button>进入</button></form></div></body></html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      if (request.method === 'POST') {
        const formData = await request.formData();
        const action = formData.get('action');
        let kvErr = false;   // 【2026-10-04 T7.2】KV 写失败时带 kverr 重定向, 前端黄条提示
        try {
          const userStore = await getAuthoritativeUsers();
          if (action === 'add') {
            const name = formData.get('name');
            let token = formData.get('token');
            if (token) {
              const m = token.match(/token=([a-zA-Z0-9_-]+)/);
              if (m) token = m[1];
              else token = token.replace(/[^a-zA-Z0-9_-]/g, '');
            }
            if (!token) token = Math.random().toString(36).substring(2, 10);
            const newUser = {
              name, token, enabled: true,
              createdAt: new Date().toLocaleString('zh-CN', { timeZone: 'UTC' }),
              lastSeen: '从未', lastIp: '-', userAgent: '-', pullCount: 0
            };
            userStore[token] = newUser;
            if (!(await saveCachedUsers(userStore))) kvErr = true;
          } else if (action === 'toggle') {
            const token = formData.get('token');
            let u = userStore[token];
            if (u) {
              u.enabled = !u.enabled;
              userStore[token] = u;
              if (!(await saveCachedUsers(userStore))) kvErr = true;
            }
          } else if (action === 'delete') {
            const token = formData.get('token');
            delete userStore[token];
            if (!(await saveCachedUsers(userStore))) kvErr = true;
          }
        } catch (opErr) {
          console.log('User action error:', opErr);
        }
        return Response.redirect(`${url.origin}/admin?pwd=${ADMIN_PASSWORD}${kvErr ? '&kverr=1' : ''}`, 302);
      }

      // 获取当前真实用户列表 (方案 B：直读内存与 Edge Cache，由手机闪存主库保底反哺)
      const userStore = await getAuthoritativeUsers();
      const users = Object.values(userStore);

      // 【2026-10-04】首屏实时用户状态: 直接读【共享快照】(与 /api/stats_data 同源同逻辑)。
      //   注意: 这里不能引用 stats_data 那个 handler 里的 payload —— 它在本作用域不存在,
      //   上一版就是这么把 /admin 打成 500 (error 1101) 的。
      const _liveSnapA = (await cacheGetJson('stats_latest')) || {};
      const _growMapA = _liveSnapA.userGrowAt || {};
      const _rateMapA = _liveSnapA.userRates || {};
      const _utMapA = _liveSnapA.userTraffics || {};
      const _nowSecA = Math.floor(Date.now() / 1000);
      const LIVE_BY_TOKEN = {};
      users.forEach(function (u) {
        const g = _growMapA[u.token] || 0;
        const ut = _utMapA[u.token] || {};
        const fresh = g > 0 && (_nowSecA - g) < 90;
        LIVE_BY_TOKEN[u.token] = {
          online: fresh ? 1 : 0,
          rateDown: fresh ? (_rateMapA[u.token] || 0) : 0,
          rateUp: 0,
          lastActive: Math.max(g, ut.lastActive || 0),
          totalTraffic: ut.total || 0
        };
      });

      const rows = users.map(u => {
        // 【2026-10-04】首屏直接用实时值渲染连接状态, 不再写死"5秒检测中..."占位;
        //   "最后活跃"也改用真实活跃时刻(原来用的是"最后拉订阅时间", 与连接状态不同源,
        //   会出现"离线断开 3 小时前 + 从未活跃"这种自相矛盾)。
        const _live = LIVE_BY_TOKEN[u.token] || {};
        const _lvOnline = (_live.online || 0) > 0;
        const _lvRate = (_live.rateDown || 0) + (_live.rateUp || 0);
        const _lvLast = _live.lastActive || 0;
        const _lvTotal = _live.totalTraffic || 0;
        const _agoText = (ts) => {
          if (!ts) return '从未';
          const d = Math.max(0, Math.floor(Date.now() / 1000) - ts);
          if (d < 60) return d + ' 秒前';
          if (d < 3600) return Math.floor(d / 60) + ' 分钟前';
          if (d < 86400) return Math.floor(d / 3600) + ' 小时前';
          return Math.floor(d / 86400) + ' 天前';
        };
        const liveConn = _lvOnline
          ? (_lvRate > 1024
              ? `<div style="display:flex;flex-direction:column;gap:2px;"><span style="color:#22c55e;font-size:11px;font-weight:700;">🟢 在线传输中</span><span style="font-size:10px;color:#38bdf8;font-family:monospace;">⚡ ${(_lvRate / 1024).toFixed(1)} KB/s</span></div>`
              : `<div style="display:flex;flex-direction:column;gap:2px;"><span style="color:#22c55e;font-size:11px;font-weight:700;">🟢 在线待命</span><span style="font-size:10px;color:#666;font-family:monospace;">⚡ 0 B/s 心跳保持</span></div>`)
          : (_lvTotal > 0
              ? `<span style="color:#94a3b8;font-size:11px;">⚪ 离线断开 (${_agoText(_lvLast)}活跃)</span>`
              : '<span style="color:#ef4444;font-size:11px;">🔴 从未连接 (0 B)</span>');
        const liveLastActive = _lvLast > 0 ? _agoText(_lvLast) : '--';

        const isRecovered = Boolean(u.name && u.name.startsWith('恢复用户_'));
        const nameDisplay = isRecovered
          ? `<span style="color:#eab308;font-weight:700;">⚠ ${u.name}</span>`
          : u.name;
        const statusDisplay = isRecovered
          ? '<span style="color:#eab308;font-size:11px;font-weight:600;">⚠ 待绑定UUID</span>'
          : (u.enabled ? '<span style="color:#22c55e;font-size:12px;font-weight:600;">● 运行中</span>' : '<span style="color:#ef4444;font-size:12px;font-weight:600;">● 已停用</span>');

        return `
        <tr style="border-bottom:1px solid #141414;">
          <td data-label="用户" style="padding:10px 12px;font-weight:600;">${nameDisplay}</td>
          <td data-label="订阅地址 (点击可全选)" style="padding:10px 12px;">
            <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">
              <span style="font-size:10px;color:#777;width:35px;">Clash</span>
              <input value="${url.origin}/sub?token=${u.token}&type=clash" readonly style="width:230px;padding:3px 6px;font-size:11px;background:#050505;color:#ddd;border:1px solid #222;border-radius:3px;" onclick="this.select()">
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:10px;color:#777;width:35px;">V2Ray</span>
              <input value="${url.origin}/sub?token=${u.token}&type=v2ray" readonly style="width:230px;padding:3px 6px;font-size:11px;background:#050505;color:#ddd;border:1px solid #222;border-radius:3px;" onclick="this.select()">
            </div>
          </td>
          <td data-label="服务状态" style="padding:10px 12px;">${statusDisplay}</td>
          <td data-label="连接状态 (5 秒检测)" style="padding:10px 12px;" id="ssr_conn_${u.token}">${liveConn}</td>
          <td data-label="同步次数" style="padding:10px 12px;color:#888;font-size:12px;">${u.pullCount || 0}</td>
          <td data-label="最后活跃" style="padding:10px 12px;font-size:11px;color:#777;">${liveLastActive}</td>
          <td data-label="出口 IP" style="padding:10px 12px;font-size:11px;color:#777;">${(u.lastIp && u.lastIp !== '-') ? u.lastIp : '--'}</td>
          <td style="padding:10px 12px;">
            <form method="POST" style="display:inline;">
              <input type="hidden" name="token" value="${u.token}">
              <input type="hidden" name="action" value="toggle">
              <button style="padding:4px 8px;background:#141414;color:#ccc;border:1px solid #282828;border-radius:3px;cursor:pointer;font-size:11px;">${u.enabled ? '停用' : '启用'}</button>
            </form>
            <form method="POST" style="display:inline;margin-left:4px;">
              <input type="hidden" name="token" value="${u.token}">
              <input type="hidden" name="action" value="delete">
              <button style="padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">删除</button>
            </form>
          </td>
        </tr>
      `;
      }).join('');

      // 提取真实用户列表供排行榜渲染
      const realUsersJson = JSON.stringify(users.map(u => ({
        name: u.name,
        token: u.token,
        enabled: u.enabled,
        pullCount: u.pullCount || 0
      })));

      // 预编译各节点 JSON 传入前端矩阵
      // 【2026-10-04 用户要求】大屏矩阵的节点名与订阅【逐字一致】——
      //   两者都来自 buildNodeDisplayNames(同一函数、同一份实测落点) => 永远同源同步。
      const _adminColoMap = await getNodeColoMap();
      const _adminNames = buildNodeDisplayNames(_adminColoMap);
      const nodesJson = JSON.stringify(RAW_NODES.map((n, i) => ({
        name: _adminNames[i],
        fullName: _adminNames[i],
        region: n.region,
        ip: n.server,
        path: n.path
      })));

      return new Response(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NOC 运营监控中心 · 实时黑白看板</title>
          <!-- 【2026-10-04 修复 T8.8】Chart.js 改为本地直出(/chart.js 由 Worker 内嵌源码),
               不再依赖 CDN(jsdelivr 在国内常被墙, 加载失败时整页脚本死掉)。
               保留 CDN 作为本地资源注入失败时的兜底。 -->
          <script src="/chart.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/chart.js';"></script>
          <style>
            /* ============================================================
               Material Design 3 (Material You) —— 深色方案
               依据: https://m3.material.io/  (Color roles / Typescale / Shape / Elevation / State layers)
               · 颜色: MD3 语义角色(primary / on-primary / …-container / surface-container-* / outline / …),
                 取 Google Blue 种子色的 M3 深色基线值, 不改动任何数据与逻辑。
               · 字阶: MD3 typescale(display/headline/title/body/label × L/M/S)。
               · 形状: MD3 corner 阶梯 none/xs 4/sm 8/md 12/lg 16/xl 28/full。
               · 高度: MD3 elevation level0-3(深色下用 surface-container 提亮 + 阴影表达)。
               · 状态层: hover 8% / focus 10% / pressed 10%(MD3 state layer 规范值)。
               ============================================================ */
            :root {
              /* ---- Color: MD3 dark scheme (Google Blue source) ---- */
              --md-sys-color-primary: #a8c7fa;
              --md-sys-color-on-primary: #0a305f;
              --md-sys-color-primary-container: #284777;
              --md-sys-color-on-primary-container: #d3e3fd;
              --md-sys-color-secondary: #bfc6dc;
              --md-sys-color-on-secondary: #293042;
              --md-sys-color-secondary-container: #3f4759;
              --md-sys-color-on-secondary-container: #dbe2f9;
              --md-sys-color-tertiary: #debcdf;
              --md-sys-color-on-tertiary: #3f2841;
              --md-sys-color-tertiary-container: #573e59;
              --md-sys-color-on-tertiary-container: #fbd7fc;
              --md-sys-color-error: #ffb4ab;
              --md-sys-color-on-error: #690005;
              --md-sys-color-error-container: #93000a;
              --md-sys-color-on-error-container: #ffdad6;
              --md-sys-color-background: #111318;
              --md-sys-color-on-background: #e2e2e9;
              --md-sys-color-surface: #111318;
              --md-sys-color-on-surface: #e2e2e9;
              --md-sys-color-surface-variant: #44474e;
              --md-sys-color-on-surface-variant: #c4c6d0;
              --md-sys-color-outline: #8e9099;
              --md-sys-color-outline-variant: #44474e;
              --md-sys-color-surface-container-lowest: #0c0e13;
              --md-sys-color-surface-container-low: #191c20;
              --md-sys-color-surface-container: #1d2024;
              --md-sys-color-surface-container-high: #282a2f;
              --md-sys-color-surface-container-highest: #33353a;
              --md-sys-color-inverse-surface: #e2e2e9;
              --md-sys-color-inverse-on-surface: #2f3033;
              --md-sys-color-scrim: #000000;
              /* 语义状态色(成功/警告) —— MD3 无对应角色, 按其 green/yellow 色调值补齐 */
              --noc-color-success: #6dd58c;
              --noc-color-on-success-container: #a6f2bd;
              --noc-color-success-container: #0f5223;
              --noc-color-warn: #f0c048;
              --noc-color-on-warn-container: #ffe08a;
              --noc-color-warn-container: #5a4213;

              /* ---- Typescale: MD3 ---- */
              --md-sys-typescale-display-small: 36px;
              --md-sys-typescale-headline-small: 24px;
              --md-sys-typescale-title-large: 22px;
              --md-sys-typescale-title-medium: 16px;
              --md-sys-typescale-title-small: 14px;
              --md-sys-typescale-body-large: 16px;
              --md-sys-typescale-body-medium: 14px;
              --md-sys-typescale-body-small: 12px;
              --md-sys-typescale-label-large: 14px;
              --md-sys-typescale-label-medium: 12px;
              --md-sys-typescale-label-small: 11px;
              --md-sys-font-plain: Roboto, "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
              --md-sys-font-mono: "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

              /* ---- Shape: MD3 ---- */
              --md-sys-shape-corner-none: 0;
              --md-sys-shape-corner-extra-small: 4px;
              --md-sys-shape-corner-small: 8px;
              --md-sys-shape-corner-medium: 12px;
              --md-sys-shape-corner-large: 16px;
              --md-sys-shape-corner-extra-large: 28px;
              --md-sys-shape-corner-full: 9999px;

              /* ---- Elevation: MD3 level 0-3 ---- */
              --md-sys-elevation-level0: none;
              --md-sys-elevation-level1: 0 1px 2px 0 rgba(0,0,0,.30), 0 1px 3px 1px rgba(0,0,0,.15);
              --md-sys-elevation-level2: 0 1px 2px 0 rgba(0,0,0,.30), 0 2px 6px 2px rgba(0,0,0,.15);
              --md-sys-elevation-level3: 0 1px 3px 0 rgba(0,0,0,.30), 0 4px 8px 3px rgba(0,0,0,.15);

              /* ---- State layers: MD3 规范值 ---- */
              --md-sys-state-hover-opacity: 0.08;
              --md-sys-state-focus-opacity: 0.10;
              --md-sys-state-pressed-opacity: 0.10;

              /* 让浏览器原生控件(输入框/下拉/滚动条)也走深色, 与 MD3 深色方案一致 */
              color-scheme: dark;
            }

            * { box-sizing: border-box; }

            /* 【2026-10-04 用户要求】第三板块(用户排行榜 + 5 地区流量分布)从界面移除。
               只隐藏不删 DOM: regionChart / rankList / regionStatusTag 仍被 JS 每轮写入,
               删掉会让 fetchMetrics 抛错并中断整页渲染(违反"只改设计")。 */
            .block3-hidden { display: none !important; }
            /* 原 3.5 域名排行卡: 第三板块隐藏后独占整行 */
            .domain-analytics-card { grid-column: 1 / -1; }

            body {
              font-family: var(--md-sys-font-plain);
              margin: 0;
              background: var(--md-sys-color-surface-container-lowest);
              color: var(--md-sys-color-on-surface);
              padding: 24px;
              font-size: var(--md-sys-typescale-body-medium);
              line-height: 20px;
              letter-spacing: 0.25px;
              word-break: keep-all;
              overflow-wrap: break-word;
              line-break: strict;
              -webkit-font-smoothing: antialiased;
            }
            .container { max-width: 1440px; margin: 0 auto; }

            /* ---------- MD3 Top app bar (small) ---------- */
            .header-bar {
              display: flex; justify-content: space-between; align-items: center;
              background: var(--md-sys-color-surface-container);
              border-radius: var(--md-sys-shape-corner-large);
              padding: 16px 20px; margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
            }
            .title-group h1 { margin: 0; font-size: var(--md-sys-typescale-title-large); font-weight: 400; line-height: 28px; color: var(--md-sys-color-on-surface); }
            .title-group span { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); font-family: var(--md-sys-font-mono); }
            .header-meta { display: flex; align-items: center; gap: 14px; font-family: var(--md-sys-font-mono); font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); }
            .live-dot { width: 8px; height: 8px; background: var(--noc-color-success); border-radius: var(--md-sys-shape-corner-full); animation: pulse 1.4s ease-in-out infinite; }
            @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

            /* ---------- MD3 Card (filled / elevated) ---------- */
            .card {
              background: var(--md-sys-color-surface-container);
              border: 1px solid var(--md-sys-color-outline-variant);
              border-radius: var(--md-sys-shape-corner-medium);
              padding: 16px;
              position: relative;
              box-shadow: var(--md-sys-elevation-level1);
            }
            .card-title {
              font-size: var(--md-sys-typescale-title-small); font-weight: 500; line-height: 20px;
              color: var(--md-sys-color-on-surface-variant);
              letter-spacing: 0.1px; margin-bottom: 12px;
              display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
            }
            .card-title > span { min-width: 0; }
            .card-title .title-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

            /* ---------- 1. 跨境出口物理链路全景遥测 (MD3 emphasized card) ---------- */
            .top-topology-card {
              background: var(--md-sys-color-surface);
              border: 1px solid var(--md-sys-color-outline-variant);
              border-radius: var(--md-sys-shape-corner-extra-large);
              padding: 20px 24px; margin-bottom: 16px;
              box-shadow: var(--md-sys-elevation-level2);
            }
            .telemetry-pipeline-grid { display: flex; flex-direction: row; align-items: center; justify-content: space-between; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 12px 2px 16px; gap: 8px; margin: 10px 0 14px; scrollbar-width: thin; }
            .telemetry-pipeline-grid::-webkit-scrollbar { height: 4px; }
            .telemetry-pipeline-grid::-webkit-scrollbar-thumb { background: var(--md-sys-color-outline-variant); border-radius: var(--md-sys-shape-corner-full); }
            .pipe-node {
              flex: 0 0 152px; min-width: 146px;
              background: var(--md-sys-color-surface-container-high);
              border: 1px solid var(--md-sys-color-outline-variant);
              border-radius: var(--md-sys-shape-corner-medium);
              padding: 12px 8px; text-align: center;
            }
            .pipe-node.active-tunnel { border-color: var(--md-sys-color-primary); background: var(--md-sys-color-primary-container); }
            .pipe-node.hardware-node { border-color: var(--noc-color-success); background: var(--noc-color-success-container); }
            .pipe-label { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); font-family: var(--md-sys-font-mono); letter-spacing: 0.5px; white-space: nowrap; }
            .pipe-title { font-size: var(--md-sys-typescale-title-small); font-weight: 500; color: var(--md-sys-color-on-surface); margin: 4px 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .pipe-desc { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); font-family: var(--md-sys-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            /* MD3 assist chip */
            .pipe-tag { font-size: var(--md-sys-typescale-label-small); font-weight: 500; padding: 3px 8px; border-radius: var(--md-sys-shape-corner-small); display: inline-block; margin-top: 6px; border: 1px solid transparent; white-space: nowrap; }
            .relay-node.invalid { background: var(--noc-color-success-container); color: var(--noc-color-on-success-container); }
            .pipe-tag.edge { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
            .pipe-tag.tunnel { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
            .pipe-tag.host { background: var(--noc-color-success-container); color: var(--noc-color-on-success-container); }
            .pipe-tag.egress { background: var(--md-sys-color-tertiary-container); color: var(--md-sys-color-on-tertiary-container); }
            .pipe-arrow { flex: 0 0 auto; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 5px; }
            .hop-arrow { color: var(--md-sys-color-outline); font-size: 16px; font-family: var(--md-sys-font-mono); }
            /* MD3 chip(承载实测数值) */
            .hop-badge {
              font-size: var(--md-sys-typescale-label-medium); font-weight: 500;
              font-family: var(--md-sys-font-mono);
              color: var(--md-sys-color-on-primary-container);
              background: var(--md-sys-color-primary-container);
              border: 1px solid transparent;
              padding: 4px 10px; border-radius: var(--md-sys-shape-corner-small); white-space: nowrap;
            }
            /* MD3 segmented button */
            .freq-btn {
              background: transparent; border: 1px solid var(--md-sys-color-outline);
              color: var(--md-sys-color-on-surface-variant);
              font-size: var(--md-sys-typescale-label-medium); font-weight: 500;
              padding: 6px 12px; border-radius: var(--md-sys-shape-corner-full); cursor: pointer;
              transition: background-color .15s, color .15s, border-color .15s;
              font-family: var(--md-sys-font-plain); position: relative; overflow: hidden;
            }
            .freq-btn:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent); color: var(--md-sys-color-on-surface); }
            .freq-btn.active { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); border-color: transparent; }

            .telemetry-hw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 16px; }
            .hw-card {
              background: var(--md-sys-color-surface-container-high);
              border: none; border-radius: var(--md-sys-shape-corner-medium);
              padding: 12px; display: flex; align-items: center; gap: 12px;
            }
            .hw-icon { font-size: 22px; line-height: 1; }
            .hw-content { flex: 1; min-width: 0; }
            .hw-title { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); font-weight: 500; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .hw-value { font-size: var(--md-sys-typescale-title-small); font-weight: 500; color: var(--md-sys-color-on-surface); font-family: var(--md-sys-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .hw-sub { font-size: var(--md-sys-typescale-label-small); color: var(--noc-color-success); font-family: var(--md-sys-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }


            .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(232px, 1fr)); gap: 16px; margin-bottom: 16px; }
            .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 16px; }

            @media (max-width: 960px) {
              body { padding: 12px; font-size: var(--md-sys-typescale-body-small); }
              .grid-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
              .grid-2 { grid-template-columns: 1fr; gap: 10px; }
              .card { padding: 12px; }
              .top-topology-card { padding: 16px; }
              .metric-large { font-size: var(--md-sys-typescale-headline-small); }
              .telemetry-pipeline-grid { display: flex; flex-direction: row; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 12px; gap: 8px; }
              .pipe-arrow { transform: none; display: flex; flex-direction: row; align-items: center; gap: 4px; }
              .pipe-node { flex: 0 0 120px; }
              .telemetry-hw-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
            }

            /* MD3 display metric */
            .metric-large { font-size: var(--md-sys-typescale-display-small); font-weight: 400; color: var(--md-sys-color-on-surface); font-family: var(--md-sys-font-mono); line-height: 44px; margin: 4px 0 2px; }
            .metric-sub { font-size: var(--md-sys-typescale-body-small); color: var(--md-sys-color-on-surface-variant); }

            .gauge-wrap { position: relative; width: 100%; height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
            .gauge-canvas { max-width: 220px; max-height: 110px; }
            .gauge-num-overlay { position: absolute; bottom: 8px; text-align: center; }
            .gauge-val { font-size: var(--md-sys-typescale-headline-small); font-weight: 400; font-family: var(--md-sys-font-mono); color: var(--md-sys-color-on-surface); }
            .gauge-limit { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); }

            /* MD3 outlined / tonal buttons */
            .tab-btn {
              background: transparent; color: var(--md-sys-color-on-surface-variant);
              border: 1px solid var(--md-sys-color-outline);
              padding: 6px 12px; border-radius: var(--md-sys-shape-corner-full);
              font-size: var(--md-sys-typescale-label-medium); font-weight: 500; cursor: pointer;
              transition: background-color .15s, color .15s;
            }
            .tab-btn:hover { background: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent); }
            .tab-btn.active { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border-color: transparent; font-weight: 500; }
            /* MD3 list item */
            .rank-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--md-sys-color-outline-variant); font-size: var(--md-sys-typescale-body-medium); }
            .rank-bar-bg { width: 130px; height: 6px; background: var(--md-sys-color-surface-container-highest); border-radius: var(--md-sys-shape-corner-full); overflow: hidden; margin-left: 10px; }
            .rank-bar-fill { height: 100%; background: var(--md-sys-color-primary); width: 0%; transition: width .3s; }

            .water-level-wrap { display: flex; align-items: center; gap: 16px; padding: 6px 0; }
            .water-tank { width: 36px; height: 120px; background: var(--md-sys-color-surface-container-highest); border: 1px solid var(--md-sys-color-outline-variant); border-radius: var(--md-sys-shape-corner-small); position: relative; overflow: hidden; display: flex; flex-direction: column-reverse; }
            .water-liquid { background: var(--md-sys-color-primary); width: 100%; height: 0%; transition: height .4s ease; }
            .water-detail { flex: 1; min-width: 0; }
            .water-detail > div, .water-detail span { word-break: keep-all; }

            .node-matrix-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 8px; }
            /* MD3 assist chip */
            .node-chip {
              background: var(--md-sys-color-surface-container-high);
              border: 1px solid var(--md-sys-color-outline-variant);
              border-radius: var(--md-sys-shape-corner-small);
              padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; gap: 6px;
              font-size: var(--md-sys-typescale-label-small); font-family: var(--md-sys-font-mono);
            }
            .node-chip > span:first-child { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .node-chip > span:last-child { flex-shrink: 0; white-space: nowrap; }
            .node-status-dot { width: 6px; height: 6px; border-radius: var(--md-sys-shape-corner-full); background: var(--noc-color-success); }
            .node-ping { color: var(--md-sys-color-on-surface-variant); }

            /* MD3 data table */
            table { width: 100%; min-width: 960px; border-collapse: collapse; text-align: left; }
            th, td { white-space: nowrap; }
            th {
              border-bottom: 1px solid var(--md-sys-color-outline-variant);
              padding: 12px 12px; font-size: var(--md-sys-typescale-label-medium); font-weight: 500;
              color: var(--md-sys-color-on-surface-variant); letter-spacing: 0.5px;
            }
            td { padding: 12px; font-size: var(--md-sys-typescale-body-medium); border-bottom: 1px solid var(--md-sys-color-surface-container-highest); }
            /* MD3 outlined text field */
            input[type="text"], input[type="password"], select, textarea {
              padding: 8px 12px; background: var(--md-sys-color-surface-container-highest);
              border: 1px solid var(--md-sys-color-outline);
              border-radius: var(--md-sys-shape-corner-extra-small);
              color: var(--md-sys-color-on-surface); font-size: var(--md-sys-typescale-body-medium);
              font-family: var(--md-sys-font-plain); outline: none;
              transition: border-color .15s, box-shadow .15s;
            }
            input[type="text"]:focus, input[type="password"]:focus, select:focus, textarea:focus {
              border-color: var(--md-sys-color-primary);
              box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
            }
            /* MD3 filled button */
            .btn-action {
              background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);
              font-weight: 500; padding: 10px 24px; border: none;
              border-radius: var(--md-sys-shape-corner-full); cursor: pointer;
              font-size: var(--md-sys-typescale-label-large); font-family: var(--md-sys-font-plain);
              transition: box-shadow .15s, background-color .15s; position: relative; overflow: hidden;
            }
            .btn-action:hover { box-shadow: var(--md-sys-elevation-level1); background: color-mix(in srgb, var(--md-sys-color-primary) 92%, #fff); }

            /* 【单点修复】顶部卡片主标题在本页不渲染(占位但不画字, 改版前即存在)。
               本地最小复现同结构正常, 线上异常 —— 用结构性规则强制它可见: 解除 flex 压缩、
               解除 overflow 裁剪、显式给亮色。只作用于这一处, 不影响其它标题。 */
            .top-topology-card .card-title > div:first-child > span:nth-child(2) {
              color: #ffffff !important;
              min-width: auto !important;
              flex: 0 1 auto !important;
              overflow: visible !important;
              text-overflow: clip !important;
              opacity: 1 !important;
              visibility: visible !important;
            }

            /* MD3 focus indicator */
            :focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px; border-radius: var(--md-sys-shape-corner-extra-small); }
                      /* ============================================================
               【2026-10-04 v2 重构】布局与响应式设计层
               ------------------------------------------------------------
               目标:
                 1) 桌面(≥1200px) 充分用满宽度、卡片等高、无大片留白;
                    平板(768-1199) 两栏; 手机(<640px) 单栏、可点区域≥44px、无横向溢出。
                 2) 每个真实指标只出现一次(去重后由 JS 只写唯一来源)。
                 3) 所有网格用 auto-fit/minmax, 不再出现"项目少被拉满整行"。
                 4) 各板块样式在本层集中微调(时延分布等)。
               本层放在样式表末尾, 通过同优先级后者胜出来覆盖前面的旧规则。
               ============================================================ */

            /* ---------- 页面骨架与安全区 ---------- */
            html { -webkit-text-size-adjust: 100%; }
            body {
              padding: clamp(8px, 1.6vw, 24px) !important;
              min-height: 100vh;
              overflow-x: hidden;
            }
            .container { max-width: 1560px !important; }

            /* ---------- 顶栏: 桌面一行 / 手机两行 ---------- */
            .header-bar {
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) auto;
              align-items: center;
              gap: 10px 16px;
            }
            .title-group h1 { font-size: clamp(17px, 1.4vw, 22px) !important; }
            .title-group .sub-line {
              display: flex; flex-wrap: wrap; gap: 4px 12px;
              font-size: var(--md-sys-typescale-label-small);
              color: var(--md-sys-color-on-surface-variant);
              font-family: var(--md-sys-font-mono);
              margin-top: 2px;
            }
            .header-meta { flex-wrap: wrap; gap: 8px 14px !important; justify-content: flex-end; }

            /* ---------- 通用卡片: 内容驱动高度, 不再拉伸留白 ---------- */
            .card { display: flex; flex-direction: column; }
            .card > .card-title { flex: 0 0 auto; }
            .card-title {
              font-size: var(--md-sys-typescale-title-small);
              text-transform: none !important;
              letter-spacing: 0.1px;
            }
            .card-title .tag {
              font-size: var(--md-sys-typescale-label-small);
              font-family: var(--md-sys-font-mono);
              color: var(--md-sys-color-on-surface-variant);
              background: var(--md-sys-color-surface-container-high);
              border-radius: var(--md-sys-shape-corner-small);
              padding: 2px 8px; white-space: nowrap;
            }

            /* ---------- 统一网格工具类 ---------- */
            .grid-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(272px, 1fr)); gap: 14px; margin-bottom: 14px; }
            .grid-half    { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 14px; margin-bottom: 14px; }
            .grid-thirds  { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-bottom: 14px; }

            /* ---------- 流水线: 手机端 2 列网格, 不再横向滚动 ---------- */
            .telemetry-pipeline-grid { gap: 10px !important; }
            .pipe-node { flex: 1 1 0 !important; min-width: 0 !important; }
            .pipe-arrow { flex: 0 0 auto; }
            .hop-badge { font-variant-numeric: tabular-nums; }


            /* ---------- 设备与链路健康(合并去重后) ---------- */
            .health-strip {
              display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 10px;
            }
            .health-item {
              background: var(--md-sys-color-surface-container-high);
              border-radius: var(--md-sys-shape-corner-medium);
              padding: 10px 12px; min-width: 0;
            }
            .health-k { font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .health-v { font-size: var(--md-sys-typescale-title-medium); font-weight: 500; color: var(--md-sys-color-on-surface); font-family: var(--md-sys-font-mono); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .health-hero { display: flex; align-items: baseline; gap: 10px; }
            .health-hero .big { font-size: clamp(26px, 3vw, 36px); font-weight: 500; font-family: var(--md-sys-font-mono); color: var(--md-sys-color-on-surface); line-height: 1.1; }

            /* ---------- 时延分布直方图 ---------- */
            /* ---------- 新增② 时延分布直方图 ---------- */
            .hist-wrap { display: flex; align-items: flex-end; gap: 3px; height: 96px; padding-top: 6px; }
            .hist-bar { flex: 1 1 0; min-width: 3px; background: var(--md-sys-color-primary); border-radius: 2px 2px 0 0; position: relative; transition: height .4s; }
            .hist-bar > span { position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; color: var(--md-sys-color-on-surface-variant); font-family: var(--md-sys-font-mono); white-space: nowrap; }
            .hist-axis { display: flex; justify-content: space-between; font-size: var(--md-sys-typescale-label-small); color: var(--md-sys-color-on-surface-variant); font-family: var(--md-sys-font-mono); margin-top: 18px; }


            /* ---------- 用户表: 桌面表格 / 手机卡片 ---------- */
            .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .user-cards { display: none; }

            @media (max-width: 720px) {
              .table-scroll { display: none; }
              .user-cards { display: grid; gap: 10px; }
              .user-card {
                background: var(--md-sys-color-surface-container-high);
                border-radius: var(--md-sys-shape-corner-medium); padding: 12px;
              }
              .user-card .uc-hd { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
              .user-card .uc-nm { font-size: var(--md-sys-typescale-title-medium); font-weight: 500; color: var(--md-sys-color-on-surface); }
              .user-card .uc-kv { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: var(--md-sys-typescale-label-small); font-family: var(--md-sys-font-mono); }
              .user-card .uc-kv .k { color: var(--md-sys-color-on-surface-variant); white-space: nowrap; }
              .user-card .uc-kv .v { color: var(--md-sys-color-on-surface); word-break: break-all; }
            }

            /* ---------- 手机端整体降级规则 ---------- */
            @media (max-width: 900px) {
              .grid-half { grid-template-columns: 1fr !important; }
              .grid-thirds { grid-template-columns: 1fr !important; }
              .grid-metrics { grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)) !important; }
            }
            @media (max-width: 640px) {
              :root { --md-sys-typescale-display-small: 28px; }
              .grid-4, .grid-2, .grid-metrics, .grid-half, .grid-thirds { grid-template-columns: 1fr !important; gap: 10px !important; }
              .card { padding: 12px !important; }
              .top-topology-card { padding: 14px !important; }

              /* 流水线改成 2 列网格, 箭头隐藏(用编号顺序表达方向), 彻底消除横向滚动 */
              .telemetry-pipeline-grid {
                display: grid !important; grid-template-columns: 1fr 1fr !important;
                gap: 8px !important; overflow: visible !important; padding: 4px 0 8px !important;
              }
              .telemetry-pipeline-grid .pipe-arrow { display: none !important; }
              .pipe-node { flex: none !important; width: auto !important; padding: 10px 8px !important; }
              .pipe-node::before {
                content: attr(data-step); display: block;
                font-size: 9px; color: var(--md-sys-color-outline);
                font-family: var(--md-sys-font-mono); margin-bottom: 2px;
              }


              /* 触控目标 */
              .freq-btn, .tab-btn, .btn-action, select { min-height: 40px; }
              .freq-btn { padding: 8px 14px !important; }

              /* 顶栏堆叠 */
              .header-bar { grid-template-columns: 1fr !important; }
              .header-meta { justify-content: flex-start !important; }
              .title-group h1 { font-size: 17px !important; }

              /* 表格与用户区 */
              .health-strip { grid-template-columns: 1fr 1fr; }
              .hist-wrap { height: 74px; }
            }

            @media (max-width: 420px) {
              .health-strip { grid-template-columns: 1fr; }
              .pipe-node { padding: 8px 6px !important; }
            }


            /* ============================================================
               【2026-10-04 v2 修复】审计问题集中修复
               ============================================================ */
            /* --- 1. 横向溢出根治 ---
               根因: 用户表 「min-width:960px」 经 .card(flex 容器) 的 min-width:auto
               传播成整页最小宽度 ~1158px, 手机/平板整页被撑宽、右侧被裁掉。 */
            .card, .top-topology-card,
            .grid-2 > *, .grid-4 > *, .grid-metrics > *, .grid-half > *, .grid-thirds > *, .grid-bottom > *,
            .telemetry-pipeline-grid > *, .health-strip > * { min-width: 0; }
            html, body { max-width: 100%; }
            canvas { max-width: 100% !important; }

            /* --- 2. 底部三栏: 桌面固定 3 等分撑满容器(原来只占 1163px, 右侧空 455px),
                   且 align-items:start 让每张卡按内容高度, 不再被最高的卡拉到 2400px。 --- */
            .grid-bottom {
              display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 14px; margin-bottom: 14px; align-items: start;
            }
            /* 【2026-10-04 重排】原来三等分: 55 个节点的阵列只分到 1/3 宽, 被挤成 19 行高。
               现在: 第一行 = 示波器(半宽) + 用户管理(半宽); 第二行 = 节点阵列(整行, 铺满宽度)。 */
            .grid-bottom > .card:nth-child(1) { grid-column: span 3; }              /* 示波器 */
            .grid-bottom > .card:nth-child(3) { grid-column: span 3; order: 2; }    /* 用户管理 */
            .grid-bottom > .card:nth-child(2) { grid-column: span 6; order: 3; }    /* 节点阵列 -> 整行 */
            @media (max-width: 1100px) {
              .grid-bottom { grid-template-columns: 1fr; }
              .grid-bottom > .card:nth-child(1),
              .grid-bottom > .card:nth-child(2),
              .grid-bottom > .card:nth-child(3) { grid-column: span 1; order: 0; }
            }
            .grid-metrics, .grid-half, .grid-thirds, .grid-2, .grid-4 { align-items: start; }

            /* --- 3. 页头: 修"auto 列吃掉全部宽度导致 H1 一字一行(平板下页头高 2048px)" --- */
            .title-group { min-width: 0; }
            .title-group h1 { overflow-wrap: anywhere; }
            .header-meta { min-width: 0; }
            @media (max-width: 1100px) {
              .header-bar { grid-template-columns: minmax(0, 1fr) !important; }
              .header-meta { justify-content: flex-start !important; }
            }
            @media (max-width: 900px) {
              .header-meta .hd-long { display: none; }
            }

            /* --- 4. 示波器图表固定高, 卡片不再被拉长 --- */
            .live-chart-box { height: 150px; position: relative; }
            @media (max-width: 640px) { .live-chart-box { height: 120px; } }

            /* --- 4.5 手机端不再把文字切成 "客户..." / "本机接入质量 · C..." --- */
            @media (max-width: 640px) {
              .pipe-title, .pipe-desc { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
              .pipe-title { font-size: 13px !important; line-height: 1.3; }
            }

            /* --- 5. 触控目标与手机端细则 --- */
            @media (max-width: 760px) {
              .freq-btn, .tab-btn, .btn-action, button, select { min-height: 44px; }
              .freq-btn { padding: 10px 16px !important; font-size: 13px !important; }
              .card-title { align-items: flex-start !important; }
              /* 用户管理卡的操作按钮原来在视口外 -> 换行到标题下方并占满宽度 */
              .card-title > div[style*="display:flex"] { flex-wrap: wrap !important; }
              #btnPhoneSync, #btnToggleAdd, #btnManualScan, #btnSpeedTest { flex: 1 1 auto; }
              /* 9/10px 小字在深色底上读不清 -> 统一提到 11px */
            .pipe-label, .pipe-desc,
              .hw-title, .hw-sub, .health-k, .node-chip, .metric-sub,
              .card-title .tag, td::before, .hist-axis, th, td { font-size: 11px !important; }
              [style*="font-size:9px"], [style*="font-size: 9px"],
              [style*="font-size:10px"], [style*="font-size: 10px"] { font-size: 11px !important; }
              .hist-bar > span { display: none; }
              .hist-bar { min-width: 5px; }
            }

            /* --- 6. 手机端: 接入质量标题行允许换行(否则"实测落点/正在测速"被裁掉);
                   矩阵/节点网格一律单列或两列, 不再出现只看得见 1.6 列 --- */
            @media (max-width: 720px) {
              table { min-width: 0 !important; width: 100% !important; display: block; }
              thead { display: none; }
              tbody { display: block; }
              tr {
                display: block; background: var(--md-sys-color-surface-container-high);
                border-radius: var(--md-sys-shape-corner-medium);
                padding: 10px 12px; margin-bottom: 10px; border: none !important;
              }
              td {
                display: block !important; width: auto !important; border: none !important;
                padding: 6px 0 !important; white-space: normal !important;
                font-size: var(--md-sys-typescale-body-small) !important;
              }
              td::before {
                content: attr(data-label); display: block;
                font-size: 10px; color: var(--md-sys-color-on-surface-variant);
                margin-bottom: 3px; letter-spacing: 0.3px;
              }
              td:empty { display: none !important; }
              td input { width: 100% !important; box-sizing: border-box; }
              .node-matrix-grid { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 1024px) and (min-width: 721px) {
              .node-matrix-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important; }
            }
            /* 流水线步骤序号原来是 9px + outline 色(约 4.5:1, 卡在 AA 边缘) -> 提亮放大 */
            .pipe-node::before { font-size: 10px !important; color: var(--md-sys-color-on-surface-variant) !important; }

            
            /* ============================================================
               【2026-10-04 · 55 节点蜂窝矩阵】第一板块内"手机 → 中转节点延迟"
               ============================================================ */
            #relayMatrix { grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); }
            .relay-chip {
              background: var(--md-sys-color-surface-container-high);
              border: 1px solid var(--md-sys-color-outline-variant);
              border-radius: var(--md-sys-shape-corner-medium);
              padding: 8px 10px; min-width: 0;
              display: flex; flex-direction: column; gap: 4px;
              transition: border-color .2s, background-color .2s;
            }
            .relay-chip .rc-top { display: flex; align-items: center; gap: 6px; min-width: 0; }
            .relay-chip .rc-name {
              flex: 1 1 auto; min-width: 0;
              font-size: 11px; font-weight: 600; color: var(--md-sys-color-on-surface);
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .relay-chip .rc-badge {
              flex-shrink: 0; font-size: 10px; font-family: var(--md-sys-font-mono);
              padding: 1px 6px; border-radius: var(--md-sys-shape-corner-full);
            }
            .relay-chip .rc-badge.ok { background: var(--noc-color-success-container); color: var(--noc-color-on-success-container); }
            .relay-chip .rc-badge.warn { background: var(--noc-color-warn-container); color: var(--noc-color-on-warn-container); }
            .relay-chip .rc-badge.bad { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
            .relay-chip .rc-badge.na { background: var(--md-sys-color-surface-container-highest); color: var(--md-sys-color-on-surface-variant); }
            .relay-chip .rc-sub {
              font-size: 10px; font-family: var(--md-sys-font-mono);
              color: var(--md-sys-color-on-surface-variant);
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .relay-chip .rc-ms {
              display: flex; align-items: baseline; justify-content: space-between; gap: 6px;
              font-size: 15px; font-weight: 600; font-family: var(--md-sys-font-mono);
              color: var(--md-sys-color-on-surface);
            }
            .relay-chip .rc-colo { color: var(--noc-color-warn-container, #f0c048); font-weight: 600; }
            .relay-chip .rc-age {
              font-size: 10px; font-weight: 400;
              color: var(--md-sys-color-on-surface-variant); white-space: nowrap;
            }
            .relay-chip.testing .rc-age { color: var(--md-sys-color-on-primary-container); }
            /* 正在测的节点: 主色边框 + 容器色底 + 徽标动画 */
            .relay-chip.testing {
              border-color: var(--md-sys-color-primary) !important;
              background: var(--md-sys-color-primary-container) !important;
            }
            .relay-chip.testing .rc-badge {
              background: var(--md-sys-color-primary) !important;
              color: var(--md-sys-color-on-primary) !important;
              animation: pulseTesting 1.6s ease-in-out infinite;
            }
            .relay-chip.testing .rc-ms { color: var(--md-sys-color-on-primary-container); }
            .relay-chip.testing .rc-name { color: var(--md-sys-color-on-primary-container); }

            /* 底部: 删掉重复的节点阵列后, .grid-bottom 只剩 2 张卡(示波器 + 用户管理) */
            .grid-bottom { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-bottom > .card:nth-child(1),
            .grid-bottom > .card:nth-child(2),
            .grid-bottom > .card:nth-child(3) { grid-column: auto; order: 0; }
            @media (max-width: 1100px) { .grid-bottom { grid-template-columns: 1fr; } }

            /* 手机端: 矩阵两列, 触控友好。
               注意必须带 !important: 上面的 @media (max-width:720px) 里有一条
               .node-matrix-grid { grid-template-columns: 1fr !important; }(为底部域名榜写的),
               它同样命中 #relayMatrix, 不加 !important 时两列设置会被压掉。 */
            @media (max-width: 640px) {
              #relayMatrix { grid-template-columns: 1fr 1fr !important; }
              .relay-chip { padding: 10px; }
            }

            /* ---------- 打印/无障碍小改进 ---------- */
            @media (prefers-reduced-motion: reduce) {
              * { animation: none !important; transition: none !important; }
            }
            .sr-only {
              position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
              overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            
            <!-- 顶栏控制台 Header -->
            <div class="header-bar">
              <div class="title-group">
                <h1>NETWORK OPERATIONS CENTER · 跨境链路实时运营大屏</h1>
                <div class="sub-line">
                  <span>接入设备 <b id="hdrDevice" style="color:var(--md-sys-color-on-surface);">--</b></span>
                  <span>接入网络 <b id="hdrWifi" style="color:var(--md-sys-color-on-surface);">--</b></span>
                  <span>出口 节点所在地 · 手机住宅网络</span>
                </div>
              </div>
              <div class="header-meta" style="display:flex;align-items:center;gap:10px;">
                <span class="hd-long" style="color:var(--md-sys-color-outline);">CLOUDFLARE ANYCAST + ARGO SMART ROUTING</span>
                <span style="color:var(--md-sys-color-outline-variant);">|</span>
                <span id="syncStatusText" style="display:none;"></span>
                <span id="syncClock" style="font-family:monospace;color:#888;">--:--:--</span>
                <span style="color:#333;">|</span>
                <span id="headerBuild" style="font-family:monospace;font-size:11px;color:#38bdf8;white-space:nowrap;">版本 加载中…</span>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 0. 断线告警横幅 (手机超过阈值未上报时自动弹出) -->
            <div id="offlineBanner" style="display:none; margin-bottom:14px; padding:12px 16px; border-radius:6px; font-size:13px; font-weight:600; line-height:1.7; border:1px solid #450a0a;"></div>

            <!-- 1. 跨境出口物理链路全景遥测与区域矩阵一体化测控大屏 -->
            <!-- ======================================================== -->
            <div class="top-topology-card">
              <!-- 板块头部：全链路延迟标题 + 采集频率双模切换按钮 (默认一分钟) + 动态数据新鲜度 + 端到端实测时延 -->
              <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#22c55e;">●</span>
                  <span style="font-weight:700;color:#fff;font-size:13px;">跨境出口物理链路全景遥测 (Physical Edge-to-Tunnel Telemetry)</span>
                  <span style="font-size:10px;background:#151515;border:1px solid #2a2a2a;padding:2px 6px;border-radius:3px;color:#aaa;font-family:monospace;">native core</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                  <!-- 采集频次双模切换按钮：默认 1 分钟一采集，仅手动切换到 2 秒才极速 -->
                  <div style="display:flex;align-items:center;gap:2px;background:#101010;border:1px solid #242424;border-radius:6px;padding:2px 4px;">
                    <button id="btnFreq2s" class="freq-btn" onclick="setPollingInterval(2000)">⚡ 2秒极速</button>
                    <button id="btnFreq60s" class="freq-btn active" onclick="setPollingInterval(60000)">🍃 1分钟采集 (默认)</button>
                  </div>
                  <!-- 数据时效: 显示"数据本身"的真实年龄 (服务端 serverTime - 手机最近上报时刻) -->
                  <div style="display:flex;align-items:center;gap:6px;background:#0d0d0d;border:1px solid #222;border-radius:6px;padding:3px 9px;">
                    <div class="live-dot" id="liveDot"></div>
                    <span id="dataFreshnessTag" style="font-family:monospace;font-size:11px;color:#555;font-weight:600;">等待数据</span>
                  </div>
                  <div style="font-family:monospace;font-size:11px;color:#888;" title="三段同口径(均为单次 1×RTT)真实测量值的最低3次中位数之和(低于10ms 的样本视为无效丢弃)；非单条端到端路径；边缘计算耗时不计入">
                    三段真实单次 RTT 之和: <b id="totalE2E" style="color:#22c55e;">-- ms</b>
                  </div>
                </div>
              </div>

              <!-- A. 全链路穿透流向拓扑流水线 (End-to-End Pipeline) 横向放置 -->
              <div class="telemetry-pipeline-grid">
                <div class="pipe-node" data-step="①">
                  <div class="pipe-label">CLIENT ACCESS</div>
                  <div class="pipe-title">客户端节点</div>
                  <div class="pipe-desc">浏览器 / 代理客户端</div>
                  <div class="pipe-tag online" id="pipeClientTag">样本 --</div>
                </div>
                <div class="pipe-arrow">
                  <div class="hop-arrow">➔</div>
                  <div class="hop-badge" id="pipeClientEdge" title="真实测量：浏览器请求 /api/rtt 的往返耗时（纯网络，不含任何服务端计算）">-- ms</div>
                </div>
                <div class="pipe-node" data-step="②">
                  <div class="pipe-label">ANYCAST EDGE</div>
                  <div class="pipe-title">Cloudflare 边缘</div>
                  <div class="pipe-desc">env.WORKER_HOST</div>
                  <div class="pipe-tag edge" id="pipeColoTag">实测落点 --</div>
                </div>
                <div class="pipe-arrow">
                  <div class="hop-arrow">➔</div>
                  <div class="hop-badge" id="pipeEdgeArgo" title="CF 边缘处理本次请求的耗时（非网络时延，不参与 RTT 求和）">-- ms</div>
                </div>
                <div class="pipe-node active-tunnel" data-step="③">
                  <div class="pipe-label">ARGO TUNNEL</div>
                  <div class="pipe-title">加密双向隧道</div>
                  <div class="pipe-desc" id="pipeTunnelId" title="cloudflared 隧道 ID 前缀(取自手机 config.yml)">${TUNNEL_ID_PREFIX}…</div>
                  <div class="pipe-tag tunnel" id="pipeProtoTag">HTTP/2 多路复用</div>
                </div>
                <div class="pipe-arrow">
                  <div class="hop-arrow">➔</div>
                  <div class="hop-badge" id="pipeArgoPhone" title="手机 curl 到 env.TUNNEL_HOST 的 time_connect（TCP 1×RTT，与浏览器侧同口径）">-- ms</div>
                </div>
                <div class="pipe-node hardware-node" data-step="④">
                  <div class="pipe-label">MOBILE HOST NODE</div>
                  <div class="pipe-title" id="pipeDevice">${DEVICE_NAME}</div>
                  <div class="pipe-desc" id="pipeSoc">${SOC} · arm64-v8a</div>
                  <div class="pipe-tag host" id="pipeXrayState">状态 --</div>
                </div>
                <div class="pipe-arrow">
                  <div class="hop-arrow">➔</div>
                  <div class="hop-badge" id="pipePhoneEgress" title="真实测量：手机连接公网锚点(8.8.8.8 / 1.1.1.1)的 time_connect，即手机 → ISP 出口">-- ms</div>
                </div>
                <div class="pipe-node" data-step="⑤">
                  <div class="pipe-label">EGRESS ISP</div>
                  <div class="pipe-title">原生住宅出口</div>
                  <div class="pipe-desc">5 个入站分流区(R2 行)</div>
                  <div class="pipe-tag egress" id="pipeEgressTag">IPv4 出站</div>
                </div>
              </div>

              <!-- 【2026-10-04 用户要求】手机 → 中转节点延迟 = 55 个节点的【蜂窝矩阵】:
                     每个节点一张卡, 名字与订阅逐字一致, 显示真实时延与状态,
                     刚刚被探测的那个节点带【测速中】徽标, 数值一更新就切到下一个。 -->
                <div style="display:flex;align-items:center;gap:8px;margin:12px 0 6px;flex-wrap:wrap;">
                  <span style="font-weight:700;color:#eee;font-size:12px;" title="口径: 手机对每个中转节点发一次真实 HTTPS 请求, 取 TCP 1×RTT。node_probe 每 10 秒探 1 个节点, 全量一轮约 9 分钟; 节点名与订阅下发内容逐字一致, 改名自动同步。">手机 → 中转节点延迟 (Phone → Relay Nodes)</span>
                  <span class="tag" id="relayProgress">--</span>
                  <span id="matrixStatusTag" style="color:#777;font-size:11px;">● 节点清单已装载 · 等待探测结果</span>
                  <button id="btnSpeedTest" onclick="runManualSpeedTest()" style="background:#141414;color:#fff;border:1px solid #333;border-radius:4px;padding:3px 10px;font-size:11px;font-family:monospace;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.2s;">
                    <span id="speedTestIcon">⚡</span>
                    <span id="speedTestText">点击测速</span>
                  </button>
                </div>
                <div class="node-matrix-grid" id="relayMatrix" style="margin-bottom:2px;">
                  <!-- 由 renderRelayMatrix 动态渲染 55 个节点 -->
                </div>

              </div>

              <!-- 【2026-10-04 用户要求】CF 接入机房(6 张锚点卡)整行已按用户要求移除;
                   锚点仍是手机每 60 秒真实测量的对象, 数据保留给"本机接入质量评分"
                   与"本轮采样覆盖"使用, 只是不再单独占一整行卡片。 -->
              <!-- C.【2026-10-04 重构】原"手机物理硬件与无线射频态势"4 张卡已删除:
                   电池/温度 与"设备与链路健康"卡重复, WiFi 与链路协商亦重复, Sockets 与
                   "实时并发连接数"同源(都是 ACTIVE_CONNS)。现在每个指标只出现一次,
                   全部并入下面这张"设备与链路健康"卡(见 grid-metrics 第 2 格)。 -->
            </div>

            <!-- ======================================================== -->
            <!-- 1.5 本机 ↔ CF 边缘 时延分布 (原来与"六地区丢包明细"共用一个双栏容器,
                 对侧那张卡已按用户要求删除, 这里改为整行单卡;
                 "⚡ 手动刷新"按钮原挂在已删除的锚点行标题上, 现挪到本卡标题右侧)。 -->
            <!-- ======================================================== -->
            <div class="card" style="margin-bottom:14px;">
              <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <span>本机 ↔ CF 边缘 时延分布 <span class="tag" id="histTag">--</span></span>
                <button type="button" onclick="manualScan()" id="btnManualScan"
                  title="命令手机立刻做一次全速扫描: 6 个锚点背靠背连续测(每区 15 次采样, 与周期扫描同口径), 去掉 10 秒间隔, 每测完一个立即上报。约 31 秒完成。"
                  style="padding:5px 12px;background:#141414;color:#ddd;border:1px solid #2a2a2a;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;white-space:nowrap;flex-shrink:0;">⚡ 手动刷新</button>
              </div>
              <div class="hist-wrap" id="histWrap"></div>
              <div class="hist-axis" id="histAxis"></div>
            </div>

            <!-- ======================================================== -->
            <!-- 2. 关键指标面板 -->
            <!-- ======================================================== -->
            <div class="grid-metrics">
              <!-- 指标 1：实时上传带宽与负荷（量程严格 150 Mbps） -->
              <div class="card">
                <div class="card-title">实时上行带宽负荷 (Max 150M)</div>
                <div class="gauge-wrap">
                  <canvas id="gaugeChart" class="gauge-canvas"></canvas>
                  <div class="gauge-num-overlay">
                    <div class="gauge-val" id="gaugeVal">0.00 Mbps</div>
                    <div class="gauge-limit">量程上限 150.0 Mbps</div>
                  </div>
                </div>
                <!-- 【2026-10-04】原来这张卡只有半圆仪表, 与同排更高的卡并排时下方一大片空白。
                     补三个真实速率指标(与"总流量吞吐统计"的累计值不同: 这里全是瞬时速率)。 -->
                <div class="health-strip" style="margin-top:12px;">
                  <div class="health-item"><div class="health-k">当前上行</div><div class="health-v" id="curUp">--</div></div>
                  <div class="health-item"><div class="health-k">当前下行</div><div class="health-v" id="curDown">--</div></div>
                  <div class="health-item"><div class="health-k">近 15 分钟峰值(上行)</div><div class="health-v" id="peakUp">--</div></div>
                </div>
              </div>

              <!-- 指标 2【2026-10-04 合并去重】"设备与链路健康" = 原硬件格(电池/WiFi/链路/在线时长)
                   + 原健康卡(Xray/隧道错误/告警), 每个指标只保留一处。 -->
              <div class="card">
                <div class="card-title">设备与链路健康 <span class="tag" id="healthAlert">--</span></div>
                <div class="health-hero">
                  <div class="big" id="healthBattery">--%</div>
                  <div style="font-size:12px;color:var(--md-sys-color-on-surface-variant);line-height:1.7;">
                    <div id="healthCharging">--</div>
                    <div>机身温度 <b id="healthTemp" style="color:var(--md-sys-color-on-surface);">--</b></div>
                  </div>
                </div>
                <div class="health-strip" style="margin-top:12px;">
                  <div class="health-item"><div class="health-k">WiFi SSID · 信号强度</div><div class="health-v" id="hwWifi">--</div></div>
                  <div class="health-item"><div class="health-k">链路协商速率</div><div class="health-v" id="hwWifiSpeed">--</div></div>
                  <div class="health-item"><div class="health-k">系统连续在线</div><div class="health-v" id="hwUptime">--</div></div>
                  <div class="health-item"><div class="health-k">Xray 核心</div><div class="health-v" id="healthXray">--</div></div>
                  <div class="health-item"><div class="health-k">隧道错误累计</div><div class="health-v" id="healthCfErr">--</div></div>
                </div>
              </div>

              <!-- 指标 3：实时并发连接数水位计 -->
              <div class="card">
                <div class="card-title">实时并发连接数 (Sockets)</div>
                <div class="water-level-wrap">
                  <div class="water-tank">
                    <div class="water-liquid" id="waterLevelBar"></div>
                  </div>
                  <div class="water-detail">
                    <div class="metric-large" id="connCount">0</div>
                    <div class="metric-sub">当前活跃代理会话</div>
                    <div style="font-size:10px;color:#555;margin-top:6px;">警戒阈值: <b style="color:#888;">500</b> 会话（满刻度同值）</div>
                    <div style="font-size:10px;color:#555;margin-top:2px;">近15分钟峰值: <b id="connPeak" style="color:#38bdf8;">--</b> 会话</div>
                    <!-- 【2026-10-04】原"系统 fd 上限 32768"是写死常量, 全链路无对应数据源, 已删除。 -->
                  </div>
                </div>
              </div>

              <!-- 指标 4：总吞吐与上下行配比 -->
              <div class="card">
                <div class="card-title">总流量吞吐统计</div>
                <div class="metric-large" id="totalBytes">--</div>
                <div class="metric-sub" style="margin-bottom:8px;">下行消耗: <span id="downBytes" style="color:#fff;">--</span></div>
                <div class="metric-sub">上行回传: <span id="upBytes" style="color:#fff;">--</span></div>
              </div>
            </div>

            <!-- 2.5 新增：链路质量评分(B2) + 服务可靠性(B4) -->
            <div class="grid-2">
              <div class="card">
                <div class="card-title">本机接入质量评分 <span class="tag">6 个 CF 锚点综合</span></div>
                <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
                  <div style="text-align:center;flex-shrink:0;">
                    <div style="font-size:40px;font-weight:700;line-height:1;color:#22c55e;" id="qualityScore">--</div>
                    <div style="font-size:10px;color:#777;margin-top:4px;">满分 100</div>
                  </div>
                  <div style="flex:1;min-width:190px;">
                    <div id="qualityGrade" style="font-size:13px;font-weight:700;color:#22c55e;">评测中…</div>
                    <div style="height:6px;background:#141414;border-radius:3px;margin-top:8px;overflow:hidden;">
                      <div id="qualityBar" style="height:100%;width:0%;background:#22c55e;transition:width .4s;"></div>
                    </div>
                    <div id="qualityDetail" style="font-size:11px;color:#666;margin-top:9px;line-height:1.6;">时延 50% + 抖动 25% + 丢包 25% 加权</div>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-title">上报链路可靠性</div>
                <!-- 【2026-10-04 可读性】小格子最小 96px, 标签不再被挤成竖排 -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:11px;">
                  <!-- 【2026-10-04 去重】原"Xray 核心/隧道错误累计/实时数据延迟"三项与
                       "设备与链路健康"卡、顶栏"数据新鲜度"重复, 已删除; 只保留上报节奏本身。 -->
                  <div><div class="health-k">上报延迟评分</div><div style="font-size:22px;font-weight:500;color:var(--noc-color-success);" id="relReport">--</div></div>
                  <div><div class="health-k">手机上报节奏</div><div style="font-size:22px;font-weight:500;color:var(--md-sys-color-on-surface);">6 秒/次</div></div>
                  <div><div class="health-k">本轮采样覆盖</div><div style="font-size:22px;font-weight:500;color:var(--md-sys-color-on-surface);" id="relCover">--</div></div>
                </div>
                <div id="relNote" style="font-size:11px;color:#666;margin-top:11px;line-height:1.6;">手机约每 6 秒上报一次</div>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 3. 核心双栏：真实用户排行榜 + 5地区真实已接入物理流量分布 -->
            <!-- ======================================================== -->
            <div class="grid-2">
              
              <!-- 图表 1：真实用户流量消耗排行榜 (从始至终累计 · 绝对单调不归零) -->
              <!-- 【2026-10-04 用户要求】第三板块从界面移除: 加 block3-hidden 由 CSS 隐藏。
                   保留 DOM 是因为 renderRankList() 仍在写入 #rankList。 -->
              <div class="card block3-hidden">
                <div class="card-title">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-weight:700;color:#fff;">用户全周期流量总消耗榜 (从始至终累计)</span>
                  </div>
                  <span style="font-size:10px;color:#22c55e;font-family:monospace;">● 纯真累计 · 永不归零</span>
                </div>
                <div id="rankList" style="min-height:160px;">
                  <!-- 由真实数据库用户渲染 -->
                </div>
              </div>

              <!-- 图表 2：5地区真实已接入流量分布图 (非节点数量，而是真实流通流量比例) -->
              <!-- 【2026-10-04 用户要求】第三板块从界面移除: 同样只隐藏 DOM ——
                   regionChart 是 Chart.js 实例, 删除元素会让 fetchMetrics 抛错并中断整页渲染。 -->
              <div class="card block3-hidden">
                <div class="card-title">
                  <span>5 地区已接入流量分布 (Real Ingress)</span>
                  <span style="font-size:10px;color:#666;" id="regionStatusTag">物理流量分流监控</span>
                </div>
                <div style="height:170px;position:relative;">
                  <canvas id="regionChart"></canvas>
                </div>
              </div>

            <!-- ======================================================== -->
            <!-- 3.5 全网成员访问域名/网站累计统计看板 (Realtime Domain Analytics) -->
            <!-- ======================================================== -->
            <div class="card domain-analytics-card" style="margin-bottom:14px;">
              <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>全网成员访问域名/网站排行榜 (Realtime Domain Analytics)</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:10px;color:#777;">筛选成员:</span>
                  <select id="domainUserSelect" onchange="renderDomainStats()" style="background:#000;color:#fff;border:1px solid #222;border-radius:4px;padding:3px 8px;font-size:11px;outline:none;font-family:sans-serif;">
                    <option value="ALL">🌐 全网成员汇总</option>
                  </select>
                </div>
              </div>
              <div id="domainRankList" class="node-matrix-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;">
                <!-- 由 renderDomainStats 动态渲染 -->
              </div>
            </div>
            </div>
            <!-- 【2026-10-04 修复真实结构 bug】上面这个 </div> 是补上的:
                 原第 3 板块的 <div class="grid-2"> 一直没有闭合, 导致后面
                 "示波器 / 节点阵列 / 用户管理" 三张卡全被当成它的网格子项 ——
                 桌面下它们只占 1163px(右侧空 455px), 且被最高的卡拉伸到 2400px 高。
                 现在正确闭合, 并把这三张卡放进专用 .grid-bottom(桌面固定 3 等分, 窄屏单列)。 -->
            <div class="grid-bottom">

            <!-- ======================================================== -->
            <!-- 4. 吞吐带宽趋势示波器 (近 15 分钟连续全真波次 · 30秒采样) -->
            <!-- ======================================================== -->
            <div class="card" style="margin-bottom:14px;">
              <div class="card-title">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span>实时吞吐带宽示波器 <span class="tag">近 15 分钟 · 约 30 秒一点</span></span>
                  <span class="tag" id="livePtsTag">--</span>
                </div>
                <span style="font-size:11px;color:#777;font-family:monospace;">实线(蓝): 上行吞吐 · 实线(青): 下行吞吐 · 空闲时段为真实的 0</span>
              </div>
              <div class="live-chart-box">
                <canvas id="liveChart"></canvas>
              </div>
            </div>

            <!-- 【2026-10-04 用户要求】底部的"节点健康状态蜂窝阵列"已与第一板块内的
                 55 节点蜂窝矩阵合并(内容完全重复, 保留两处属于重复展示)。
                 "点击测速"按钮与状态标签随矩阵一起挪到了第一板块。 -->
            <!-- ======================================================== -->
            <!-- 6. 用户管理 (D1: 合并为一张大卡 = 工具栏 + 可折叠添加表单 + 全宽表格) -->
            <!-- ======================================================== -->
            <div class="card">
              <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;text-transform:none;letter-spacing:0;">
                <span style="display:flex;align-items:center;gap:10px;">
                  <span>用户管理 · 授权与订阅</span>
                  <span style="font-size:11px;font-weight:400;color:#666;letter-spacing:0;">同步策略：新增/禁用/删除 立即生效 · 其余每 12 小时一次 · 或点右侧 ⟳ 强制同步</span>
                  <button type="button" id="btnToggleAdd" onclick="toggleAddUserForm()"
                    style="padding:5px 12px;background:#141414;color:#ddd;border:1px solid #2a2a2a;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">＋ 添加成员</button>
                </span>
                <span style="display:flex;align-items:center;gap:10px;">
                  <span id="phoneSyncBadge" style="font-size:11px;font-weight:500;color:#666;">手机主库：检测中…</span>
                  <button type="button" id="btnPhoneSync" onclick="requestPhoneSync()"
                    title="向手机下发同步指令：手机将重新拉取用户库与配置并回报确认"
                    style="padding:5px 12px;background:#141414;color:#ddd;border:1px solid #2a2a2a;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">⟳ 刷新</button>
                </span>
              </div>
              <form method="POST" id="addUserForm" style="display:none; gap:10px; flex-wrap:wrap; align-items:center; background:#0a0a0a; border:1px solid #1a1a1a; border-radius:6px; padding:12px; margin-bottom:12px;">
                <input type="hidden" name="action" value="add">
                <input type="text" name="name" placeholder="成员姓名（例如：小李）" required style="width:200px;">
                <input type="text" name="token" placeholder="专属 Token（留空自动生成）" style="width:220px;">
                <button class="btn-action">生成专属订阅链接</button>
                <span style="font-size:11px;color:#666;">新增后手机约 6 秒内自动生效；也可点右上角 ⟳ 刷新 下发强制同步</span>
              </form>
              <div style="overflow-x:auto;">
                <table>
                  <thead>
                    <tr>
                      <th>用户</th>
                      <th>订阅地址 (支持一键点击复制)</th>
                      <th>服务状态</th>
                      <th>连接状态 (5秒检测)</th>
                      <th>同步次数</th>
                      <th>最后活跃</th>
                      <th>出口 IP</th>
                      <th>管理</th>
                    </tr>
                  </thead>
                  <tbody id="userTableBody">${rows || '<tr><td colspan="8" style="padding:16px;text-align:center;color:#444;">暂无已配置用户</td></tr>'}</tbody>
                </table>
              </div>
            </div>
            </div><!-- /.grid-bottom -->

          </div>

          <!-- ======================================================== -->
          <!-- 前端动态渲染与 1 秒级轮询逻辑 -->
          <!-- ======================================================== -->
          <script>
            // 1. 真实数据库用户列表 (动态响应 /api/stats_data 轮询推送)
            let realUsers = ${realUsersJson};

            // 2. 真实节点物理源
            const rawNodes = ${nodesJson};

            // 【2026-10-04】旧矩阵已并入第一板块的 renderRelayMatrix(名字与订阅逐字一致),
            //   这里不再预渲染。

            // 真实物理网络探测函数 (发起真实 HTTPS 探测，浏览器测量完成 TCP 握手 + TLS 协商的往返耗时，杜绝任何模拟散列或随机数)
            // 【2026-10-03 删除】原 pingNodeIp 用 <img src='https://IP/favicon.ico'> 探测:
            //   ① SNI 是 IP 字面量而非 env.TUNNEL_HOST => 测的不是「连你的节点」, 方法论错误
            //      (浏览器无法指定 SNI, 这是硬限制)
            //   ② img.onerror 会被当成「完成」并立刻结算 => 握手失败被记成「很快」,
            //      导致【最差的节点显示成最快】
            //   ③ 5 个并发互相抢带宽 => 结果被压平(598/596/595/594/593 就是这么来的)
            // 现在改为展示手机端 node_probe.sh 的真实连通性探测结果。

            let isTestingSpeed = false;
            let latestRegionalPings = {};

            // ==========================================================
            // 【2026-10-04 重做】手机 → 中转节点延迟 = 55 节点蜂窝矩阵。
            //   每个节点一张卡: 名字与订阅逐字一致(rawNodes.name 原样, 改名自动同步),
            //   显示真实时延(rtt, 手机 node_probe 实测)与三档状态,
            //   刚刚被测的节点带【测速中】徽标 —— 数值一更新徽标就切到下一个。
            // ==========================================================
            function renderRelayMatrix(m) {
              try {
                var box = document.getElementById('relayMatrix');
                if (!box) return;
                var nodes = (window.latestNodeList && window.latestNodeList.length) ? window.latestNodeList : rawNodes;
                var st = {};
                // 【2026-10-04】优先用实时推送里的 nodeStatus(秒级), 否则用 60 秒轮询的
                var stList = (m && Array.isArray(m.nodeStatus) && m.nodeStatus.length)
                  ? m.nodeStatus : (window.latestNodeStatus || []);
                stList.forEach(function (x) { if (x && x.ip) st[x.ip] = x; });
                var srvNowMs = Date.now() + ((typeof window.srvTimeOffsetMs === 'number') ? window.srvTimeOffsetMs : 0);
                var nowS = srvNowMs / 1000;
                // 【2026-10-04 用户要求】测速中必须【按顺序】推进:
                //   以手机 node_probe 的当前探测索引(nodeIdx, 按 nodes.txt 顺序)为准。
                //   不能按时间戳 —— 打开大屏会触发 55 节点并发全量扫描, 完成顺序随机,
                //   按时间戳高亮会"乱跳"(用户实测反馈)。
                // 【2026-10-04 用户强制要求】"测速中"严格 = 手机上报的 nodeIdx,
                //   不做时间推算、不按时间戳兜底、不因数据变旧而清除。
                //   手机报哪个节点, 框就必定在哪个节点上, 直到它报来下一个。
                var curIdx = -1;
                if (m && typeof m.nodeIdx === 'number' && m.nodeIdx >= 0) {
                  curIdx = m.nodeIdx;
                  window.latestNodeIdx = m.nodeIdx;          // 记住最后一次已知位置
                } else if (typeof window.latestNodeIdx === 'number' && window.latestNodeIdx >= 0) {
                  curIdx = window.latestNodeIdx;             // 无新数据时保持不动(无时间限制)
                }
                if (curIdx >= nodes.length) curIdx = -1;
                // 【2026-10-04 用户要求】给每秒 ticker 存基准: 收到时的年龄 + 本地时刻。
                //   年龄 = age0 + 本地已过去秒数 —— 不依赖浏览器与手机时钟一致。
                var _ageBase = {};
                // 【2026-10-04 修"测速中跳着走"】手机每 2 秒测一个节点却每 6 秒才上报,
                //   直接用上报的 nodeIdx 会让高亮一次跳 3 格。这里记下"基准索引 + 收到时刻
                //   + 当前节奏(秒/个)", 由每秒 ticker 本地插值平滑推进。
                // 【2026-10-04】不再使用本地游标(__relayCursor): 见上方说明。
                window.__relayBadge = {};
                var html = nodes.map(function (n, idx) {
                  var x = st[n.ip] || st[n.server];
                  var name = (typeof n.name === 'string' && n.name) ? n.name : (n.fullName || (n.path + ' ' + n.ip));
                  // 【2026-10-04 核查产出】显示【实测落点】: 与路径标签不一致时标黄,
                  //   让"接入点3节点其实落接入点2"这种事实一眼可见。
                  var _colo = (x && typeof x.colo === 'string') ? x.colo : '';
                  // 【2026-10-04 用户要求】路径前缀(/kl /hk /sg /tw /jp)全部去掉:
                  //   卡片名已经是"节点所在地-<实测落点>-<序号>", 路径前缀既多余、又不代表真实出口。
                  //   副行只保留 "IP · 实测落点"。
                  var sub = n.ip
                          + (_colo ? (' · <span class="rc-colo">' + _colo + '</span>') : '');
                  var age = null, rtt = null, ok = null;
                  if (x) {
                    age = Math.max(0, Math.round(nowS - (x.at || 0)));
                    rtt = (typeof x.rtt === 'number' && x.rtt >= 10) ? x.rtt : null;
                    ok = !!x.ok;
                  }
                  var dotC, stTxt, stCls;
                  if (!x) { dotC = '#8e9099'; stTxt = '待探测'; stCls = 'na'; }
                  else if (ok === false) { dotC = '#ffb4ab'; stTxt = '不通'; stCls = 'bad'; }
                  else if (age > 1200) { dotC = '#8e9099'; stTxt = '未探测'; stCls = 'na'; }
                  else if (age > 599) { dotC = '#f0c048'; stTxt = '数据陈旧'; stCls = 'warn'; }
                  else { dotC = '#6dd58c'; stTxt = '连通'; stCls = 'ok'; }
                  var rttTxt = (rtt !== null) ? (rtt + ' ms') : '-- ms';
                  // 【2026-10-04 用户要求】年龄【一律按秒】显示(不再出现"2 分钟前"),
                  //   并且每秒本地+1 —— 见下方 ticker, 不再静默一段再跳变。
                  var ageTxt = (age === null) ? '--' : (age + ' 秒前');
                  var testing = (idx === curIdx && x && ok !== false);
                  _ageBase[idx] = (age === null) ? null : { a0: age, t0: Date.now() };
                  // 记下"非测速中"时的徽标(供高亮移走后还原)
                  window.__relayBadge[idx] = { cls: stCls, txt: stTxt };
                  return '<div class="relay-chip' + (testing ? ' testing' : '') + '" id="rc_' + idx + '">'
                       + '<div class="rc-top"><span class="node-status-dot" style="background:' + dotC + ';"></span>'
                       + '<span class="rc-name" title="' + name + '">' + name + '</span>'
                       + '<span class="rc-badge ' + stCls + '">' + (testing ? '测速中' : stTxt) + '</span></div>'
                       + '<div class="rc-sub">' + sub + '</div>'
                       + '<div class="rc-ms"><span>' + rttTxt + '</span><span class="rc-age">' + ageTxt + '</span></div>'
                       + '</div>';
                }).join('');
                box.innerHTML = html;
                window.__relayAgeBase = _ageBase;
                var pr = document.getElementById('relayProgress');
                // 【2026-10-04】隐藏对照属性: 记录"框所在下标"与"手机上报的 nodeIdx",
                //   便于严格自证(不显示给用户, 零 UI 影响)。
                if (pr) {
                  pr.setAttribute('data-testing-idx', String(curIdx));
                  pr.setAttribute('data-srv-idx', String((m && typeof m.nodeIdx === 'number') ? m.nodeIdx : -1));
                }
                if (pr) {
                  var measured = 0;
                  nodes.forEach(function (n) { var x = st[n.ip] || st[n.server]; if (x && x.at) measured++; });
                  pr.innerText = '共 ' + nodes.length + ' 个节点 · 已测 ' + measured;
                }
              } catch (e) {}
            }

            // 【2026-10-04 用户要求】节点卡年龄【每秒】刷新:
            //   原来只有收到推送时才重算, 表现为"静默一段 -> 突然跳一下"。
            //   现在每秒把每张卡的年龄 +1(本地时间差, 与手机时钟无关),
            //   并且一律用【秒】(不再出现"2 分钟前")。
            setInterval(function () {
              try {
                var base = window.__relayAgeBase;
                if (!base) return;
                var now = Date.now();
                for (var idx in base) {
                  var el = document.querySelector('#rc_' + idx + ' .rc-age');
                  if (!el) continue;
                  var b = base[idx];
                  el.innerText = b ? (b.a0 + Math.floor((now - b.t0) / 1000)) + ' 秒前' : '--';
                }
                // 【2026-10-04 用户强制要求】这里【不再做任何本地推算/插值/追赶】。
                //   原因: 手机真实节奏是"探测耗时(0.25~3 秒) + sleep", 与固定节奏不一致,
                //   任何推算都会与真实索引打架(表现为"跳回上一格")。
                //   现在"测速中"只由 renderRelayMatrix 按手机上报的 nodeIdx 严格设置,
                //   ticker 只负责刷新年龄, 不碰高亮。
              } catch (e) {}
            }, 1000);


            // ==========================================================
            // 【2026-10-04 新增②】本机 ↔ CF 边缘 时延分布直方图
            //   中位数只给一个数, 看不出"抖得厉害不厉害"。这里用服务端下发的真实历史
            //   样本(edgeRttHist, 每次实测有变化才追加一个)画 12 桶直方图, 并在标签上
            //   写 P50/P90 —— 全部来自真实样本, 不做任何拟合或平滑。
            // ==========================================================
            function renderHistogram(d) {
              var wrap = document.getElementById('histWrap');
              var axis = document.getElementById('histAxis');
              var tag = document.getElementById('histTag');
              if (!wrap) return;
              var s = (d.edgeRttHist || []).filter(function (x) { return typeof x === 'number' && x >= 10; });
              if (s.length < 3) {
                wrap.innerHTML = '<div style="color:var(--md-sys-color-outline);font-size:12px;align-self:center;">真实样本不足(' + s.length + '/3), 不画分布…</div>';
                if (axis) axis.innerHTML = '';
                if (tag) tag.innerText = '样本 ' + s.length;
                return;
              }
              var sorted = s.slice().sort(function (a, b) { return a - b; });
              var min = sorted[0], max = sorted[sorted.length - 1];
              var p50 = sorted[Math.floor((sorted.length - 1) * 0.5)];
              var p90 = sorted[Math.floor((sorted.length - 1) * 0.9)];
              var bins = 12, span = Math.max(1, max - min), w = span / bins;
              var cnt = new Array(bins);
              for (var z = 0; z < bins; z++) cnt[z] = 0;
              sorted.forEach(function (v) { var i = Math.min(bins - 1, Math.floor((v - min) / w)); cnt[i]++; });
              var top = Math.max.apply(null, cnt);
              var html = '';
              for (var i = 0; i < bins; i++) {
                var h = Math.round(cnt[i] / top * 100);
                html += '<div class="hist-bar" style="height:' + Math.max(2, h) + '%;" title="'
                     + Math.round(min + i * w) + '–' + Math.round(min + (i + 1) * w) + ' ms：' + cnt[i] + ' 个样本"></div>';
              }
              wrap.innerHTML = html;
              if (axis) axis.innerHTML = '<span>' + min + ' ms</span><span>样本 ' + s.length + ' 个</span><span>' + max + ' ms</span>';
              if (tag) tag.innerText = 'P50 ' + p50 + ' · P90 ' + p90 + ' ms';
            }


            // ==========================================================
            // 【2026-10-04 新增】流水线节点标签真值化
            //   原来这里写死 "Xray Core 在线" / "全球 330+ 节点" / "双栈 IPv4/IPv6",
            //   与同页真实状态会直接矛盾(Xray 离线时流水线还说在线)。现在全部绑定真实值。
            // ==========================================================
            function renderPipelineTags(d) {
              var tm = d.telemetry || {};
              // 【2026-10-04】机型/系统改为数据驱动(原来是写死的 "${DEVICE_NAME}" / "${SOC}")
              try {
                var devEl = document.getElementById('pipeDevice');
                if (devEl && tm.brand && tm.model && tm.brand !== 'unknown') {
                  devEl.innerText = tm.brand + ' ' + tm.model;
                }
                var socEl = document.getElementById('pipeSoc');
                if (socEl) {
                  var socTxt = [];
                  if (tm.abi && tm.abi !== 'unknown') socTxt.push(tm.abi);
                  if (tm.android && tm.android !== 'unknown') socTxt.push('Android ' + tm.android);
                  if (socTxt.length) socEl.innerText = socTxt.join(' · ');
                }
              } catch (e) {}
              var t1 = document.getElementById('pipeClientTag');
              if (t1) t1.innerText = '实测样本 ' + ((rttSamples.client || []).length) + ' 个';
              var t2 = document.getElementById('pipeColoTag');
              if (t2) {
                var colos = d.colos || {}, real = {};
                // 【2026-10-04】只接受真正的三字机房码, 并显式排除 ALI(阿里已从锚点里彻底移除;
                // 万一旧缓存里还留着 ALI, 也不能再显示出来)。
                for (var k in colos) {
                  if (/^[A-Z]{3}$/.test(colos[k]) && colos[k] !== 'ALI') real[colos[k]] = 1;
                }
                var names = Object.keys(real).sort();
                t2.innerText = names.length ? ('实测落点 ' + names.join(' / ')) : '落点未测到';
              }
              var t3 = document.getElementById('pipeXrayState');
              if (t3) {
                var xr = tm.xrayLive;
                if (xr === true) { t3.innerText = 'Xray 在线'; t3.style.color = '#a6f2bd'; t3.style.background = '#0f5223'; }
                else if (xr === false) { t3.innerText = 'Xray 离线'; t3.style.color = '#ffdad6'; t3.style.background = '#93000a'; }
                else { t3.innerText = '状态未上报'; t3.style.color = '#c4c6d0'; t3.style.background = '#282a2f'; }
              }
              var t5 = document.getElementById('livePtsTag');
              if (t5) {
                var n = 0;
                try { n = (liveChart && liveChart.data && liveChart.data.labels) ? liveChart.data.labels.length : 0; } catch (e) { n = 0; }
                t5.innerText = n + ' 个采样点';
              }
            }

            // ==========================================================
            // 【2026-10-04 新增】顶栏"接入设备 / 接入网络"真值
            //   原来写死 "${DEVICE_NAME} · ${CARRIER} 5G"。真机确实是 ${DEVICE_NAME}
            //   (getprop: brand=${DEVICE_BRAND} model=${DEVICE_MODEL} device=${DEVICE_CODENAME}), 但运营商并非 ${CARRIER}
            //   (SIM 是 CelcomDigi / Maxis), 且页面实际走 WiFi。所以改为按上报值显示,
            //   没有对应字段就显示 --, 不写死。
            // ==========================================================
            function renderHeaderFacts(d) {
              var tm = d.telemetry || {}, wifi = tm.wifi || {};
              var hd = document.getElementById('hdrDevice');
              if (hd) {
                // 【2026-10-04】优先用手机上报的真机信息(telemetry.brand/model/android),
                // 没有就显示 --, 绝不回退到写死的机型。手机侧已上报:
                // brand=${DEVICE_BRAND} model=${DEVICE_MODEL} abi=arm64-v8a android=${ANDROID_VER}
                var dv = (tm.brand && tm.model && tm.brand !== 'unknown')
                  ? (tm.brand + ' ' + tm.model) : null;
                if (dv && tm.android && tm.android !== 'unknown') dv += ' · Android ' + tm.android;
                hd.innerText = dv || '--';
              }
              var hw = document.getElementById('hdrWifi');
              if (hw) {
                var ssid = wifi.ssid || '';
                var car = tm.carrier || '';
                hw.innerText = ssid ? (ssid + (wifi.rssi ? ' (' + wifi.rssi + ' dBm)' : '')) : (car ? car : '--');
              }
            }


            // 手动刷新: 命令手机做一次全速扫描(六大地区 + 节点)
            let manualScanBusy = false;
            async function manualScan() {
              const btn = document.getElementById('btnManualScan');
              if (manualScanBusy) return;
              manualScanBusy = true;
              if (btn) { btn.disabled = true; btn.innerText = '⚡ 已下发…'; }
              try {
                const r = await fetch(window.location.origin + '/api/manual_scan?pwd=' + (env.ADMIN_PASSWORD || "CHANGE_ME"), {
                  method: 'POST', cache: 'no-store'
                });
                const j = await r.json();
                if (btn && j && j.status === 'ok') btn.innerText = '⚡ 手机扫描中…';
              } catch (e) {}
              // 手机约 6 秒收到指令, 全速扫描约 20 秒; 期间靠实时推送逐个点亮
              setTimeout(function () {
                manualScanBusy = false;
                if (btn) { btn.disabled = false; btn.innerText = '⚡ 手动刷新'; }
              }, 26000);
            }

            function runManualSpeedTest() {
              // 节点卡片的按钮: 同样先下发全速扫描指令(会连带刷新节点探测), 再重渲染
              manualScan();
              renderRelayMatrix(null);
            }

            // 【2026-10-04 修复 T8.2】这里原本在页面加载 500ms 后自动运行
            //   runManualSpeedTest() —— 等于用户每次打开/刷新大屏, 手机都被迫
            //   跑一轮 20 秒的全速扫描(耗电、与正常 60 秒调度打架)。
            //   已移除: 扫描只由用户显式点按钮触发。

            // 格式化辅助函数
            function formatBytes(bytes) {
              if (!bytes || bytes === 0) return '0.00 MB';
              const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
            }
            function formatRate(bytesPerSec) {
              if (bytesPerSec < 1024) return bytesPerSec.toFixed(0) + ' B/s';
              if (bytesPerSec < 1024 * 1024) return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
              return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MB/s';
            }
            function formatTimeAgo(ts) {
              if (!ts || ts <= 0) return '从未';
              const diff = Math.floor(Date.now() / 1000) - ts;
              if (diff < 15) return '刚刚';
              if (diff < 60) return diff + '秒前';
              if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
              if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
              return Math.floor(diff / 86400) + '天前';
            }

            // 初始化 150 Mbps 半圆仪表盘
            const gaugeCtx = document.getElementById('gaugeChart').getContext('2d');
            const gaugeChart = new Chart(gaugeCtx, {
              type: 'doughnut',
              data: {
                labels: ['已用带宽', '剩余量程'],
                datasets: [{
                  data: [0, 150],
                  backgroundColor: ['#ffffff', '#181818'],
                  borderWidth: 0,
                  circumference: 180,
                  rotation: 270
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                cutout: '80%'
              }
            });

            // 初始化 5 地区节点真实物理流量分布图 (非数量，而是真实接入的流量大小)
            const regionCtx = document.getElementById('regionChart').getContext('2d');
            const regionChart = new Chart(regionCtx, {
              type: 'doughnut',
              data: {
                labels: ['Region-1', 'Region-3', 'Region-2', 'Region-5', 'Region-4'],
                datasets: [{
                  data: [0, 0, 0, 0, 0],
                  backgroundColor: ['#ffffff', '#aaaaaa', '#777777', '#444444', '#222222'],
                  borderWidth: 0
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#888', font: { size: 10, family: 'monospace' }, boxWidth: 10 }
                  }
                },
                cutout: '68%'
              }
            });

            // 辅助生成近 30 分钟时间戳刻度 (HH:mm)
            function getMinuteLabels() {
              const labels = [];
              const now = Date.now();
              for (let i = 29; i >= 0; i--) {
                const t = new Date(now - i * 60 * 1000);
                const hh = String(t.getHours()).padStart(2, '0');
                const mm = String(t.getMinutes()).padStart(2, '0');
                labels.push(hh + ':' + mm);
              }
              return labels;
            }

            // 初始化近 15 分钟示波器 (30采样点全真波次)
            const liveCtx = document.getElementById('liveChart').getContext('2d');
            const liveChart = new Chart(liveCtx, {
              type: 'line',
              data: {
                labels: [],
                datasets: [
                  {
                    label: '下行吞吐 (Downlink)',
                    data: [],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.50)',
                    borderWidth: 1.6,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#ffffff',
                    fill: true
                  },
                  {
                    label: '上行吞吐 (Uplink)',
                    data: [],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56,189,248,0.50)',
                    borderWidth: 1.2,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#38bdf8',
                    fill: true
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 250 },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: function(ctx) { return ctx.dataset.label + ': ' + Number(ctx.parsed.y).toFixed(2) + ' Mbps'; }
                    }
                  }
                },
                scales: {
                  x: {
                    display: true,
                    grid: { color: '#141414' },
                    ticks: {
                      color: '#555',
                      font: { size: 9, family: 'monospace' },
                      maxTicksLimit: 10
                    }
                  },
                  y: {
                    grid: { color: '#141414' },
                    ticks: { color: '#555', font: { size: 9, family: 'monospace' }, callback: v => v + ' M' },
                    beginAtZero: true
                  }
                }
              }
            });

            // 真实用户排行榜渲染逻辑 (从始至终累计绝对流量，绝对单调不归零)
            let liveUserTraffics = {};

            function renderRankList() {
              const listEl = document.getElementById('rankList');
              if (!listEl) return;
              if (realUsers.length === 0) {
                listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#444;">暂无已配置用户，请在下方添加</div>';
                return;
              }

              const nowSec = Math.floor(Date.now() / 1000);
              const userStats = realUsers.map(function(u) {
                const stat = liveUserTraffics[u.token] || { total: 0, up: 0, down: 0, online: 0, rateDown: 0, rateUp: 0, lastActive: 0 };
                return {
                  name: u.name,
                  token: u.token,
                  enabled: u.enabled,
                  total: stat.total || 0,
                  up: stat.up || 0,
                  down: stat.down || 0,
                  online: relay-node.invalid || 0,
                  rateDown: stat.rateDown || 0,
                  rateUp: stat.rateUp || 0,
                  lastActive: stat.lastActive || 0
                };
              });

              // 按从始至终累计总流量严格降序排列
              userStats.sort(function(a, b) { return b.total - a.total; });
              const maxVal = userStats[0] ? userStats[0].total : 0;
              const grandTotal = userStats.reduce(function(sum, u) { return sum + u.total; }, 0);

              const medals = ['🥇', '🥈', '🥉'];
              listEl.innerHTML = userStats.map(function(u, i) {
                const pct = maxVal > 0 ? Math.min(100, Math.round((u.total / maxVal) * 100)) : 0;
                const grandPct = grandTotal > 0 ? ((u.total / grandTotal) * 100).toFixed(1) : '0.0';
                const rankBadge = i < 3 ? medals[i] : ('<span style="font-family:monospace;color:#666;font-size:10px;">#' + (i + 1) + '</span>');

                let liveConnBadge = '';
                const isOnline = (u.online || 0) > 0;
                const liveRate = (u.rateDown || 0) + (u.rateUp || 0);
                const activeDiff = (u.lastActive && u.lastActive > 0) ? (nowSec - u.lastActive) : 9999999;
                if (!u.enabled) {
                  liveConnBadge = '<span style="font-size:9px;color:#ef4444;background:#1f0505;border:1px solid #7f1d1d;padding:1px 4px;border-radius:3px;">已停用</span>';
                } else if (isOnline && liveRate > 1024) {
                  liveConnBadge = '<span style="font-size:9px;color:#22c55e;background:#052e16;border:1px solid #166534;padding:1px 4px;border-radius:3px;">🟢 ' + u.online + '会话 · ⚡ ' + formatRate(liveRate) + '</span>';
                } else if (isOnline) {
                  liveConnBadge = '<span style="font-size:9px;color:#22c55e;background:#052e16;border:1px solid #166534;padding:1px 4px;border-radius:3px;">🟢 ' + u.online + '会话</span>';
                } else if (activeDiff < 300) {
                  liveConnBadge = '<span style="font-size:9px;color:#eab308;background:#2e1f05;border:1px solid #854d0e;padding:1px 4px;border-radius:3px;">🟡 待机(' + formatTimeAgo(u.lastActive) + ')</span>';
                } else if (u.total > 0) {
                  liveConnBadge = '<span style="font-size:9px;color:#94a3b8;background:#141414;border:1px solid #262626;padding:1px 4px;border-radius:3px;">⚪ 离线</span>';
                } else {
                  liveConnBadge = '<span style="font-size:9px;color:#ef4444;background:#1f0505;border:1px solid #7f1d1d;padding:1px 4px;border-radius:3px;">🔴 未连接</span>';
                }
                
                return '<div class="rank-item" style="padding:8px 10px;border-bottom:1px solid #141414;display:flex;flex-direction:column;gap:4px;">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                      '<span style="font-size:12px;width:18px;text-align:center;">' + rankBadge + '</span>' +
                      '<b style="color:#fff;font-size:12px;">' + u.name + '</b>' +
                      liveConnBadge +
                    '</div>' +
                    '<div style="text-align:right;">' +
                      '<span style="font-family:monospace;color:#fff;font-weight:700;font-size:12px;">' + formatBytes(u.total) + '</span>' +
                      '<span style="font-size:9px;color:#888;font-family:monospace;margin-left:4px;">(' + grandPct + '%)</span>' +
                    '</div>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#666;font-family:monospace;">' +
                    '<span>下行: <b style="color:#bbb;">' + formatBytes(u.down) + '</b> · 上行: <b style="color:#bbb;">' + formatBytes(u.up) + '</b></span>' +
                    '<div style="width:100px;background:#1a1a1a;height:4px;border-radius:2px;overflow:hidden;margin-left:8px;">' +
                      '<div style="width:' + pct + '%;background:#3b82f6;height:100%;border-radius:2px;"></div>' +
                    '</div>' +
                  '</div>' +
                '</div>';
              }).join('');
            }

            // 域名/网站访问统计渲染逻辑
            let liveUserDomains = {};

            function populateDomainUserSelect() {
              const sel = document.getElementById('domainUserSelect');
              if (!sel) return;
              const currentVal = sel.value;
              sel.innerHTML = '<option value="ALL">🌐 全网成员汇总</option>' + realUsers.map(function(u) {
                return '<option value="' + u.token + '">' + u.name + '</option>';
              }).join('');
              if (currentVal) sel.value = currentVal;
            }

            function renderDomainStats() {
              const el = document.getElementById('domainRankList');
              const sel = document.getElementById('domainUserSelect');
              if (!el) return;
              const selectedToken = sel ? sel.value : 'ALL';

              let mergedDomains = {};
              if (selectedToken === 'ALL') {
                for (const t in liveUserDomains) {
                  const doms = liveUserDomains[t] || {};
                  for (const d in doms) {
                    mergedDomains[d] = (mergedDomains[d] || 0) + doms[d];
                  }
                }
              } else {
                mergedDomains = liveUserDomains[selectedToken] || {};
              }

              const domainList = Object.keys(mergedDomains).map(function(d) {
                return { domain: d, count: mergedDomains[d] };
              }).sort(function(a, b) { return b.count - a.count; });

              if (domainList.length === 0) {
                el.innerHTML = '<div style="padding:16px;color:#555;font-size:11px;">暂无该用户的访问域名记录</div>';
                return;
              }

              const maxCount = domainList[0].count;
              el.innerHTML = domainList.slice(0, 12).map(function(item, idx) {
                const pct = maxCount > 0 ? Math.min(100, Math.round((item.count / maxCount) * 100)) : 0;
                return '<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:4px;padding:6px 10px;display:flex;flex-direction:column;justify-content:center;">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                    '<span style="font-family:monospace;color:#fff;font-weight:600;font-size:11px;">' + (idx + 1) + '. ' + item.domain + '</span>' +
                    '<span style="font-family:monospace;color:#22c55e;font-size:11px;font-weight:700;">' + item.count + ' 次</span>' +
                  '</div>' +
                  '<div style="width:100%;height:4px;background:#181818;border-radius:2px;overflow:hidden;">' +
                    '<div style="height:100%;background:#fff;width:' + pct + '%;"></div>' +
                  '</div>' +
                '</div>';
              }).join('');
            }
            // ==========================================================
            // 【2026-10-04 修复】新用户"从未连接"的根因: userTraffics 是 12 小时重载荷,
            //   新接入的用户不在里面 -> 前端误显示"🔴 从未连接 (0 B)"。
            //   现在每次收到数据时从 xray 原始计数(stat)提取 per-user 字节,
            //   与上一轮对比: 字节在增长 = 真的在线, 不依赖重载荷。
            // ==========================================================
            function updateStatUserBytes(list) {
              if (!Array.isArray(list)) return;
              var bytes = {};
              list.forEach(function (it) {
                var m = /^user>>>user_(.+)>>>traffic>>>(uplink|downlink)$/.exec(it.name || '');
                if (m) bytes[m[1]] = (bytes[m[1]] || 0) + (Number(it.value) || 0);
              });
              window.__statUserPrev = window.__statUserBytes || {};
              window.__statUserBytes = bytes;
              window.__statUserAt = Date.now();
            }

            // 动态用户表格实时渲染函数 (A3 实时推送无感同步 · B1 待绑定高亮)
            function renderUserTable(users) {
              const tbody = document.getElementById('userTableBody');
              if (!tbody || !Array.isArray(users)) return;
              if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="padding:16px;text-align:center;color:#444;">暂无已配置用户</td></tr>';
                return;
              }
              const nowSec = Math.floor(Date.now() / 1000);
              tbody.innerHTML = users.map(u => {
                const isRecovered = Boolean(u.isAutoRecovered || (u.name && u.name.indexOf('恢复用户_') !== -1));
                const nameDisplay = isRecovered
                  ? '<span style="color:#eab308;font-weight:700;">⚠ ' + u.name + '</span>'
                  : u.name;
                const statusDisplay = isRecovered
                  ? '<span style="color:#eab308;font-size:11px;font-weight:600;">⚠ 待绑定UUID</span>'
                  : (u.enabled
                      ? '<span style="color:#22c55e;font-size:12px;font-weight:600;">● 运行中</span>'
                      : '<span style="color:#ef4444;font-size:12px;font-weight:600;">● 已停用</span>');

                // 【2026-10-04 兜底】优先用 userTraffics(重载荷), 缺失时看 stat 实时字节:
                //   最近 2 分钟内字节有增长 => 判定在线; 字节 > 0 => 判定"曾连接"。
                const _sb = window.__statUserBytes || {};
                const _sp = window.__statUserPrev || {};
                const _sa = window.__statUserAt || 0;
                const _statBytes = _sb[u.token] || 0;
                const _statPrev = _sp[u.token] || 0;
                const _statGrowing = (_sa > 0 && (Date.now() - _sa) < 120000 && _statBytes > _statPrev);
                const _statHas = _statBytes > 0;
                const isOnline = (u.online || 0) > 0 || _statGrowing;
                const rate = (u.rateDown || 0) + (u.rateUp || 0);
                const lastActive = (u.lastActive || 0) || (_statHas ? Math.floor(_sa / 1000) : 0);
                const activeDiff = (lastActive > 0) ? (nowSec - lastActive) : 9999999;
                const hasTraffic = (u.totalTraffic || 0) > 0 || _statHas;

                let connBadge = '';
                if (isOnline && rate > 1024) {
                  // 【2026-10-04】不再写"会话数"(服务端给的是严格在线判定 0/1, 写"N会话"是编造);
                  //   速率只给合计, 不做上/下行拆分。
                  connBadge = '<div style="display:flex;flex-direction:column;gap:2px;">' +
                    '<span style="color:#22c55e;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">' +
                      '🟢 在线传输中' +
                    '</span>' +
                    '<span style="font-size:10px;color:#38bdf8;font-family:monospace;">⚡ ' + formatRate(rate) + '</span>' +
                  '</div>';
                } else if (isOnline) {
                  connBadge = '<div style="display:flex;flex-direction:column;gap:2px;">' +
                    '<span style="color:#22c55e;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">' +
                      '🟢 在线待命' +
                    '</span>' +
                    '<span style="font-size:10px;color:#666;font-family:monospace;">⚡ 0 B/s 心跳保持</span>' +
                  '</div>';
                } else if (activeDiff < 300) {
                  connBadge = '<span style="color:#eab308;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">' +
                    '🟡 待机挂起 (' + formatTimeAgo(lastActive) + '活跃)' +
                  '</span>';
                } else if (hasTraffic) {
                  connBadge = '<span style="color:#94a3b8;font-size:11px;display:inline-flex;align-items:center;gap:4px;">' +
                    '⚪ 离线断开 (' + (lastActive > 0 ? formatTimeAgo(lastActive) : '曾使用') + ')' +
                  '</span>';
                } else {
                  connBadge = '<span style="color:#ef4444;font-size:11px;display:inline-flex;align-items:center;gap:4px;">' +
                    '🔴 从未连接 (0 B)' +
                  '</span>';
                }

                const clashUrl = window.location.origin + '/sub?token=' + u.token + '&type=clash';
                const v2rayUrl = window.location.origin + '/sub?token=' + u.token + '&type=v2ray';

                return '<tr style="border-bottom:1px solid #141414;">' +
                  '<td style="padding:10px 12px;font-weight:600;">' + nameDisplay + '</td>' +
                  '<td style="padding:10px 12px;">' +
                    '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
                      '<span style="font-size:10px;color:#777;width:35px;">Clash</span>' +
                      '<input value="' + clashUrl + '" readonly style="width:230px;padding:3px 6px;font-size:11px;background:#050505;color:#ddd;border:1px solid #222;border-radius:3px;" onclick="this.select()">' +
                    '</div>' +
                    '<div style="display:flex;gap:6px;align-items:center;">' +
                      '<span style="font-size:10px;color:#777;width:35px;">V2Ray</span>' +
                      '<input value="' + v2rayUrl + '" readonly style="width:230px;padding:3px 6px;font-size:11px;background:#050505;color:#ddd;border:1px solid #222;border-radius:3px;" onclick="this.select()">' +
                    '</div>' +
                  '</td>' +
                  '<td style="padding:10px 12px;">' + statusDisplay + '</td>' +
                  '<td style="padding:10px 12px;">' + connBadge + '</td>' +
                  '<td style="padding:10px 12px;color:#888;font-size:12px;">' + (u.pullCount || 0) + '</td>' +
                  // 【2026-10-04 T1.5(B)】种子里的假"刚刚"不显示, 无真实记录时显示 --
                  // 【2026-10-04】与连接状态同源: 真实活跃时刻(不再用"最后拉订阅时间")
                  '<td style="padding:10px 12px;font-size:11px;color:#777;">' +
                    (lastActive > 0 ? formatTimeAgo(lastActive) : '--') + '</td>' +
                  '<td style="padding:10px 12px;font-size:11px;color:#777;">' + ((u.lastIp && u.lastIp !== '-') ? u.lastIp : '--') + '</td>' +
                  '<td style="padding:10px 12px;">' +
                    '<form method="POST" style="display:inline;">' +
                      '<input type="hidden" name="token" value="' + u.token + '">' +
                      '<input type="hidden" name="action" value="toggle">' +
                      '<button style="padding:4px 8px;background:#141414;color:#ccc;border:1px solid #282828;border-radius:3px;cursor:pointer;font-size:11px;">' + (u.enabled ? '停用' : '启用') + '</button>' +
                    '</form>' +
                    '<form method="POST" style="display:inline;margin-left:4px;">' +
                      '<input type="hidden" name="token" value="' + u.token + '">' +
                      '<input type="hidden" name="action" value="delete">' +
                      '<button style="padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:11px;">删除</button>' +
                    '</form>' +
                  '</td>' +
                '</tr>';
              }).join('');
            }

            // 5 秒级实时轮询核心循环 (D3 优化 · 节约移动端资源与配额)
            let lastDown = 0, lastUp = 0, lastTs = 0;

            // ==========================================================
            // 手机主库同步（手动刷新）
            //   点击 -> POST /api/phone_sync 下发指令（全项目唯一按点击写 KV 的地方）
            //   -> 手机约 6 秒内重新拉取并回报确认 -> 这里每 2 秒轮询直到确认
            // ==========================================================
            let phoneSyncTimer = null;
            let phoneSyncRequestId = null;
            let phoneSyncDeadline = 0;
            let phoneSyncIgnored = null;   // 已被手机取走、正在处理中的指令

            function renderPhoneBadge(master, pending) {
              const el = document.getElementById('phoneSyncBadge');
              if (!el) return;
              const now = Date.now();
              if (pending && pending.id) {
                const secs = Math.max(0, Math.round((now - pending.at) / 1000));
                el.style.color = '#eab308';
                el.innerText = '手机主库：已下发指令 · 等待手机取走（' + secs + ' 秒前）…';
                return;
              }
              if (phoneSyncRequestId) {
                const secs = Math.round((now - phoneSyncDeadline + 30000) / 1000);
                el.style.color = '#eab308';
                el.innerText = '手机主库：正在重新拉取并确认…（' + secs + ' 秒）';
                return;
              }
              if (!master || !master.version) {
                el.style.color = '#666';
                el.innerText = '手机主库：等待手机上报…';
                return;
              }
              // 【2026-10-03 修复】原来这里用 master.reportedAt 算时间, 而 reportedAt 是
              // 手机每 6 秒一次的【遥测上报】时刻 => 必然显示"刚刚", 让人误以为
              // 用户库也是秒级同步的。现在改为显示用户库版本【真正变化】的时刻。
              const chgAt = master.storeChangedAt || 0;
              const chgAgo = chgAt ? Math.round((now - chgAt) / 1000) : null;
              let chgTxt;
              if (chgAgo === null) chgTxt = '本次部署后无变更';
              else if (chgAgo < 60) chgTxt = '刚刚';
              else if (chgAgo < 3600) chgTxt = Math.round(chgAgo / 60) + ' 分钟前';
              else if (chgAgo < 86400) chgTxt = (chgAgo / 3600).toFixed(1) + ' 小时前';
              else chgTxt = Math.round(chgAgo / 86400) + ' 天前';
              if (master.inSync === false) {
                el.style.color = '#eab308';
                el.innerText = '手机主库：待同步 · 用户库最后变更 ' + chgTxt;
              } else {
                el.style.color = '#22c55e';
                const ackTxt = master.ackedAt ? (' · ⟳确认于 ' + new Date(master.ackedAt).toLocaleTimeString('zh-CN')) : '';
                el.innerText = '手机主库：已同步 ✓ ' + master.version + ' · 用户库最后变更 ' + chgTxt + ackTxt;
              }
            }

            function toggleAddUserForm() {
              const f = document.getElementById('addUserForm');
              const b = document.getElementById('btnToggleAdd');
              if (!f) return;
              const show = (f.style.display === 'none' || !f.style.display);
              f.style.display = show ? 'flex' : 'none';
              if (b) b.innerText = show ? '✕ 收起' : '＋ 添加成员';
            }

            async function requestPhoneSync() {
              const btn = document.getElementById('btnPhoneSync');
              const badge = document.getElementById('phoneSyncBadge');
              if (btn) { btn.disabled = true; btn.innerText = '⟳ 下发中…'; }
              try {
                const r = await fetch(window.location.origin + '/api/phone_sync?pwd=' + (env.ADMIN_PASSWORD || "CHANGE_ME"), {
                  method: 'POST', cache: 'no-store'
                });
                const j = await r.json();
                if (j && j.requestId) {
                  phoneSyncRequestId = j.requestId;
                  phoneSyncDeadline = Date.now() + 30000;
                  if (badge) { badge.style.color = '#eab308'; badge.innerText = '手机主库：已下发同步指令，等待手机响应…'; }
                  await fetchMetrics();
                  if (phoneSyncTimer) clearInterval(phoneSyncTimer);
                  phoneSyncTimer = setInterval(async function () {
                    await fetchMetrics();
                    if (!phoneSyncRequestId) { clearInterval(phoneSyncTimer); phoneSyncTimer = null; return; }
                    if (Date.now() > phoneSyncDeadline) {
                      clearInterval(phoneSyncTimer); phoneSyncTimer = null;
                      phoneSyncRequestId = null;
                      if (badge) { badge.style.color = '#eab308'; badge.innerText = '手机主库：等待确认超时，可再点一次刷新'; }
                    }
                  }, 2000);
                } else {
                  if (badge) { badge.style.color = '#ef4444'; badge.innerText = '手机主库：指令下发失败'; }
                }
              } catch (e) {
                if (badge) { badge.style.color = '#ef4444'; badge.innerText = '手机主库：指令下发异常'; }
              } finally {
                if (btn) { btn.disabled = false; btn.innerText = '⟳ 刷新'; }
              }
            }

            window.__pageBuild = '${BUILD_ID}';

            // ==========================================================
            // A2 · 秒级实时推送 (Server-Sent Events)
            //   只保持 1 个长连接, 服务端每秒推一次; 连接到期自动重连。
            //   相比"每秒轮询"(86400 次/天), 这是几乎零配额的方案。
            //   注意: 底层数据仍是手机每约 6 秒上报一次 —— 推送是真实的,
            //         不插值、不造数; 面板上的"数据延迟"就是它的真实年龄。
            // ==========================================================
            // ==========================================================
            // 自动更新: 页面版本与服务器不一致就重载。
            // 【关键】必须覆盖"页面里根本没有 __pageBuild"这种旧页面 ——
            // 之前写成 if (m.buildId && window.__pageBuild && ...),
            // 旧页面里 __pageBuild 是 undefined, 条件恒假, 自动重载从不触发。
            // 用 sessionStorage 记录已尝试过的版本, 防止重载后仍是旧页面而死循环。
            // ==========================================================
            // ============================================================
            // 【2026-10-04 诊断】页面级错误捕获: 任何未捕获异常(含异步 Promise 拒绝)
            //   都写进隐藏元素 #renderErrProbe。headless dump 即可看到确切错误与行号。
            //   加它的原因: 健康卡片/评分/新鲜度一直是 "--", 但各渲染器自身无异常
            //   => 说明是它们【上游】(fetchMetrics 轮询路径) 挂了。
            // ============================================================
            (function () {
              function _probe(msg) {
                try {
                  var p = document.getElementById('renderErrProbe');
                  if (!p) {
                    p = document.createElement('div');
                    p.id = 'renderErrProbe';
                    p.style.display = 'none';
                    document.body.appendChild(p);
                  }
                  p.innerText = (p.innerText ? p.innerText + ' || ' : '') + msg;
                } catch (e) {}
              }
              window.addEventListener('error', function (e) {
                _probe('ERR:' + (e.message || '?') + '@L' + (e.lineno || '?'));
              });
              window.addEventListener('unhandledrejection', function (e) {
                var r = e && e.reason;
                _probe('REJ:' + ((r && (r.message || r)) || '?'));
              });
              window.__probeError = _probe;
            })();

            function checkPageBuild(buildId) {
              if (!buildId) return false;
              if (buildId === window.__pageBuild) return false;
              let tried = '';
              try { tried = sessionStorage.getItem('__buildTried') || ''; } catch (e) {}
              if (tried === buildId) return false;   // 这个版本已经重载过了, 不再重试
              try { sessionStorage.setItem('__buildTried', buildId); } catch (e) {}
              const tag = document.getElementById('headerBuild');
              if (tag) { tag.style.color = '#eab308'; tag.innerText = '检测到新版本, 正在自动刷新…'; }
              setTimeout(function () { location.reload(); }, 400);
              return true;
            }

            function applyLiveSnapshot(m) {
              if (!m) return;
              checkPageBuild(m.buildId);   // 【2026-10-04 修复】不再跳过本次渲染
              // 自动更新已由上面的 checkPageBuild 统一处理
              if (typeof m.conns === 'number') {
                var cc = document.getElementById('connCount');
                if (cc) cc.innerText = m.conns;
                var wb = document.getElementById('waterLevelBar');
                if (wb) {
                  var pct = Math.min(100, Math.round((m.conns / 500) * 100));
                  wb.style.height = (m.conns > 0 ? Math.max(3, pct) : 0) + '%';
                  wb.style.background = m.conns >= 500 ? '#ef4444' : (m.conns >= 300 ? '#eab308' : '#38bdf8');
                }
              }
              if (typeof m.up === 'number' && m.up !== null) {
                var gv = document.getElementById('gaugeVal');
                if (gv) gv.innerText = Number(m.up).toFixed(2) + ' Mbps';
                try {
                  var v = Math.min(150, Number(m.up));
                  gaugeChart.data.datasets[0].data = [v, Math.max(0, 150 - v)];
                  gaugeChart.update('none');
                } catch (e) {}
              }
              // 【2026-10-03 关键修复】这里必须同时刷新 6 个区域的延迟数字与抖动。
              // 上一轮只让"年龄"走了实时推送, 而更新数字的 setGw 仍只在 60 秒轮询里调用,
              // 结果年龄每 6 秒在动、数字每 60 秒才动一次, 看起来就是"延迟不变了"。
              if (m.pings) {
                window.latestPingsLive = m.pings;
                // 【2026-10-04 用户要求】锚点卡片整行已删除, 原来这里的"蓝框跟随"
                //   高亮推进与 setGw 写卡片的代码随之删除; pings/jitters 仍用于
                //   链路质量评分与节点矩阵。
                window.latestPingsLive = m.pings;
                renderRelayMatrix(m);
                if (m.stat) updateStatUserBytes(m.stat);
              }
              window.liveLastAt = Date.now();
              window.liveAgeS = (typeof m.ageS === 'number') ? m.ageS : window.liveAgeS;
              updateLiveTag();
            }

            // 遥测推送状态 + 页面版本, 统一显示在【顶部标题栏】(时钟右侧)。
            // 【2026-10-03】原来这个标签挂在「用户管理」卡片上, 会让人误以为
            // 用户列表也是秒级同步 —— 实际用户库是变更触发 / 12 小时一次。
            // 遥测与用户库是两条独立的链路, 状态也必须分开显示。
            function updateLiveTag() {
              const hb = document.getElementById('headerBuild');
              if (!hb) return;
              const ver = window.__pageBuild || '旧版';
              const hasPush = (typeof window.liveLastAt === 'number');
              const ago = hasPush ? Math.round((Date.now() - window.liveLastAt) / 1000) : -1;
              const isLive = hasPush && ago < 15;
              if (isLive) {
                const ageTxt = (typeof window.liveAgeS === 'number') ? ('数据 ' + window.liveAgeS + ' 秒前') : '';
                hb.innerText = '⚡ 遥测推送 ' + (ago <= 1 ? '刚刚' : ago + ' 秒前')
                  + (ageTxt ? ' · ' + ageTxt : '') + ' · 版本 ' + ver;
                hb.style.color = '#38bdf8';
              } else {
                hb.innerText = '⚠ 遥测推送中断' + (hasPush ? ' ' + ago + ' 秒' : '') + ' · 版本 ' + ver;
                hb.style.color = '#ef4444';
              }
            }
            setInterval(updateLiveTag, 1000);

            // ==========================================================
            // 断线告警: 手机超过阈值未上报时在页面顶部弹出醒目横幅
            //   90 秒 -> 黄色(数据延迟偏高)
            //   300 秒 -> 红色(服务中断)
            // 数据来源: 实时推送带回来的 ageS + 距上次推送的本地耗时,
            //           因此精度是秒级的, 不依赖整页 60 秒轮询。
            // ==========================================================
            function checkOffline() {
              const banner = document.getElementById('offlineBanner');
              if (!banner) return;
              let ageS = null;
              if (typeof window.liveAgeS === 'number' && typeof window.liveLastAt === 'number') {
                ageS = window.liveAgeS + (Date.now() - window.liveLastAt) / 1000;
              } else if (typeof window.lastFetchAgeS === 'number' && typeof window.lastFetchAt === 'number') {
                // 实时推送未连通时的兜底: 用整页轮询的数据年龄
                ageS = window.lastFetchAgeS + (Date.now() - window.lastFetchAt) / 1000;
              }
              if (ageS === null || isNaN(ageS)) return;
              ageS = Math.max(0, Math.round(ageS));
              window.currentPhoneAgeS = ageS;
              if (ageS >= 1800) {
                const mm = Math.floor(ageS / 60), ss = ageS % 60;
                banner.style.display = 'block';
                banner.style.background = 'linear-gradient(90deg,#7f1d1d,#450a0a)';
                banner.style.color = '#fecaca';
                banner.innerHTML = '🔴 服务中断 · 手机已 <b style="color:#fff;">' + mm + ' 分 ' + ss + ' 秒</b> 未上报数据'
                  + '<div style="font-weight:400;color:#fca5a5;margin-top:5px;font-size:12px;">'
                  + '正常应约 6 秒上报一次。请检查：① 手机是否在线/有网 ② 手机是否重启过'
                  + '（重启后看门狗不会自启，需手动运行 <code style="background:#000;padding:1px 5px;border-radius:3px;">sh /data/local/tmp/run_daemon.sh</code>）'
                  + ' ③ Xray 与 cloudflared 是否在运行</div>';
              } else if (ageS >= 600) {
                banner.style.display = 'block';
                banner.style.background = 'linear-gradient(90deg,#78350f,#451a03)';
                banner.style.color = '#fde68a';
                banner.innerHTML = '🟡 数据已超过 10 分钟未更新 · 手机已 <b style="color:#fff;">' + ageS + ' 秒</b> 未上报'
                  + '<span style="font-weight:400;color:#fcd34d;">（正常约 6 秒一次，可能是手机网络短暂波动）</span>';
              } else {
                banner.style.display = 'none';
              }
            }
            setInterval(checkOffline, 1000);


            // 长轮询: 服务端一有新数据立刻返回, 收到后马上再挂起。
            // 相比 EventSource, 不需要任何兼容性 flag, 对线上零风险。
            let liveOn = false;
            let liveTimer = null;
            let liveStamp = '';
            // 【2026-10-04 修复 T8.3】失败重试从固定 200ms 改为指数退避:
            //   1s → 2s → 4s → ... 封顶 30s, 成功即复位。
            //   原实现固定 200ms 重试, 手机断网/Worker 500 时单标签页可达
            //   43 万请求/天, 会打爆 Workers 免费请求额度。
            let liveRetryDelay = 1000;
            const LIVE_RETRY_MAX = 30000;

            async function liveLoop() {
              if (!liveOn) return;
              try {
                const r = await fetch(window.location.origin + '/api/live?pwd=' + (env.ADMIN_PASSWORD || "CHANGE_ME")
                    + '&since=' + encodeURIComponent(liveStamp), { cache: 'no-store' });
                if (r.ok) {
                  const m = await r.json();
                  if (m && m.stamp) { liveStamp = m.stamp; applyLiveSnapshot(m); }
                  liveRetryDelay = 1000;   // 成功复位
                } else {
                  liveRetryDelay = Math.min(LIVE_RETRY_MAX, liveRetryDelay * 2);
                }
              } catch (e) {
                liveRetryDelay = Math.min(LIVE_RETRY_MAX, liveRetryDelay * 2);
              }
              if (liveOn) liveTimer = setTimeout(liveLoop, liveRetryDelay);
            }
            function startLiveStream() {
              if (liveOn) return;
              liveOn = true;
              liveLoop();
            }
            function stopLiveStream() {
              liveOn = false;
              if (liveTimer) { clearTimeout(liveTimer); liveTimer = null; }
            }

            async function fetchMetrics() {
              if (window.__probeError) window.__probeError('FM-START');
              const fetchStart = performance.now();
              await probeClientRtt();   // 真实测量 客户端↔CF边缘 RTT (15 秒节流)
              try {
                const res = await fetch(window.location.origin + '/api/stats_data?pwd=` + (env.ADMIN_PASSWORD || "CHANGE_ME") + `&_t=' + Date.now() + (phoneSyncRequestId ? '&sync=1' : ''), {
                  cache: 'no-store'
                });
                const fetchElapsed = Math.max(1, Math.round(performance.now() - fetchStart));
                if (res.ok) {
                  const d = await res.json();
                  lastSuccessTimestamp = Date.now();
                  noteDataAge(d.serverTime, d.timestamp);   // 记录真实数据年龄
                  updateFreshnessTicker();
                  // 【顺序修复 · 2026-10-03】必须先清除等待状态, 再渲染。
                  // 原来顺序反了: 先渲染(此时 phoneSyncRequestId 还没清, 徽标仍显示
                  // "正在重新拉取并确认…"), 然后才清除它并【停掉 2 秒轮询定时器】
                  // => 之后再也���有渲染机会, 只能等下一次 60 秒整页轮询 =>
                  // 徽标卡住最长 60 秒, 而手动刷新网页会立刻显示正确状态。
                  if (phoneSyncRequestId && d.phoneMaster && d.phoneMaster.ackedId === phoneSyncRequestId) {
                    phoneSyncRequestId = null;
                    if (phoneSyncTimer) { clearInterval(phoneSyncTimer); phoneSyncTimer = null; }
                  }
                  renderPhoneBadge(d.phoneMaster, d.syncRequest);
                  // 捕获手机端节点探测结果(供节点矩阵卡片渲染真实状态)
                  window.latestNodeStatus = d.nodeStatus || window.latestNodeStatus || [];
                  if (d.stat) updateStatUserBytes(d.stat);
                  if (typeof d.nodeIdx === 'number') window.latestNodeIdx = d.nodeIdx;
                  if (typeof d.nodeFast === 'number') window.latestNodeFast = d.nodeFast;
                  // 【时钟校正】手机上报的时刻是"手机时钟", 浏览器算年龄用的是"浏览器时钟"。
                  // 两个设备时钟只要有偏差, 年龄就会整体偏掉。这里记录
                  // (服务端时间 - 浏览器时间) 的偏移, 算年龄时补回去。
                  if (d.serverTime) {
                    window.srvTimeOffsetMs = d.serverTime - Date.now();
                    window.srvTimeOffsetAt = Date.now();
                  }
                  window.latestNodeList = d.nodeList || window.latestNodeList || [];
                  renderRelayMatrix(null);

                  // ==========================================================
                  // 全链路遥测 · 三段真实单次 RTT (2026-10-04 算法修复 · 方案 A+C)
                  // ----------------------------------------------------------
                  // 第 1 段 浏览器↔CF边缘 : /api/rtt 真实往返, 取滚动中位数(抗单次抖动)
                  // 第 2 段 CF边缘处理耗时 : 服务端实测 d.serverMs —— 【非网络时延, 不参与求和】
                  // 第 3 段 手机↔CF边缘   : 手机实测 TCP time_connect (1×RTT, 与第 1 段同口径)
                  // 第 4 段 手机↔公网出口 : 手机实测 TCP time_connect (1×RTT)
                  // ----------------------------------------------------------
                  // 【为什么这样改】旧实现把上面 4 个数字直接相加, 于是总和在 200~900ms 乱跳:
                  //   · serverMs(25~165ms, 冷读 KV 可达 400ms) 是 Worker 自己跑代码的耗时,
                  //     量纲根本不是网络时延, 却占了旧总和的最高 60%+ —— 这是抖动主因;
                  //   · 手机侧旧值用 time_appconnect(≈2×RTT), 浏览器侧是 1×RTT, 口径不同却相加;
                  //   · 四段来自三个设备、三个时刻, 物理上不存在"一条端到端路径之和"。
                  // 现在: 总和 = 第1段中位 + 第3段中位 + 第4段中位(三段同口径 1×RTT)。
                  // 样本不足 3 个时如实显示 "--", 绝不编造。
                  // ==========================================================
                  pushSample(rttSamples.server, (typeof d.serverMs === 'number' ? d.serverMs : null), 10);

                  // 【RTT 提速 2026-10-04 · 方案 C】第 3/4 段优先采用服务端下发的
                  // 【真实测量历史】: 手机每 15 秒测一次并在服务端按"数值变化"去重累积,
                  // 因此首次轮询就能拿到最多 10 个各自独立的真实测量 ——
                  // 预热从"约 2 分钟"降到 0 秒。服务端没有历史时(旧 Worker / 冷启动)
                  // 退回"每轮累积当前值"的老办法, 行为不变。
                  const _numList = function (arr) {
                    return Array.isArray(arr)
                      ? arr.filter(function (v) { return typeof v === 'number' && isFinite(v) && v > 0; })
                      : [];
                  };
                  const edgeHistSrv = _numList(d.edgeRttHist);
                  if (edgeHistSrv.length) {
                    rttSamples.edge = edgeHistSrv.slice(-10);
                  } else {
                    pushSample(rttSamples.edge, (typeof d.edgeRtt === 'number' ? d.edgeRtt : null), 10);
                  }
                  const egressHistSrv = _numList(d.egressHist);
                  if (egressHistSrv.length) {
                    rttSamples.egress = egressHistSrv.slice(-10);
                  } else if (d.pings && typeof d.pings.egress === 'number') {
                    pushSample(rttSamples.egress, d.pings.egress, 10);
                  }

                  const MIN_SAMPLES = RTT_MIN_SAMPLES;   // 少于 3 个样本不称"中位"
                  // 【统一口径 2026-10-04 用户决策】所有时延链路一律:
                  //   丢弃 <10ms 的样本(无效数据) -> 取【最低 3 个有效样本的中位数】
                  //   (升序排序后第 2 个) -> 有效样本不足 3 个返回 null, 界面如实显示 --。
                  const RTT_INVALID_BELOW_MS = 10;
                  const lowest3Median = function (arr) {
                    const v = (arr || []).filter(function (x) {
                      return typeof x === 'number' && x >= RTT_INVALID_BELOW_MS;
                    }).sort(function (a, b) { return a - b; });
                    return v.length >= MIN_SAMPLES ? v[1] : null;
                  };

                  const clientEdgeVal = lowest3Median(rttSamples.client);
                  const serverMedian = lowest3Median(rttSamples.server);
                  // 【第 2 段特例 · 2026-10-04】serverMs 是 Worker 处理"本次请求"本身的耗时,
                  // 只能随响应一个一个带回来; 服务端环形历史里没有它(它是在响应生成那一刻
                  // 才算出来的) => 默认 60 秒采集下要 2 分钟才凑够 3 个样本。
                  // 它是被明确标注为"非网络时延、不参与求和"的展示项, 所以样本不足时
                  // 如实显示"这一次的真实测量值"并在 title 写明口径 —— 不插值、不估算、
                  // 不复制; 攒够 3 个样本自动升级为中位数。
                  // 注意: 其余三段仍严格执行"不足 3 个如实显示 --"。
                  const serverProcVal = (serverMedian !== null)
                        ? serverMedian
                        : ((typeof d.serverMs === 'number' && d.serverMs > 0) ? d.serverMs : null);
                  const edgeMedian = lowest3Median(rttSamples.edge);
                  // 第 3 段: 优先用新探针(edgeRtt, TCP 1×RTT); 只有"完全没有 edgeRtt 数据"
                  // (旧版手机脚本)时才回退到旧口径 pings.kl, 并在 title 标注口径差异。
                  const argoPhoneVal = (edgeMedian !== null)
                        ? edgeMedian
                        : ((rttSamples.edge.length === 0 && d.pings && typeof d.pings.kl === 'number' && d.pings.kl > 0) ? d.pings.kl : null);
                  const edgeHopSrc = (edgeMedian !== null)
                        ? 'TCP time_connect(1×RTT)'
                        : ((argoPhoneVal !== null) ? 'TLS time_appconnect(≈2×RTT, 回退值)' : '样本不足');
                  const phoneEgressVal = lowest3Median(rttSamples.egress);

                  // 【2026-10-04 修复 T8.9】0 值语义统一: RTT 为 0/缺 => '-- ms'
                  // (0 表示"测了但不可达"或"未测到", 都不该显示成 "0 ms")
                  const fmtMs = function (v) {
                    return (v === null || v === undefined || isNaN(v) || v <= 0) ? '-- ms' : (Math.round(v) + ' ms');
                  };
                  // 【方案 C】每段显示中位数; 悬停 title 给出波动区间与样本数; 样本不足如实显示 --
                  // opt.grey         : 灰字(第2段 非网络时延)
                  // opt.allowSingle  : 仅第2段 —— 样本不足时如实显示"这一次的真实单值"并标注口径,
                  //                    而不是显示 --(其余三段不传, 保持严格门限)
                  const setHop = function (id, val, samples, note, opt) {
                    const el = document.getElementById(id);
                    if (!el) return;
                    const grey = opt && opt.grey;
                    const allowSingle = opt && opt.allowSingle;
                    el.innerText = fmtMs(val);
                    if (grey) el.style.color = '#888';
                    const r = rangeOf(samples);
                    const n = r ? r.n : 0;
                    let stat;
                    if (n >= MIN_SAMPLES) {
                      stat = '最低3次中位 ' + fmtMs(val) + '，波动 ' + r.min + '~' + r.max + ' ms（' + n + ' 个样本）';
                    } else if (allowSingle && val !== null) {
                      stat = '单次真实采样（' + n + '/' + MIN_SAMPLES + '，满 3 次后转为最低3次中位）'
                           + '，非网络时延，不参与求和';
                    } else {
                      stat = '样本不足 ' + n + '/' + MIN_SAMPLES + '，如实显示 --';
                    }
                    el.title = (note ? note + '｜' : '') + stat;
                  };

                  setHop('pipeClientEdge', clientEdgeVal, rttSamples.client, '浏览器实测往返(含该次 Worker 处理)：加载时连测 3 次, 之后每 15 秒 1 次真实测量');
                  setHop('pipeEdgeArgo', serverProcVal, rttSamples.server, 'CF 边缘处理耗时，非网络时延，不参与 RTT 求和', { grey: true, allowSingle: true });
                  setHop('pipeArgoPhone', argoPhoneVal, rttSamples.edge, '手机↔边缘 ' + edgeHopSrc + '，来自手机每 15 秒 1 次的真实测量');
                  setHop('pipePhoneEgress', phoneEgressVal, rttSamples.egress, '手机↔公网 锚点 TCP 连接，手机每轮扫描 1 次真实测量');

                  const totalE2eEl = document.getElementById('totalE2E');
                  if (totalE2eEl) {
                    const parts = [clientEdgeVal, argoPhoneVal, phoneEgressVal]
                        .filter(function (v) { return typeof v === 'number' && v > 0; });
                    totalE2eEl.innerText = (parts.length === 3)
                        ? (Math.round(parts.reduce(function (a, b) { return a + b; }, 0)) + ' ms')
                        : '-- ms';
                    totalE2eEl.title = '三段单次 RTT 的最低3次中位数之和（浏览器↔边缘 + 手机↔边缘 + 手机↔公网）；非单条端到端路径；边缘计算耗时不计入';
                  }

                  document.getElementById('syncClock').innerText = d.updatedAt;

                  // 宿主机在线状态检测 (由服务端统一切片计算，杜绝客户端时钟偏差误报)
                  const liveDot = document.getElementById('liveDot');
                  const liveText = document.getElementById('syncStatusText');
                  const riskBadge = document.getElementById('riskBadge');

                  if (d.isOnline === false) {
                    if (liveDot) {
                      liveDot.style.background = '#ef4444';
                      liveDot.style.boxShadow = '0 0 8px #ef4444';
                    }
                    if (liveText) {
                      liveText.innerHTML = '<span style="color:#ef4444;font-weight:700;">⚠ 宿主机上报中断</span>';
                    }
                    if (riskBadge) {
                      riskBadge.innerHTML = '<span style="color:#ef4444;font-weight:700;">🔴 宿主机连接中断</span>';
                    }
                  } else {
                    if (liveDot) {
                      liveDot.style.background = '#22c55e';
                      liveDot.style.boxShadow = '0 0 8px #22c55e';
                    }
                    if (liveText) {
                      liveText.innerText = '5s REALTIME SYNC';
                    }
                    if (riskBadge) {
                      riskBadge.innerHTML = '<span style="color:#22c55e;font-weight:700;">🟢 实时同步在线</span>';
                    }
                  }

                  let grandTotal = 0, grandDown = 0, grandUp = 0;
                  if (d.userTraffics && Object.keys(d.userTraffics).length > 0) {
                    for (const tk in d.userTraffics) {
                      const ut = d.userTraffics[tk];
                      grandDown += (ut.down || 0);
                      grandUp += (ut.up || 0);
                      grandTotal += (ut.total || ((ut.down || 0) + (ut.up || 0)));
                    }
                  } else {
                    grandDown = d.downBytes || 0;
                    grandUp = d.upBytes || 0;
                    grandTotal = grandDown + grandUp;
                  }
                  document.getElementById('totalBytes').innerText = formatBytes(grandTotal);
                  document.getElementById('downBytes').innerText = formatBytes(grandDown);
                  document.getElementById('upBytes').innerText = formatBytes(grandUp);

                  // 1. 真实更新五大地区实际已接入物理流量比例
                  if (d.regions) {
                    const r = d.regions;
                    const rTotal = (r.kl || 0) + (r.hk || 0) + (r.sg || 0) + (r.tw || 0) + (r.jp || 0);
                    if (rTotal > 0) {
                      regionChart.data.datasets[0].data = [r.kl || 0, r.hk || 0, r.sg || 0, r.tw || 0, r.jp || 0];
                      document.getElementById('regionStatusTag').innerText = '当前物理吞吐: ' + formatBytes(rTotal);
                    } else {
                      regionChart.data.datasets[0].data = [0, 0, 0, 0, 0];
                      document.getElementById('regionStatusTag').innerText = '等待连接产生数据 (0 B)';
                    }
                    regionChart.update('none');
                  }

                  // 2. 真实更新用户排行数据与已授权表格 (A3 优化 · 无刷新实时同步)
                  if (d.userTraffics) {
                    liveUserTraffics = d.userTraffics;
                    renderRankList();
                  }
                  if (d.userDomains) {
                    liveUserDomains = d.userDomains;
                    populateDomainUserSelect();
                    renderDomainStats();
                  }
                  if (Array.isArray(d.users)) {
                    realUsers = d.users;
                    renderRankList();
                    renderUserTable(d.users);
                  }

                  // 3. 记录物理区域基准测速
                  if (d.pings) {
                    latestRegionalPings = d.pings;
                  }

                  // 4. 真实物理层遥测数据更新 (手机硬件、Wi-Fi 6、内核在线时间)
                  // 【2026-10-04 修复 T8.1】缺值统一走 valOrDash: 原来缺字段会渲染
                  //   "undefined% · undefined°C" / "undefined · undefined dBm"。
                  function valOrDash(v, suffix) {
                    const miss = (v === undefined || v === null || v === '' || v === 0);
                    return miss ? '--' : (v + (suffix || ''));
                  }
                  if (d.telemetry) {
                    const bat = d.telemetry.battery;
                    if (bat) {
                      const batEl = document.getElementById('hwBattery');
                      const batStEl = document.getElementById('hwBatteryStatus');
                      const lvlOk = (typeof bat.level === 'number' && bat.level > 0);
                      const tmpOk = (typeof bat.temp === 'string' && bat.temp !== '' && !isNaN(parseFloat(bat.temp)));
                      if (batEl) batEl.innerText = (lvlOk ? valOrDash(bat.level, '%') : '--') + ' · ' + (tmpOk ? valOrDash(bat.temp, '°C') : '--');
                      if (batStEl) {
                        // 【2026-10-04 修复 T1.6】"恒温健康"只在有真实温度且 <35°C 时显示(用户指定阈值)
                        const tempNum = tmpOk ? parseFloat(bat.temp) : null;
                        const coolTxt = (tempNum !== null && tempNum < 35) ? ' · 恒温健康' : '';
                        batStEl.innerText = (bat.status === 'Charging' ? '正在充电' : (bat.status === 'Discharging' ? '电池供电' : '状态未知')) + coolTxt;
                      }
                    }
                    const wf = d.telemetry.wifi;
                    if (wf) {
                      const wfEl = document.getElementById('hwWifi');
                      const wfSpEl = document.getElementById('hwWifiSpeed');
                      const ssidOk = (typeof wf.ssid === 'string' && wf.ssid !== '');
                      const rssiOk = (typeof wf.rssi === 'number' && wf.rssi !== 0);
                      if (wfEl) wfEl.innerText = (ssidOk ? wf.ssid : '--') + ' · ' + (rssiOk ? valOrDash(wf.rssi, ' dBm') : '--');
                      if (wfSpEl) {
                        const spOk = (typeof wf.speed === 'string' && wf.speed !== '');
                        // 【2026-10-04 去重】标签已由卡片写成"链路协商速率", 这里不再重复前缀
                        wfSpEl.innerText = spOk ? wf.speed : '--';
                      }
                    }
                    if (typeof d.telemetry.uptime === 'string' && d.telemetry.uptime !== '') {
                      const upEl = document.getElementById('hwUptime');
                      if (upEl) upEl.innerText = d.telemetry.uptime;
                    }
                    if (d.telemetry.sockets !== undefined) {
                      const skEl = document.getElementById('hwSockets');
                      if (skEl) skEl.innerText = d.telemetry.sockets + ' 个活跃会话';
                    }
                  }

                  // 5. 6大出口物理握手时延与抖动矩阵更新 (方案 C 10秒整点槽位对齐)
                  if (window.__probeError) window.__probeError('FM-GOT:' + (d.pings ? 'pings' : 'nopings'));
                  if (d.pings) {
                    if (window.__probeError) window.__probeError('P1-INBLOCK');
                    const p = d.pings;
                    const j = d.jitters || { kl: 4, gz: 4, sg: 4, hk: 4, jp: 4, tw: 4 };
                    window.latestPingTimes = d.pingTimes || window.latestPingTimes || {};
                    // 【G1 修复】手机只在【测量成功】时才更新时间戳, 所以这里算出的
                    // 年龄是可信的。以服务端 serverTime 为基准, 免疫本机与手机时钟偏差。
                    (function () {
                      var srvSec = Math.floor((d.serverTime || Date.now()) / 1000);
                      var pt = d.pingTimes || {};
                      var ages = {};
                      for (var k in pt) { if (pt[k] > 0) ages[k] = Math.max(0, srvSec - pt[k]); }
                      window.latestPingAges = ages;
                      window.latestPingAgesAt = Date.now();
                      window.latestLosses = d.losses || window.latestLosses || {};
                    })();
                    // 记录本次轮询的数据年龄, 作为实时推送断开时的告警兜底
                    // 【自动更新·双保险】轮询也走同一个判断
                    checkPageBuild(d.buildId);   // 【2026-10-04 修复】不再跳过本次渲染
                    if (window.__probeError) window.__probeError('P2-AFTER-BUILDCHK');
                    window.lastFetchAgeS = Math.max(0, ((d.serverTime || Date.now()) - (d.timestamp || Date.now())) / 1000);
                    window.lastFetchAt = Date.now();
                    // 【2026-10-03】兼容"无数据"状态: 缺值显示 --, 不再编造。
                    // (原判断是 !== undefined, 传 null 会显示成 "null ms")
                    // 【关键修复 2026-10-03】原来这里是 const setGw = ... (局部于 fetchMetrics),
                    // 导致 applyLiveSnapshot 里访问不到 => 实时推送拿到的延迟数字永远写不到页面上,
                    // 数字只在 60 秒整页轮询时才更新一次, 看起来就是"延迟不变"。
                    // 改成 window.setGw, 成为全局函数, 两处都能调用。
                    if (window.__probeError) window.__probeError('P3-BEFORE-SETGW');
                    window.setGw = function(rttId, jitId, rttVal, jitVal) {
                      const rEl = document.getElementById(rttId);
                      const jEl = document.getElementById(jitId);
                      const rMiss = (rttVal === undefined || rttVal === null || rttVal === '' || rttVal === 0);
                      const jMiss = (jitVal === undefined || jitVal === null || jitVal === '' || jitVal === 0);
                      if (rEl) { rEl.innerText = rMiss ? '-- ms' : rttVal + ' ms'; rEl.style.color = rMiss ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-on-surface)'; }
                      if (jEl) { jEl.innerText = jMiss ? '--' : '±' + jitVal + 'ms'; jEl.style.color = jMiss ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-on-surface-variant)'; }
                    };
                    // 【2026-10-04 用户要求】锚点卡片整行已删除, 这里不再写卡片;
                    //   六区时延/抖动仍由 d.pings / d.jitters 提供给链路质量评分与节点矩阵。
                    tickSlotAlignedRefresh();
                  }

                  // 【2026-10-04 用户要求】CF 接入机房锚点整行已删除;
                  //   国际出口那一行与 D 板块(各地区客户端接入质量)此前也已移除。
                  if (window.__probeError) window.__probeError('P4-AT-RENDER');
                  // ============================================================
                  // 【2026-10-04 渲染隔离】每个渲染器各自 try/catch。
                  //   教训: 一个残留的 renderRelayRow(已删除) 调用抛 ReferenceError,
                  //   把它【后面所有】渲染一起带走 —— 新鲜度/丢包/健康卡片/评分/示波器
                  //   全变成 "--"(用户实测反馈)。现在任何一个坏掉都只影响它自己;
                  //   错误写进隐藏元素 #renderErrProbe, 便于事后自查。
                  // ============================================================
                  function _safeRender(name, fn) {
                    try { fn(); } catch (e) {
                      window.__renderErrors = window.__renderErrors || {};
                      window.__renderErrors[name] = String(e);
                      try {
                        var probe = document.getElementById('renderErrProbe');
                        if (!probe) {
                          probe = document.createElement('div');
                          probe.id = 'renderErrProbe';
                          probe.style.display = 'none';
                          document.body.appendChild(probe);
                        }
                        probe.innerText = JSON.stringify(window.__renderErrors);
                      } catch (e2) {}
                    }
                  }
                  _safeRender('时延分布', function () { renderHistogram(d); });
                  _safeRender('流水线标签', function () { renderPipelineTags(d); });
                  _safeRender('顶栏真值', function () { renderHeaderFacts(d); });

                  // ============ B1 手机健康与告警 ============
                  (function () {
                    var tm = d.telemetry || {};
                    var bat = tm.battery || {}, wifi = tm.wifi || {};
                    var setT = function (id, v) { var e = document.getElementById(id); if (e) e.innerText = v; };
                    setT('healthBattery', (bat.level !== undefined ? bat.level : '--') + '%');
                    setT('healthCharging', bat.status === 'Charging' ? '⚡ 充电中' : (bat.status === 'Discharging' ? '🔋 放电中' : (bat.status || '--')));
                    setT('healthTemp', (bat.temp !== undefined ? bat.temp : '--') + ' °C');
                    setT('healthRssi', (wifi.rssi !== undefined ? wifi.rssi : '--') + ' dBm');
                    setT('healthWifiSpeed', wifi.speed || '--');
                    var xr = tm.xrayLive;
                    var xrEl = document.getElementById('healthXray');
                    // 【2026-10-04】无遥测时显示 --(原来 undefined 会显示成"离线", 误报)
                    if (xrEl) {
                      // 【2026-10-04 修复】手机上报的 xrayLive 是【数字 1】(不是布尔 true),
                      //   原来只认 true/false -> 永远走 else -> 显示 "--"。这里兼容 1/0/'1'/'0'。
                      if (xr === true || xr === 1 || xr === '1') { xrEl.innerText = '在线'; xrEl.style.color = '#22c55e'; }
                      else if (xr === false || xr === 0 || xr === '0') { xrEl.innerText = '离线'; xrEl.style.color = '#ef4444'; }
                      else { xrEl.innerText = '--'; xrEl.style.color = '#555'; }
                    }
                    setT('healthCfErr', (tm.cfErrors !== undefined ? tm.cfErrors : '--'));
                    // 【2026-10-04 修复】"本轮采样覆盖"原来在 HTML 里有元素、JS 里从没写过,
                    //   所以永远是 "--"(用户实测反馈)。现在如实计算:
                    //   六区矩阵里【数据新鲜(≤120 秒)】的区域数 / 区域总数。
                    try {
                      var _pt = d.pingTimes || {};
                      var _nowS = Math.floor((d.serverTime || Date.now()) / 1000);
                      var _cov = 0, _covTot = 0;
                      for (var _k in _pt) { _covTot++; if (_pt[_k] > 0 && (_nowS - _pt[_k]) <= 120) _cov++; }
                      var _covEl = document.getElementById('relCover');
                      if (_covEl) {
                        _covEl.innerText = _covTot ? (_cov + ' / ' + _covTot) : '--';
                        _covEl.style.color = (_covTot > 0 && _cov === _covTot) ? '#6dd58c' : (_cov > 0 ? '#f0c048' : '#ffb4ab');
                      }
                    } catch (e) {}
                    var alerts = [];
                    if (bat.level !== undefined && bat.level <= 20) alerts.push('电量偏低');
                    if (bat.temp !== undefined && parseFloat(bat.temp) >= 42) alerts.push('温度偏高');
                    if (xr === false) alerts.push('Xray 离线');   // 只有明确上报离线才告警
                    if (wifi.rssi !== undefined && wifi.rssi <= -75) alerts.push('WiFi 信号弱');
                    var alEl = document.getElementById('healthAlert');
                    if (alEl) {
                      if (bat.level === undefined && xr === undefined) {
                        // 完全没有遥测数据时不要宣称"全部正常"
                        alEl.style.color = '#555';
                        alEl.innerText = '-- 等待手机遥测';
                      } else if (alerts.length === 0) { alEl.style.color = '#22c55e'; alEl.innerText = '● 全部正常'; }
                      else { alEl.style.color = '#eab308'; alEl.innerText = '⚠ ' + alerts.join(' · '); }
                    }
                  })();

                  // ============ B2 链路质量评分 (时延50% + 抖动25% + 丢包25%) ============
                  // 【2026-10-04 修复 T8.5】缺失维度不再按 0 计满分: 只有真实采到
                  //   样本的维度才参与评分, 权重按可用维度归一(否则抖动/丢包缺失时
                  //   那 25%+25% 虚高, 手机没数据反而显示高分)。
                  (function () {
                    var keys = ['kl', 'gz', 'sg', 'hk', 'jp', 'tw'], lat = [], jit = [], los = [];
                    keys.forEach(function (k) {
                      var v = (d.pings || {})[k]; if (typeof v === 'number' && v > 0) lat.push(v);
                      var j = (d.jitters || {})[k]; if (typeof j === 'number' && j > 0) jit.push(j);
                      var l = (d.losses || {})[k]; if (typeof l === 'number') los.push(l);
                    });
                    if (lat.length === 0) return;
                    var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
                    var aL = avg(lat), aJ = avg(jit), aLo = avg(los);
                    // 【已决策·放宽】时延基准 200ms(每超 10ms 扣 2 分)、抖动基准 30ms(每超 5ms 扣 4 分)。
                    // 原为 120ms/20ms, 对跨境链路过于严苛。
                    var sL = Math.max(0, 100 - Math.max(0, aL - 200) / 10 * 2);
                    var sJ = Math.max(0, 100 - Math.max(0, aJ - 30) / 5 * 4);
                    var sLo = Math.max(0, 100 - aLo * 10);
                    var wSum = 0.5, raw = sL * 0.5;
                    if (jit.length) { raw += sJ * 0.25; wSum += 0.25; }
                    if (los.length) { raw += sLo * 0.25; wSum += 0.25; }
                    var score = Math.round(raw / wSum);
                    var color = score >= 85 ? '#22c55e' : (score >= 60 ? '#eab308' : '#ef4444');
                    var grade = score >= 85 ? '优秀' : (score >= 60 ? '可用' : '较差');
                    var e1 = document.getElementById('qualityScore');
                    if (e1) { e1.innerText = score; e1.style.color = color; }
                    var e2 = document.getElementById('qualityGrade');
                    if (e2) { e2.innerText = grade + (aLo > 0 ? '（存在丢包）' : ''); e2.style.color = color; }
                    var e3 = document.getElementById('qualityBar');
                    if (e3) { e3.style.width = score + '%'; e3.style.background = color; }
                    var e4 = document.getElementById('qualityDetail');
                    if (e4) e4.innerText = '平均时延 ' + Math.round(aL) + ' ms · 抖动 ' + Math.round(aJ) + ' ms · 丢包 ' + aLo.toFixed(0) + '%';
                  })();

                  // ============ B4 服务可靠性 ============
                  (function () {
                    var lagS = Math.round(((d.serverTime || Date.now()) - (d.timestamp || Date.now())) / 1000);
                    var tm = d.telemetry || {};
                    var rate = lagS <= 10 ? 100 : Math.max(0, Math.round(100 - (lagS - 10) * 2));
                    var setT = function (id, v, c) { var e = document.getElementById(id); if (e) { e.innerText = v; if (c) e.style.color = c; } };
                    setT('relReport', rate + '%', rate >= 90 ? '#22c55e' : (rate >= 60 ? '#eab308' : '#ef4444'));
                    // 未知(未上报)时显示 --, 不再武断地说"离线"
                    if (tm.xrayLive === undefined || tm.xrayLive === null) setT('relXray', '--', '#555');
                    else setT('relXray', tm.xrayLive ? '在线' : '离线', tm.xrayLive ? '#22c55e' : '#ef4444');
                    setT('relCfErr', (tm.cfErrors === undefined ? '--' : tm.cfErrors), (tm.cfErrors > 50 ? '#eab308' : '#ffffff'));
                    // 【2026-10-04 T8.4】颜色统一: <=599 绿 / >=600 黄, 红只给连不上
                    setT('relLag', lagS + ' 秒', lagS <= 599 ? '#22c55e' : '#eab308');
                    var nEl = document.getElementById('relNote');
                    if (nEl) nEl.innerText = '手机约每 6 秒上报一次 · 当前数据延迟 ' + lagS + ' 秒' + (rate < 100 ? '（节奏偏慢）' : '');
                  })();

                  // 6. 真实并发连接数与水位计 (读取实际活跃 Socket)
                  const realConns = d.conns !== undefined ? d.conns : (d.telemetry ? d.telemetry.sockets : 0);
                  const connCountEl = document.getElementById('connCount');
                  if (connCountEl) connCountEl.innerText = realConns;
                  const waterBarEl = document.getElementById('waterLevelBar');
                  if (waterBarEl) {
                    // 【统一警戒值】满刻度 = 警戒值 = 500 会话。
                    // 依据: 本机 fd 上限 32768(硬限制碰不到), 按 7 个用户每人
                    // 重度浏览约 70 条并发估算峰值 ≈ 490, 故 500 是合理的预警线。
                    const waterPct = Math.min(100, Math.round((realConns / 500) * 100));
                    waterBarEl.style.height = (realConns > 0 ? Math.max(3, waterPct) : 0) + '%';
                    waterBarEl.style.background = realConns >= 500 ? '#ef4444' : (realConns >= 300 ? '#eab308' : '#38bdf8');
                    // 近 15 分钟峰值 (直接从示波器采样点里取, 无需后端改动)
                    const peakEl = document.getElementById('connPeak');
                    if (peakEl && d.history15m && d.history15m.length) {
                      let pk = 0;
                      d.history15m.forEach(function (pt) { const v = Number(pt.conns || 0); if (v > pk) pk = v; });
                      peakEl.innerText = pk;
                    }
                  }

                  // 7. 近 15 分钟示波器全真连续波次更新 (直读手机端 30 个采样点，绝无全 0)
                  if (d.history15m && d.history15m.length > 0) {
                    const lastPt = d.history15m[d.history15m.length - 1];
                    const isNewSample = (window._lastOscilloscopeTime !== lastPt.time);
                    window._lastOscilloscopeTime = lastPt.time;

                    // 【C2】堆叠面积图: 总吞吐 = 下行 + 上行, 一眼看出带宽占用
                    try {
                      for (var _sk in liveChart.options.scales) { liveChart.options.scales[_sk].stacked = true; }
                    } catch (e) {}
                    liveChart.data.labels = d.history15m.map(function(pt) { return pt.time; });
                    liveChart.data.datasets[0].data = d.history15m.map(function(pt) { return Number(pt.down); });
                    liveChart.data.datasets[1].data = d.history15m.map(function(pt) { return Number(pt.up); });
                    if (isNewSample) {
                      liveChart.update();
                    } else {
                      liveChart.update('none');
                    }

                    // 【P2 修复】原实现取 max(下行,上行), 但卡片标题写的是"上行带宽" —— 名不副实。
                    // 现在如实显示上行速率; 下行速率由下方堆叠面积图完整呈现。
                    // 【2026-10-04 修复 T8.7】统一口径: 优先 liveRate(两次上报间的
                    //   真实字节差), 只有它缺失时才退回 history15m 的采样点,
                    //   避免两条数据源交替覆盖导致仪表盘数值跳变。
                    const lr = d.liveRate;
                    const activeMbps = (lr && typeof lr.up === 'number' && lr.up !== null)
                      ? Number(lr.up)
                      : (Number(lastPt.up) || 0);
                    const gValEl = document.getElementById('gaugeVal');
                    if (gValEl) gValEl.innerText = activeMbps.toFixed(2) + ' Mbps';
                    // 【2026-10-04】同卡补瞬时上行/下行与 15 分钟上行峰值(全部取自真实采样点)
                    try {
                      var curDownMbps = (lr && typeof lr.down === 'number' && lr.down !== null)
                        ? Number(lr.down) : (Number(lastPt.down) || 0);
                      var upSeries = (liveChart.data.datasets[1].data || []).map(Number).filter(function (x) { return isFinite(x); });
                      var peakUp = upSeries.length ? Math.max.apply(null, upSeries) : 0;
                      var cu = document.getElementById('curUp');
                      if (cu) cu.innerText = activeMbps.toFixed(2) + ' Mbps';
                      var cd = document.getElementById('curDown');
                      if (cd) cd.innerText = curDownMbps.toFixed(2) + ' Mbps';
                      var pk = document.getElementById('peakUp');
                      if (pk) pk.innerText = peakUp.toFixed(2) + ' Mbps';
                    } catch (e) {}
                    gaugeChart.data.datasets[0].data = [activeMbps, Math.max(0, 150 - activeMbps)];
                    if (activeMbps > 120) {
                      gaugeChart.data.datasets[0].backgroundColor[0] = '#ef4444';
                    } else if (activeMbps > 80) {
                      gaugeChart.data.datasets[0].backgroundColor[0] = '#22c55e';
                    } else {
                      gaugeChart.data.datasets[0].backgroundColor[0] = '#ffffff';
                    }
                    gaugeChart.update('none');
                  }
                }
              } catch (e) {
                console.error('fetchMetrics error:', e);
              }
            }

            // 【2026-10-04 用户要求】锚点卡片整行与"数据新鲜度自检"卡已删除,
            //   原 updateRegionalSlotAges(每秒写 6 张卡的年龄/徽标/蓝框)随之删除。
            //   这里保留其中【只与请求节奏有关】的那部分: 「⚡2秒极速」模式下的
            //   10 秒槽位对齐抓取 —— 这是既有的请求量控制算法, 行为与节奏完全不变。
            let lastAutoSlotFetched = -1;

            function tickSlotAlignedRefresh() {
              const nowSec = Math.floor(Date.now() / 1000);
              const secInMin = nowSec % 60;
              const currentSlot = Math.floor(secInMin / 10); // 0..5
              const secInSlot = secInMin % 10; // 0..9

              // 【BUG 修复 2026-10-03】槽位对齐抓取只在「⚡2秒极速」模式下启用。
              // 旧实现无条件下每 10 秒强抓 2 次, 把「1分钟采集」彻底架空 ——
              // 实测 12 次/分钟 = 17280 次/天/标签页, 是宣称 1440 次的 12 倍,
              // 白耗 Workers 免费请求额度。默认模式现在真正是 60 秒一采。
              const fastMode = currentPollInterval <= 5000;
              if (fastMode && (secInSlot === 0 || secInSlot === 1) && lastAutoSlotFetched !== currentSlot) {
                lastAutoSlotFetched = currentSlot;
                fetchMetrics();
                setTimeout(fetchMetrics, 1200);
              }
            }
            setInterval(tickSlotAlignedRefresh, 1000);

            // 智能后台采集频率控制 (默认 1 分钟一采集，支持按需切换 2 秒极速)
            let metricsTimer = null;
            let currentPollInterval = 60000; // 默认 60 秒 (1分钟)
            let lastSuccessTimestamp = Date.now();

            function setPollingInterval(ms) {
              currentPollInterval = ms;
              const b2 = document.getElementById('btnFreq2s');
              const b60 = document.getElementById('btnFreq60s');
              if (b2) b2.classList.toggle('active', ms === 2000);
              if (b60) b60.classList.toggle('active', ms === 60000);
              startMetricsPolling();
            }


            // 【2026-10-04 用户决策】D 板块已移除, 原 renderClientRttByColo() 一并删除。
            //   服务端 /api/client_rtt 与聚合逻辑保留(未被调用不产生任何流量),
            //   需要恢复时按本仓库 git 历史还原即可。

            // 【2026-10-04 用户要求】CF 接入机房(6 张锚点卡)整行已从大屏删除,
            //   原 renderAccessGroups()(按实测机房码合并/改名同机房锚点)与
            //   "每秒把【测速中】徽标补到代表卡"的 interval 一并删除。
            //   这里保留一个空实现的同名函数, 防止将来遗漏的调用点抛 ReferenceError;
            //   实测机房码 colos 仍由手机每 5 分钟采集(顶栏落点标签在用)。
            function renderAccessGroups(pings, colos) {
              return;
            }

            // ==========================================================
            // 【RTT 修复 · 方案 C】统计化工具: 最近 N 个样本的中位数与极值。
            //   纯内存维护, 零额外网络请求 —— 硬约束要求"不得新增高频请求",
            //   所以抗抖只能靠对已有采样做滚动统计, 不能靠连发多次探测。
            // ==========================================================
            function pushSample(arr, v, maxLen) {
              if (typeof v !== 'number' || !isFinite(v) || v <= 0) return arr;
              arr.push(v);
              while (arr.length > (maxLen || 10)) arr.shift();
              return arr;
            }
            function medianOf(arr) {
              if (!arr || arr.length === 0) return null;
              var s = arr.slice().sort(function (a, b) { return a - b; });
              var m = Math.floor(s.length / 2);
              return (s.length % 2) ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
            }
            function rangeOf(arr) {
              if (!arr || arr.length === 0) return null;
              var s = arr.slice().sort(function (a, b) { return a - b; });
              return { min: s[0], max: s[s.length - 1], n: s.length };
            }
            // 【RTT 提速】"多少个样本才称得上中位"的唯一门限: 显示端与加载补测共用同一常量,
            // 避免两处各写一个字面量、日后改一处漏一处。
            var RTT_MIN_SAMPLES = 3;
            // 四段各自的样本桶(浏览器↔边缘 / 边缘计算 / 手机↔边缘 / 手机↔公网)
            var rttSamples = { client: [], server: [], edge: [], egress: [] };

            // 客户端 ↔ Cloudflare 边缘 的真实 RTT 实测
            //   /api/rtt 是纯探针(不做任何计算), 这里的耗时就是纯网络往返。
            //   节流到 15 秒一次, 避免「2秒极速」模式下请求量翻倍。
            let lastClientRttMs = null;
            let lastRttProbeAt = 0;
            // 【RTT 提速 · 方案 3】force=true 时绕过 15 秒节流 —— 只给"页面加载瞬间补测"用。
            // 稳态路径(fetchMetrics 轮询 与 15 秒定时器)一律不传 force, 节流保持原样。
            async function probeClientRtt(force) {
              const _now = Date.now();
              if (!force && _now - lastRttProbeAt < 15000) return;
              lastRttProbeAt = _now;   // force 也刷新时间戳, 避免紧随其后的定时器再打一次
              try {
                const t0 = performance.now();
                // 【2026-10-04 修复 T8.10】加 3 秒超时: 原实现无超时, 网络异常时会
                //   阻塞整轮 fetchMetrics(在 await 上卡死)。
                const ctrl = new AbortController();
                const to = setTimeout(() => ctrl.abort(), 3000);
                await fetch(window.location.origin + '/api/rtt?_t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
                clearTimeout(to);
                const ms = performance.now() - t0;
                if (ms > 0 && ms < 60000) {
                  lastClientRttMs = Math.round(ms);
                  // 【RTT 修复 · 方案 C】把样本收进滚动窗口(不改节流: 仍是 15 秒一次)
                  pushSample(rttSamples.client, lastClientRttMs, 10);
                  // 【D 2026-10-04】把这一次【真实测量】回传给服务端, 按接入机房聚合。
                  // 这是"各地区客户端接入质量"的唯一正确数据源 —— 手机侧测不到别人的网络。
                  // 不新增频率(与探针同频), 载荷约 20 字节; fire-and-forget, 失败绝不影响卡片。
                  try {
                    fetch(window.location.origin + '/api/client_rtt', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ rtt: lastClientRttMs }),
                      keepalive: true
                    }).catch(function () {});
                  } catch (e) {}
                }
              } catch (e) {}
            }

            // ==========================================================
            // 【RTT 提速 2026-10-04 · 方案 B】让 /api/rtt 独立按 15 秒采样
            // ----------------------------------------------------------
            // 原来这个探针只在 fetchMetrics 里被调用, 而 fetchMetrics 默认 60 秒
            // 才跑一次 => 第 1 段三分钟才攒够 3 个样本(即"页面上四段显示 --")。
            // 节流阈值本来就是 15 秒(见 probeClientRtt 第一行), 这里只是把它用起来。
            // 于是第 1 段 30 秒就有 3 个真实样本、2.5 分钟满 10 个。
            // 代价: 稳态每分钟 4 个请求(每个约 619 字节, 204 空响应, 不读任何存储),
            //       相对手机每天 14400 次上报 < 0.1%; 与 2 秒极速模式的节流互不干扰。
            // 注: 不在页面隐藏时暂停 —— 否则切回标签页时中位数会基于过期样本。
            if (!window.__rttSampleTimer) {
              window.__rttSampleTimer = setInterval(function () { probeClientRtt(); }, 15000);
              // 【RTT 提速 · 方案 3】页面加载瞬间补测 —— 但【只在还没拿到足够的正常测速数据时】才补:
              //   need = RTT_MIN_SAMPLES - 已有样本数, 补够即止(已有 >=3 个样本时一次都不补)。
              //   于是第 1 段从"30 秒"压到"打开即 0 秒"; 代价每次加载最多 +2 个请求。
              //   为什么间隔 250ms 而不是连发: 三次落在不同的往返上, 避免"同一瞬间的同一拥塞
              //   状态"被当成三个独立样本(那会让中位数虚稳)。
              //   真实性: 每一次都是真实的 /api/rtt 实测耗时, 不插值、不复制、不估算。
              (async function () {
                await probeClientRtt();                        // 常规首次采样(走节流)
                if (window.__rttWarmupDone) return;            // 每次页面加载只补一轮
                const need = RTT_MIN_SAMPLES - rttSamples.client.length;
                if (need <= 0) return;                         // 已经有正常测速数据 => 不补
                window.__rttWarmupDone = true;
                for (let i = 0; i < need; i++) {
                  await probeClientRtt(true);                  // force: 仅此处绕过 15 秒节流
                  if (i < need - 1) await new Promise(function (r) { setTimeout(r, 250); });
                }
              })();
            }

            // 真实数据年龄 (修 BUG: 旧实现测的是"浏览器上次轮询距今多久",
            // 且被每 10 秒的槽位抓取不断重置, 所以永远在 1~7 秒循环, 与数据新旧无关)
            let dataAgeBaseSec = 0;
            let dataAgeBaseAt = Date.now();
            let dataNoSignal = true;   // 【2026-10-04 T1.4】timestamp<=0 时视为"未测到"
            function noteDataAge(serverTime, dataTimestamp) {
              if (typeof serverTime === 'number' && typeof dataTimestamp === 'number' && dataTimestamp > 0 && serverTime >= dataTimestamp) {
                dataAgeBaseSec = (serverTime - dataTimestamp) / 1000;
                dataNoSignal = false;
              } else if (typeof dataTimestamp === 'number' && dataTimestamp <= 0) {
                dataAgeBaseSec = 0;
                dataNoSignal = true;
              } else {
                dataAgeBaseSec = 0;
                dataNoSignal = false;
              }
              dataAgeBaseAt = Date.now();
            }

            // 右上角数据时效: 显示"数据本身"有多旧, 并随时间自然增长(不受轮询重置影响)
            // 【2026-10-04 修复 T8.4】颜色规则统一: <=599 秒绿、>=600 秒黄;
            //   红色只保留给"未测到"(原来 >45 秒就变红, 违反"红只给连不上")。
            function updateFreshnessTicker() {
              const el = document.getElementById('dataFreshnessTag');
              if (!el) return;
              if (dataNoSignal) {
                el.innerText = '未测到';
                el.style.color = '#ef4444';
                return;
              }
              const extraSec = (Date.now() - dataAgeBaseAt) / 1000;
              const ageSec = Math.max(0, Math.round(dataAgeBaseSec + extraSec));
              el.innerText = (ageSec <= 1 ? '刚刚' : ageSec + '秒前') + '数据';
              el.style.color = (ageSec <= 599) ? '#22c55e' : '#eab308';
            }
            setInterval(updateFreshnessTicker, 1000);

            function startMetricsPolling() {
              if (metricsTimer) clearInterval(metricsTimer);
              fetchMetrics();
              metricsTimer = setInterval(fetchMetrics, currentPollInterval);
              // 【2026-10-04 用户要求】打开大屏就自动触发一次 55 节点全量扫描:
              //   复用 manual_scan 指令链路 -> 手机 10 路并发一轮约 1.5~2 秒,
              //   瞬时带宽 ~0.7 Mbps = 150Mbps 上限的 0.5%, 远低于 8% 预算。
              //   只在本次页面加载触发一次(避免与 60 秒轮询叠加)。
              if (!window.__autoScanFired) {
                window.__autoScanFired = true;
                setTimeout(function () {
                  fetch(window.location.origin + '/api/manual_scan?pwd=' + (env.ADMIN_PASSWORD || "CHANGE_ME"),
                    { method: 'POST', cache: 'no-store' }).catch(function () {});
                }, 1500);
              }
            }

            function stopMetricsPolling() {
              if (metricsTimer) {
                clearInterval(metricsTimer);
                metricsTimer = null;
              }
            }

            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                startMetricsPolling();
                startLiveStream();
              } else {
                stopMetricsPolling();
                stopLiveStream();
              }
            });

            startMetricsPolling();
            startLiveStream();
          </script>
        <!-- 【2026-10-04 T7.2】KV 写失败黄条: 后台增删用户后若 KV 没落盘, URL 会带 kverr=1 -->
        <script>
          (function () {
            if (location.search.indexOf('kverr=1') !== -1) {
              var d = document.createElement('div');
              d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#eab308;color:#000;padding:10px 16px;font-size:13px;font-weight:600;text-align:center;';
              d.innerText = '⚠ 警告: 用户库写入 Cloudflare KV 失败(未真正落盘)。请重试; 若持续出现请检查 KV 配额。';
              document.body.prepend(d);
              setTimeout(function () { d.remove(); }, 12000);
            }
          })();
        </script>
        </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache'
        }
      });
    }

    return new Response('404 Not Found', { status: 404 });
  }
};
