$(function(){$.widget("primeui.puimessages",{options:{closable:true},_create:function(){this.element.addClass("pui-messages ui-widget ui-corner-all");
if(this.options.closable){this.closer=$('<a href="#" class="pui-messages-close"><i class="fa fa-close"></i></a>').appendTo(this.element)
}this.element.append('<span class="pui-messages-icon fa fa-info-circle fa-2x"></span>');
this.msgContainer=$("<ul></ul>").appendTo(this.element);
this._bindEvents()
},_bindEvents:function(){var a=this;
if(this.options.closable){this.closer.on("click",function(b){a.element.slideUp();
b.preventDefault()
})
}},show:function(a,c){this.clear();
this.element.removeClass("pui-messages-info pui-messages-warn pui-messages-error").addClass("pui-messages-"+a);
if($.isArray(c)){for(var b=0;
b<c.length;
b++){this._showMessage(c[b])
}}else{this._showMessage(c)
}this.element.show()
},_showMessage:function(a){this.msgContainer.append('<li><span class="pui-messages-summary">'+a.summary+'</span><span class="pui-messages-detail">'+a.detail+"</span></li>")
},clear:function(){this.msgContainer.children().remove();
this.element.hide()
}})
});