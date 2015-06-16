$(function(){$.widget("primeui.puidatagrid",{options:{columns:3,datasource:null,paginator:null,header:null,footer:null,content:null,lazy:false},_create:function(){this.id=this.element.attr("id");
if(!this.id){this.id=this.element.uniqueId().attr("id")
}this.element.addClass("pui-datagrid ui-widget");
if(this.options.header){this.element.append('<div class="pui-datagrid-header ui-widget-header ui-corner-top">'+this.options.header+"</div>")
}this.content=$('<div class="pui-datagrid-content ui-widget-content pui-grid pui-grid-responsive"></div>').appendTo(this.element);
if(this.options.footer){this.element.append('<div class="pui-datagrid-footer ui-widget-header ui-corner-top">'+this.options.footer+"</div>")
}if(this.options.datasource){this._initDatasource()
}},_onDataInit:function(a){this._onDataUpdate(a);
this._initPaginator()
},_onDataUpdate:function(a){this.data=a;
if(!this.data){this.data=[]
}this._renderData()
},_onLazyLoad:function(a){this._onDataUpdate(a)
},paginate:function(){if(this.options.lazy){this.options.datasource.call(this,this._onLazyLoad,this._createStateMeta())
}else{this._renderData()
}},_renderData:function(){if(this.data){this.content.html("");
var d=this._getFirst(),h=this.options.lazy?0:d,e=this._getRows(),g=null;
for(var c=h;
c<(h+e);
c++){var f=this.data[c];
if(f){if(c%this.options.columns===0){g=$('<div class="pui-grid-row"></div>').appendTo(this.content)
}var a=$('<div class="pui-datagrid-column '+PUI.getGridColumn(this.options.columns)+'"></div>').appendTo(g),b=this.options.content.call(this,f);
a.append(b)
}}}},_getFirst:function(){if(this.paginator){var b=this.paginator.puipaginator("option","page"),a=this.paginator.puipaginator("option","rows");
return(b*a)
}else{return 0
}},_getRows:function(){if(this.options.paginator){return this.paginator?this.paginator.puipaginator("option","rows"):this.options.paginator.rows
}else{return this.data?this.data.length:0
}},_createStateMeta:function(){var a={first:this._getFirst(),rows:this._getRows()};
return a
},_initPaginator:function(){var a=this;
if(this.options.paginator){this.options.paginator.paginate=function(b,c){a.paginate()
};
this.options.paginator.totalRecords=this.options.paginator.totalRecords||this.data.length;
this.paginator=$("<div></div>").insertAfter(this.content).puipaginator(this.options.paginator)
}},_initDatasource:function(){if($.isArray(this.options.datasource)){this._onDataInit(this.options.datasource)
}else{if($.type(this.options.datasource)==="function"){if(this.options.lazy){this.options.datasource.call(this,this._onDataInit,{first:0,rows:this._getRows()})
}else{this.options.datasource.call(this,this._onDataInit)
}}}},_updateDatasource:function(a){this.options.datasource=a;
if(this.paginator){this.paginator.puipaginator("page",0,true)
}if($.isArray(this.options.datasource)){this._onDataUpdate(this.options.datasource)
}else{if($.type(this.options.datasource)==="function"){if(this.options.lazy){this.options.datasource.call(this,this._onDataUpdate,{first:0,rows:this._getRows()})
}else{this.options.datasource.call(this,this._onDataUpdate)
}}}},_setOption:function(a,b){if(a==="datasource"){this._updateDatasource(b)
}else{$.Widget.prototype._setOption.apply(this,arguments)
}}})
});