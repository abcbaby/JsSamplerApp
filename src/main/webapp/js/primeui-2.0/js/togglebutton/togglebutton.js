$(function(){$.widget("primeui.puitogglebutton",{options:{onLabel:"Yes",offLabel:"No",onIcon:null,offIcon:null},_create:function(){this.element.wrap('<div class="pui-button pui-togglebutton ui-widget ui-state-default ui-corner-all" />');
this.container=this.element.parent();
this.element.addClass("ui-helper-hidden-accessible");
if(this.options.onIcon&&this.options.offIcon){this.container.addClass("pui-button-text-icon-left");
this.container.append('<span class="pui-button-icon-left pui-icon fa fa-fw"></span>')
}else{this.container.addClass("pui-button-text-only")
}this.container.append('<span class="pui-button-text"></span>');
if(this.options.style){this.container.attr("style",this.options.style)
}if(this.options.styleClass){this.container.attr("class",this.options.styleClass)
}this.label=this.container.children(".pui-button-text");
this.icon=this.container.children(".pui-icon");
if(this.element.prop("checked")){this.check(true)
}else{this.uncheck(true)
}if(!this.element.prop("disabled")){this._bindEvents()
}},_bindEvents:function(){var a=this;
this.container.on("mouseover",function(){if(!a.container.hasClass("ui-state-active")){a.container.addClass("ui-state-hover")
}}).on("mouseout",function(){a.container.removeClass("ui-state-hover")
}).on("click",function(){a.toggle();
a.element.trigger("focus")
});
this.element.on("focus",function(){a.container.addClass("ui-state-focus")
}).on("blur",function(){a.container.removeClass("ui-state-focus")
}).on("keydown",function(c){var b=$.ui.keyCode;
if(c.which===b.SPACE){c.preventDefault()
}}).on("keyup",function(c){var b=$.ui.keyCode;
if(c.which===b.SPACE){a.toggle();
c.preventDefault()
}})
},_unbindEvents:function(){this.container.off("mouseover mouseout click");
this.element.off("focus blur keydown keyup")
},toggle:function(){if(this.element.prop("checked")){this.uncheck()
}else{this.check()
}this._trigger("change",null,this.element.prop("checked"))
},check:function(a){this.container.addClass("ui-state-active");
this.label.text(this.options.onLabel);
this.element.prop("checked",true);
if(this.options.onIcon){this.icon.removeClass(this.options.offIcon).addClass(this.options.onIcon)
}if(!a){this.element.trigger("change")
}},uncheck:function(a){this.container.removeClass("ui-state-active");
this.label.html(this.options.offLabel);
this.element.prop("checked",false);
if(this.options.offIcon){this.icon.removeClass(this.options.onIcon).addClass(this.options.offIcon)
}if(!a){this.element.trigger("change")
}},disable:function(){this.element.prop("disabled",true);
this.container.attr("aria-disabled",true);
this.container.addClass("ui-state-disabled").removeClass("ui-state-focus ui-state-hover");
this._unbindEvents()
},enable:function(){this.element.prop("disabled",false);
this.container.attr("aria-disabled",false);
this.container.removeClass("ui-state-disabled");
this._bindEvents()
},isChecked:function(){return this.element.prop("checked")
}})
});