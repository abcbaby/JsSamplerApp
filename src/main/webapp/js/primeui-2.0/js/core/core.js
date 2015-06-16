var PUI={zindex:1000,gridColumns:{"1":"pui-grid-col-12","2":"pui-grid-col-6","3":"pui-grid-col-4","4":"pui-grid-col-3","6":"pui-grid-col-2","12":"pui-grid-col-11"},scrollInView:function(b,e){var h=parseFloat(b.css("borderTopWidth"))||0,d=parseFloat(b.css("paddingTop"))||0,f=e.offset().top-b.offset().top-h-d,a=b.scrollTop(),c=b.height(),g=e.outerHeight(true);
if(f<0){b.scrollTop(a+f)
}else{if((f+g)>c){b.scrollTop(a+f-c+g)
}}},isIE:function(a){return(this.browser.msie&&parseInt(this.browser.version,10)===a)
},escapeRegExp:function(a){return a.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")
},escapeHTML:function(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
},clearSelection:function(){if(window.getSelection){if(window.getSelection().empty){window.getSelection().empty()
}else{if(window.getSelection().removeAllRanges){window.getSelection().removeAllRanges()
}}}else{if(document.selection&&document.selection.empty){document.selection.empty()
}}},inArray:function(a,c){for(var b=0;
b<a.length;
b++){if(a[b]===c){return true
}}return false
},calculateScrollbarWidth:function(){if(!this.scrollbarWidth){if(this.browser.msie){var c=$('<textarea cols="10" rows="2"></textarea>').css({position:"absolute",top:-1000,left:-1000}).appendTo("body"),b=$('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>').css({position:"absolute",top:-1000,left:-1000}).appendTo("body");
this.scrollbarWidth=c.width()-b.width();
c.add(b).remove()
}else{var a=$("<div />").css({width:100,height:100,overflow:"auto",position:"absolute",top:-1000,left:-1000}).prependTo("body").append("<div />").find("div").css({width:"100%",height:200});
this.scrollbarWidth=100-a.width();
a.parent().remove()
}}return this.scrollbarWidth
},resolveUserAgent:function(){var a,d;
jQuery.uaMatch=function(h){h=h.toLowerCase();
var g=/(opr)[\/]([\w.]+)/.exec(h)||/(chrome)[ \/]([\w.]+)/.exec(h)||/(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(h)||/(webkit)[ \/]([\w.]+)/.exec(h)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(h)||/(msie) ([\w.]+)/.exec(h)||h.indexOf("trident")>=0&&/(rv)(?::| )([\w.]+)/.exec(h)||h.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(h)||[];
var f=/(ipad)/.exec(h)||/(iphone)/.exec(h)||/(android)/.exec(h)||/(windows phone)/.exec(h)||/(win)/.exec(h)||/(mac)/.exec(h)||/(linux)/.exec(h)||/(cros)/i.exec(h)||[];
return{browser:g[3]||g[1]||"",version:g[2]||"0",platform:f[0]||""}
};
a=jQuery.uaMatch(window.navigator.userAgent);
d={};
if(a.browser){d[a.browser]=true;
d.version=a.version;
d.versionNumber=parseInt(a.version)
}if(a.platform){d[a.platform]=true
}if(d.android||d.ipad||d.iphone||d["windows phone"]){d.mobile=true
}if(d.cros||d.mac||d.linux||d.win){d.desktop=true
}if(d.chrome||d.opr||d.safari){d.webkit=true
}if(d.rv){var e="msie";
a.browser=e;
d[e]=true
}if(d.opr){var c="opera";
a.browser=c;
d[c]=true
}if(d.safari&&d.android){var b="android";
a.browser=b;
d[b]=true
}d.name=a.browser;
d.platform=a.platform;
this.browser=d;
$.browser=d
},getGridColumn:function(a){return this.gridColumns[a+""]
}};
PUI.resolveUserAgent();