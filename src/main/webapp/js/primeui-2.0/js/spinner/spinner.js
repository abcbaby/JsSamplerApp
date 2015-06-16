$(function(){$.widget("primeui.puispinner",{options:{step:1},_create:function(){var a=this.element,b=a.prop("disabled");
a.puiinputtext().addClass("pui-spinner-input").wrap('<span class="pui-spinner ui-widget ui-corner-all" />');
this.wrapper=a.parent();
this.wrapper.append('<a class="pui-spinner-button pui-spinner-up ui-corner-tr ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="pui-icon fa fa-fw fa-caret-up"></span></span></a><a class="pui-spinner-button pui-spinner-down ui-corner-br ui-button ui-widget ui-state-default ui-button-text-only"><span class="ui-button-text"><span class="pui-icon fa fa-fw fa-caret-down"></span></span></a>');
this.upButton=this.wrapper.children("a.pui-spinner-up");
this.downButton=this.wrapper.children("a.pui-spinner-down");
this.options.step=this.options.step||1;
if(parseInt(this.options.step,10)===0){this.options.precision=this.options.step.toString().split(/[,]|[.]/)[1].length
}this._initValue();
if(!b&&!a.prop("readonly")){this._bindEvents()
}if(b){this.wrapper.addClass("ui-state-disabled")
}a.attr({role:"spinner","aria-multiline":false,"aria-valuenow":this.value});
if(this.options.min!==undefined){a.attr("aria-valuemin",this.options.min)
}if(this.options.max!==undefined){a.attr("aria-valuemax",this.options.max)
}if(a.prop("disabled")){a.attr("aria-disabled",true)
}if(a.prop("readonly")){a.attr("aria-readonly",true)
}},_bindEvents:function(){var a=this;
this.wrapper.children(".pui-spinner-button").mouseover(function(){$(this).addClass("ui-state-hover")
}).mouseout(function(){$(this).removeClass("ui-state-hover ui-state-active");
if(a.timer){window.clearInterval(a.timer)
}}).mouseup(function(){window.clearInterval(a.timer);
$(this).removeClass("ui-state-active").addClass("ui-state-hover")
}).mousedown(function(d){var c=$(this),b=c.hasClass("pui-spinner-up")?1:-1;
c.removeClass("ui-state-hover").addClass("ui-state-active");
if(a.element.is(":not(:focus)")){a.element.focus()
}a._repeat(null,b);
d.preventDefault()
});
this.element.keydown(function(c){var b=$.ui.keyCode;
switch(c.which){case b.UP:a._spin(a.options.step);
break;
case b.DOWN:a._spin(-1*a.options.step);
break;
default:break
}}).keyup(function(){a._updateValue()
}).blur(function(){a._format()
}).focus(function(){a.element.val(a.value)
});
this.element.bind("mousewheel",function(b,c){if(a.element.is(":focus")){if(c>0){a._spin(a.options.step)
}else{a._spin(-1*a.options.step)
}return false
}})
},_repeat:function(a,b){var d=this,c=a||500;
window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){d._repeat(40,b)
},c);
this._spin(this.options.step*b)
},_toFixed:function(c,a){var b=Math.pow(10,a||0);
return String(Math.round(c*b)/b)
},_spin:function(b){var c,a=this.value?this.value:0;
if(this.options.precision){c=parseFloat(this._toFixed(a+b,this.options.precision))
}else{c=parseInt(a+b,10)
}if(this.options.min!==undefined&&c<this.options.min){c=this.options.min
}if(this.options.max!==undefined&&c>this.options.max){c=this.options.max
}this.element.val(c).attr("aria-valuenow",c);
this.value=c;
this.element.trigger("change")
},_updateValue:function(){var a=this.element.val();
if(a===""){if(this.options.min!==undefined){this.value=this.options.min
}else{this.value=0
}}else{if(this.options.step){a=parseFloat(a)
}else{a=parseInt(a,10)
}if(!isNaN(a)){this.value=a
}}},_initValue:function(){var a=this.element.val();
if(a===""){if(this.options.min!==undefined){this.value=this.options.min
}else{this.value=0
}}else{if(this.options.prefix){a=a.split(this.options.prefix)[1]
}if(this.options.suffix){a=a.split(this.options.suffix)[0]
}if(this.options.step){this.value=parseFloat(a)
}else{this.value=parseInt(a,10)
}}},_format:function(){var a=this.value;
if(this.options.prefix){a=this.options.prefix+a
}if(this.options.suffix){a=a+this.options.suffix
}this.element.val(a)
},_unbindEvents:function(){this.wrapper.children(".pui-spinner-button").off();
this.element.off()
},enable:function(){this.wrapper.removeClass("ui-state-disabled");
this.element.puiinputtext("enable");
this._bindEvents()
},disable:function(){this.wrapper.addClass("ui-state-disabled");
this.element.puiinputtext("disable");
this._unbindEvents()
}})
});