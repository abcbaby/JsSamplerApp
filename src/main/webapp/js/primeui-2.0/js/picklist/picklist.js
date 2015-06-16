$(function(){$.widget("primeui.puipicklist",{options:{effect:"fade",effectSpeed:"fast",sourceCaption:null,targetCaption:null,filter:false,filterFunction:null,filterMatchMode:"startsWith",dragdrop:true,sourceData:null,targetData:null,content:null},_create:function(){this.element.uniqueId().addClass("pui-picklist ui-widget ui-helper-clearfix");
this.inputs=this.element.children("select");
this.items=$();
this.sourceInput=this.inputs.eq(0);
this.targetInput=this.inputs.eq(1);
if(this.options.sourceData){this._populateInputFromData(this.sourceInput,this.options.sourceData)
}if(this.options.targetData){this._populateInputFromData(this.targetInput,this.options.targetData)
}this.sourceList=this._createList(this.sourceInput,"pui-picklist-source",this.options.sourceCaption,this.options.sourceData);
this._createButtons();
this.targetList=this._createList(this.targetInput,"pui-picklist-target",this.options.targetCaption,this.options.targetData);
if(this.options.showSourceControls){this.element.prepend(this._createListControls(this.sourceList))
}if(this.options.showTargetControls){this.element.append(this._createListControls(this.targetList))
}this._bindEvents()
},_populateInputFromData:function(b,d){for(var c=0;
c<d.length;
c++){var a=d[c];
if(a.label){b.append('<option value="'+a.value+'">'+a.label+"</option>")
}else{b.append('<option value="'+a+'">'+a+"</option>")
}}},_createList:function(d,b,c,e){d.wrap('<div class="ui-helper-hidden"></div>');
var a=$('<div class="pui-picklist-listwrapper '+b+'"></div>'),f=$('<ul class="ui-widget-content pui-picklist-list pui-inputtext"></ul>');
if(this.options.filter){a.append('<div class="pui-picklist-filter-container"><input type="text" class="pui-picklist-filter" /><span class="pui-icon fa fa-fw fa-search"></span></div>');
a.find("> .pui-picklist-filter-container > input").puiinputtext()
}if(c){a.append('<div class="pui-picklist-caption ui-widget-header ui-corner-tl ui-corner-tr">'+c+"</div>");
f.addClass("ui-corner-bottom")
}else{f.addClass("ui-corner-all")
}this._populateContainerFromOptions(d,f,e);
a.append(f).appendTo(this.element);
return f
},_populateContainerFromOptions:function(b,h,f){var g=b.children("option");
for(var c=0;
c<g.length;
c++){var a=g.eq(c),e=this.options.content?this.options.content.call(this,f[c]):a.text(),d=$('<li class="pui-picklist-item ui-corner-all">'+e+"</li>").data({"item-label":a.text(),"item-value":a.val()});
this.items=this.items.add(d);
h.append(d)
}},_createButtons:function(){var b=this,a=$('<ul class="pui-picklist-buttons"></ul>');
a.append(this._createButton("fa-angle-right","pui-picklist-button-add",function(){b._add()
})).append(this._createButton("fa-angle-double-right","pui-picklist-button-addall",function(){b._addAll()
})).append(this._createButton("fa-angle-left","pui-picklist-button-remove",function(){b._remove()
})).append(this._createButton("fa-angle-double-left","pui-picklist-button-removeall",function(){b._removeAll()
}));
this.element.append(a)
},_createListControls:function(b){var c=this,a=$('<ul class="pui-picklist-buttons"></ul>');
a.append(this._createButton("fa-angle-up","pui-picklist-button-move-up",function(){c._moveUp(b)
})).append(this._createButton("fa-angle-double-up","pui-picklist-button-move-top",function(){c._moveTop(b)
})).append(this._createButton("fa-angle-down","pui-picklist-button-move-down",function(){c._moveDown(b)
})).append(this._createButton("fa-angle-double-down","pui-picklist-button-move-bottom",function(){c._moveBottom(b)
}));
return a
},_createButton:function(d,a,c){var b=$('<button class="'+a+'" type="button"></button>').puibutton({icon:d,click:function(){c();
$(this).removeClass("ui-state-hover ui-state-focus")
}});
return b
},_bindEvents:function(){var a=this;
this.items.on("mouseover.puipicklist",function(c){var b=$(this);
if(!b.hasClass("ui-state-highlight")){$(this).addClass("ui-state-hover")
}}).on("mouseout.puipicklist",function(b){$(this).removeClass("ui-state-hover")
}).on("click.puipicklist",function(d){var k=$(this),f=(d.metaKey||d.ctrlKey);
if(!d.shiftKey){if(!f){a.unselectAll()
}if(f&&k.hasClass("ui-state-highlight")){a.unselectItem(k)
}else{a.selectItem(k);
a.cursorItem=k
}}else{a.unselectAll();
if(a.cursorItem&&(a.cursorItem.parent().is(k.parent()))){var g=k.index(),l=a.cursorItem.index(),j=(g>l)?l:g,c=(g>l)?(g+1):(l+1),h=k.parent();
for(var b=j;
b<c;
b++){a.selectItem(h.children("li.ui-picklist-item").eq(b))
}}else{a.selectItem(k);
a.cursorItem=k
}}}).on("dblclick.pickList",function(){var b=$(this);
if($(this).closest(".pui-picklist-listwrapper").hasClass("pui-picklist-source")){a._transfer(b,a.sourceList,a.targetList,"dblclick")
}else{a._transfer(b,a.targetList,a.sourceList,"dblclick")
}PUI.clearSelection()
});
if(this.options.filter){this._setupFilterMatcher();
this.element.find("> .pui-picklist-source > .pui-picklist-filter-container > input").on("keyup",function(b){a._filter(this.value,a.sourceList)
});
this.element.find("> .pui-picklist-target > .pui-picklist-filter-container > input").on("keyup",function(b){a._filter(this.value,a.targetList)
})
}if(this.options.dragdrop){this.element.find("> .pui-picklist-listwrapper > ul.pui-picklist-list").sortable({cancel:".ui-state-disabled",connectWith:"#"+this.element.attr("id")+" .pui-picklist-list",revert:true,containment:this.element,update:function(b,c){a.unselectItem(c.item);
a._saveState()
},receive:function(b,c){a._triggerTransferEvent(c.item,c.sender,c.item.closest("ul.pui-picklist-list"),"dragdrop")
}})
}},selectItem:function(a){a.removeClass("ui-state-hover").addClass("ui-state-highlight")
},unselectItem:function(a){a.removeClass("ui-state-highlight")
},unselectAll:function(){var b=this.items.filter(".ui-state-highlight");
for(var a=0;
a<b.length;
a++){this.unselectItem(b.eq(a))
}},_add:function(){var a=this.sourceList.children("li.pui-picklist-item.ui-state-highlight");
this._transfer(a,this.sourceList,this.targetList,"command")
},_addAll:function(){var a=this.sourceList.children("li.pui-picklist-item:visible:not(.ui-state-disabled)");
this._transfer(a,this.sourceList,this.targetList,"command")
},_remove:function(){var a=this.targetList.children("li.pui-picklist-item.ui-state-highlight");
this._transfer(a,this.targetList,this.sourceList,"command")
},_removeAll:function(){var a=this.targetList.children("li.pui-picklist-item:visible:not(.ui-state-disabled)");
this._transfer(a,this.targetList,this.sourceList,"command")
},_moveUp:function(e){var f=this,d=f.options.effect,b=e.children(".ui-state-highlight"),a=b.length,c=0;
b.each(function(){var g=$(this);
if(!g.is(":first-child")){if(d){g.hide(f.options.effect,{},f.options.effectSpeed,function(){g.insertBefore(g.prev()).show(f.options.effect,{},f.options.effectSpeed,function(){c++;
if(c===a){f._saveState()
}})
})
}else{g.hide().insertBefore(g.prev()).show()
}}});
if(!d){this._saveState()
}},_moveTop:function(e){var f=this,d=f.options.effect,b=e.children(".ui-state-highlight"),a=b.length,c=0;
e.children(".ui-state-highlight").each(function(){var g=$(this);
if(!g.is(":first-child")){if(d){g.hide(f.options.effect,{},f.options.effectSpeed,function(){g.prependTo(g.parent()).show(f.options.effect,{},f.options.effectSpeed,function(){c++;
if(c===a){f._saveState()
}})
})
}else{g.hide().prependTo(g.parent()).show()
}}});
if(!d){this._saveState()
}},_moveDown:function(e){var f=this,d=f.options.effect,b=e.children(".ui-state-highlight"),a=b.length,c=0;
$(e.children(".ui-state-highlight").get().reverse()).each(function(){var g=$(this);
if(!g.is(":last-child")){if(d){g.hide(f.options.effect,{},f.options.effectSpeed,function(){g.insertAfter(g.next()).show(f.options.effect,{},f.options.effectSpeed,function(){c++;
if(c===a){f._saveState()
}})
})
}else{g.hide().insertAfter(g.next()).show()
}}});
if(!d){this._saveState()
}},_moveBottom:function(e){var f=this,d=f.options.effect,b=e.children(".ui-state-highlight"),a=b.length,c=0;
e.children(".ui-state-highlight").each(function(){var g=$(this);
if(!g.is(":last-child")){if(d){g.hide(f.options.effect,{},f.options.effectSpeed,function(){g.appendTo(g.parent()).show(f.options.effect,{},f.options.effectSpeed,function(){c++;
if(c===a){f._saveState()
}})
})
}else{g.hide().appendTo(g.parent()).show()
}}});
if(!d){this._saveState()
}},_transfer:function(b,g,f,d){var e=this,a=b.length,c=0;
if(this.options.effect){b.hide(this.options.effect,{},this.options.effectSpeed,function(){var h=$(this);
e.unselectItem(h);
h.appendTo(f).show(e.options.effect,{},e.options.effectSpeed,function(){c++;
if(c===a){e._saveState();
e._triggerTransferEvent(b,g,f,d)
}})
})
}else{b.hide().removeClass("ui-state-highlight ui-state-hover").appendTo(f).show();
this._saveState();
this._triggerTransferEvent(b,g,f,d)
}},_triggerTransferEvent:function(a,e,d,b){var c={};
c.items=a;
c.from=e;
c.to=d;
c.type=b;
this._trigger("transfer",null,c)
},_saveState:function(){this.sourceInput.children().remove();
this.targetInput.children().remove();
this._generateItems(this.sourceList,this.sourceInput);
this._generateItems(this.targetList,this.targetInput);
this.cursorItem=null
},_generateItems:function(b,a){b.children(".pui-picklist-item").each(function(){var d=$(this),e=d.data("item-value"),c=d.data("item-label");
a.append('<option value="'+e+'" selected="selected">'+c+"</option>")
})
},_setupFilterMatcher:function(){this.filterMatchers={startsWith:this._startsWithFilter,contains:this._containsFilter,endsWith:this._endsWithFilter,custom:this.options.filterFunction};
this.filterMatcher=this.filterMatchers[this.options.filterMatchMode]
},_filter:function(f,e){var g=$.trim(f).toLowerCase(),a=e.children("li.pui-picklist-item");
if(g===""){a.filter(":hidden").show()
}else{for(var b=0;
b<a.length;
b++){var d=a.eq(b),c=d.data("item-label");
if(this.filterMatcher(c,g)){d.show()
}else{d.hide()
}}}},_startsWithFilter:function(b,a){return b.toLowerCase().indexOf(a)===0
},_containsFilter:function(b,a){return b.toLowerCase().indexOf(a)!==-1
},_endsWithFilter:function(b,a){return b.indexOf(a,b.length-a.length)!==-1
},_setOption:function(a,b){$.Widget.prototype._setOption.apply(this,arguments);
if(a==="sourceData"){this._setOptionData(this.sourceInput,this.sourceList,this.options.sourceData)
}if(a==="targetData"){this._setOptionData(this.targetInput,this.targetList,this.options.targetData)
}},_setOptionData:function(a,c,b){a.empty();
c.empty();
this._populateInputFromData(a,b);
this._populateContainerFromOptions(a,c,b);
this._bindEvents()
},_unbindEvents:function(){this.items.off("mouseover.puipicklist mouseout.puipicklist click.puipicklist dblclick.pickList")
},disable:function(){this._unbindEvents();
this.items.addClass("ui-state-disabled");
this.element.find(".pui-picklist-buttons > button").each(function(a,b){$(b).puibutton("disable")
})
},enable:function(){this._bindEvents();
this.items.removeClass("ui-state-disabled");
this.element.find(".pui-picklist-buttons > button").each(function(a,b){$(b).puibutton("enable")
})
}})
});