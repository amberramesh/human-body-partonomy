(function(t){function e(e){for(var n,i,l=e[0],s=e[1],c=e[2],h=0,f=[];h<l.length;h++)i=l[h],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&f.push(a[i][0]),a[i]=0;for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(t[n]=s[n]);u&&u(e);while(f.length)f.shift()();return o.push.apply(o,c||[]),r()}function r(){for(var t,e=0;e<o.length;e++){for(var r=o[e],n=!0,l=1;l<r.length;l++){var s=r[l];0!==a[s]&&(n=!1)}n&&(o.splice(e--,1),t=i(i.s=r[0]))}return t}var n={},a={app:0},o=[];function i(e){if(n[e])return n[e].exports;var r=n[e]={i:e,l:!1,exports:{}};return t[e].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=t,i.c=n,i.d=function(t,e,r){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},i.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(r,n,function(e){return t[e]}.bind(null,n));return r},i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/human-body-partonomy/";var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=e,l=l.slice();for(var c=0;c<l.length;c++)e(l[c]);var u=s;o.push([0,"chunk-vendors"]),r()})({0:function(t,e,r){t.exports=r("56d7")},"034f":function(t,e,r){"use strict";r("85ec")},"56d7":function(t,e,r){"use strict";r.r(e);r("e260"),r("e6cf"),r("cca6"),r("a79d");var n=r("2b0e"),a=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{attrs:{id:"app"}},[r("svg",{ref:"svg"})])},o=[],i=r("2909"),l=r("b85c"),s=r("3835"),c=(r("a630"),r("3ca3"),r("4ec9"),r("d3b7"),r("ddb0"),r("99af"),r("25f0"),r("a434"),r("a15b"),r("ac1f"),r("5319"),r("fb6a"),r("6062"),r("159b"),r("498a"),r("a5b6")),u=r("5698"),h=["#003f5c","#2f4b7c","#665191","#a05195","#d45087","#f95d6a","#ff7c43","#ffa600"],f=[function(t){return t["AS/2"]},function(t){return t["AS/3"]},function(t){return t["AS/4"]},function(t){return t["AS/5"]},function(t){return t["CT/1"]},function(t){return t["BG/1"]}],d=function(t){var e=Object(s["a"])(t,2),r=e[1];return r.size&&Array.from(r)},p={name:"App",data:function(){return{currentRoot:null,drawingArea:null,treemapContainer:null,labels:null,footer:null,svgWidth:960,svgHeight:700,margin:{top:10,right:10,bottom:10,left:10},titleY:20,treemapRadius:300,polygonVertices:60,fontScale:u["scaleLinear"](),voronoiTreemap:Object(c["voronoiTreemap"])(),colorMap:new Map,colorPallete:[].concat(h),rootStack:[]}},computed:{height:function(){return this.svgHeight-this.margin.top-this.margin.bottom},width:function(){return this.svgWidth-this.margin.left-this.margin.right},halfWidth:function(){return this.width/2},halfHeight:function(){return this.height/2},treemapCenter:function(){return[this.halfWidth,this.halfHeight]},outerPolygon:function(){for(var t=this.treemapRadius,e=2*Math.PI/this.polygonVertices,r=[],n=0,a=0;a<this.polygonVertices;a++,n+=e)r.push([t+t*Math.cos(n),t+t*Math.sin(n)]);return r}},methods:{randomColor:function(){return"#".concat(Math.floor(Math.random()*(Math.pow(16,6)-1)).toString(16))},getColor:function(t){return this.colorMap.has(t)||this.colorMap.set(t,this.getFromPalette()),this.colorMap.get(t)},getFromPalette:function(){return this.colorPallete.length>0?this.colorPallete.pop():this.randomColor()},resetColorPalette:function(){var t;(t=this.colorPallete).splice.apply(t,[0,this.colorPallete.length].concat(h))},drawTitle:function(){this.drawingArea.append("text").attr("id","title").attr("transform","translate("+[this.halfWidth,this.titleY]+")").attr("text-anchor","middle").text("Human Body Partonomy")},drawFooter:function(){this.footer=this.drawingArea.append("text").style("font-size","12px").attr("transform","translate("+[this.halfWidth,this.height]+")").attr("text-anchor","middle")},initLayout:function(){var t=this,e=u["select"]("svg").attr("width",this.svgWidth).attr("height",this.svgHeight).on("click",(function(e){e.target===t.$refs.svg&&t.rootStack.length>0&&(t.currentRoot=t.rootStack.pop(),t.drawTreemap())}));this.drawingArea=e.append("g").classed("drawingArea",!0).attr("transform","translate("+[this.margin.left,this.margin.top]+")"),this.treemapContainer=this.drawingArea.append("g").classed("treemap-container",!0).attr("transform","translate("+this.treemapCenter+")"),this.treemapContainer.append("path").classed("world",!0).attr("transform","translate("+[-this.treemapRadius,-this.treemapRadius]+")").attr("d","M"+this.outerPolygon.join(",")+"Z"),this.drawTitle(),this.drawFooter(),this.fontScale.domain([5,30]).range([10,30]).clamp(!0)},drawTreemap:function(){var t=this;this.resetColorPalette(),this.rootStack.length>0?this.footer.text("(click outside to return to previous level)"):this.footer.text(""),this.voronoiTreemap.clip(this.outerPolygon)(this.currentRoot);var e=this.currentRoot.leaves();this.treemapContainer.append("g").classed("cells",!0).attr("transform","translate("+[-this.treemapRadius,-this.treemapRadius]+")").selectAll(".cell").data(e).enter().append("path").classed("cell",!0).attr("d",(function(t){return"M"+t.polygon.join(",")+"Z"})).style("fill",(function(e){return t.getColor(e)})),this.labels&&this.labels.remove(),this.labels=this.treemapContainer.append("g").classed("labels",!0).attr("transform","translate("+[-this.treemapRadius,-this.treemapRadius]+")").selectAll(".label").data(e).enter().append("g").classed("label",!0).attr("transform",(function(t){return"translate("+[t.polygon.site.x,t.polygon.site.y]+")"})).style("font-size",(function(e){return t.fontScale(e.value/e.parent.value*50)})),this.labels.append("text").classed("name",!0).html((function(t){return t.data.label.replace("-","\n")})),this.labels.append("text").classed("value",!0).text((function(t){return t.data.size?"(".concat(t.value,")"):""}));var r=this.treemapContainer.append("g").classed("hoverers",!0).attr("transform","translate("+[-this.treemapRadius,-this.treemapRadius]+")").selectAll(".hoverer").data(e).enter().append("path").classed("hoverer",!0).attr("d",(function(t){return"M"+t.polygon.join(",")+"Z"})).on("click",(function(e,r){r.data.size&&(t.buildHierarchyFromTree(r.data),t.drawTreemap())}));r.append("title").text((function(t){return"".concat(t.data.label,"\nOut Degree: ").concat(t.data.size)}))},removeNulls:function(t){if(t instanceof Map){var e,r=Object(l["a"])(t.keys());try{for(r.s();!(e=r.n()).done;){var n=e.value;""===n?t.delete(n):this.removeNulls(t.get(n))}}catch(a){r.e(a)}finally{r.f()}}},generateHierarchy:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.currentRoot&&this.rootStack.push(this.currentRoot);var r=u["group"].apply(u,[t].concat(Object(i["a"])(f.slice(0,e+1))));this.removeNulls(r),this.currentRoot=u["hierarchy"](["root",r],d).sum((function(t){var e=Object(s["a"])(t,2),r=e[1];return r instanceof Array?r.length:1})).sort((function(t,e){return e.value-t.value}))},dfsSizeUpdate:function(t,e){e.add(t);var r,n=t.size,a=Object(l["a"])(t._children);try{for(a.s();!(r=a.n()).done;){var o=r.value;e.has(o)||(n+=this.dfsSizeUpdate(o,e))}}catch(i){a.e(i)}finally{a.f()}return t.size=n,n},buildTree:function(t){var e=new Map,r=new Set;t.forEach((function(t){r.add(t["FROM"].trim()),r.add(t["TO"].trim())}));var n,a=Object(l["a"])(r);try{for(a.s();!(n=a.n()).done;){var o=n.value;e.set(o,{label:o,_children:[],size:0})}}catch(p){a.e(p)}finally{a.f()}var i,s=Object(l["a"])(t);try{for(s.s();!(i=s.n()).done;){var c=i.value,u=c["FROM"].trim(),h=c["TO"].trim();if(u!==h){var f=e.get(u);f._children.push(e.get(h)),f.size++}}}catch(p){s.e(p)}finally{s.f()}var d=e.get("Body");return d},buildHierarchyFromTree:function(t){this.currentRoot&&this.rootStack.push(this.currentRoot),t._children&&(t.children=t._children,t._children=null),this.currentRoot=u["hierarchy"](t).sum((function(t){return t.size||1})).sort((function(t,e){return e.value-t.value}))}},mounted:function(){var t=this;u["csv"]("AS-CT-Tree-Combined.csv").then((function(e){t.initLayout(),t.buildHierarchyFromTree(t.buildTree(e)),t.drawTreemap()}))}},m=p,g=(r("034f"),r("2877")),v=Object(g["a"])(m,a,o,!1,null,null,null),b=v.exports;n["a"].config.productionTip=!1,new n["a"]({render:function(t){return t(b)}}).$mount("#app")},"85ec":function(t,e,r){}});
//# sourceMappingURL=app.e5171d38.js.map