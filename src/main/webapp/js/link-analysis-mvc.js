var LinkAnalysisModel = Backbone.Model.extend({
    defaults: {
        query: "",
        start: "0",
        rows: "10",
        filterQuery: "",
    	facetField: ""
    },    
});

var LinkAnalysisSeeAlsoView = Backbone.View.extend({
	el : "#seeAlsoId",
	bootBoxModal: null,
	initialize: function(bootBoxModal){
		this.bootBoxModal = bootBoxModal;
	},
	events : {
		'mouseover .bySeeAlso' : 'hoverSeeAlso',
		'click .bySeeAlso' : 'selectSeeAlso'
	},
	selectSeeAlso: function(event) {
		this.bootBoxModal.modal('hide');
		
		ALERT.status("Loading...");
		
		var query = $(event.currentTarget).data('see-also-query');
		var rows = $('#laRows').val();
		if (!validRows(rows)) {
			ALERT.error("Rows must be between 1 to " + linkAnalysisVar.maxRows + "!", linkAnalysisVar.statusTimeout);
			return;
		}
		
		ALERT.info("Retrieving " + rows + " document(s) with query, " + query, linkAnalysisVar.statusTimeout);
		
		search(getPostData(query, rows, $("#laFilterQuery").val(), $("#laFacet").val()));
	}
});

var LinkAnalysisDataSourceColorView = Backbone.View.extend({
	el : $("#colorLegendPanelId"),
	events : {
		'click .byDS' : 'highLightByDS'
	},
	highLightByDS: function(event) {
		var dsId = $(event.currentTarget).data('ds-id');
		var nodesWithDS = linkAnalysisVar.nodes.get({
		    filter: function (item) {
		    	if (linkAnalysisVar.network.isCluster(item.id)) {
		    		return false;
		    	} else {
					var ds = getDataSourceName(item[linkAnalysisVar.docId]);
					// only return node w/ same DS and NOT in cluster
			    	return ds == dsId && (_.isUndefined(item[linkAnalysisVar.resolveNameId]) || item[linkAnalysisVar.resolveNameId] == '');
		    	}
		    }
		});
		var nodeIds = [];
		_.each(nodesWithDS, function(item) {
			nodeIds.push(item.id);
		})
		linkAnalysisVar.network.selectNodes(nodeIds);
	}
});

var LinkAnalysisView = Backbone.View.extend({
	el : $("#manualSearch"),
	initialize: function(){
		$('.selectable').hover(function() {
			$(this).css('background-color', linkAnalysisVar.hoverColor);
		}, function(){
			$(this).css('background-color', linkAnalysisVar.deselectedColor);
		});
		$('.highlighting').hover(function() {
			$(this).css('background-color', linkAnalysisVar.hoverColor);
		}, function(){
			$(this).css('background-color', linkAnalysisVar.highlighting ? linkAnalysisVar.selectedColor: linkAnalysisVar.deselectedColor);
		});
		$('.freezing').hover(function() {
			$(this).css('background-color', linkAnalysisVar.hoverColor);
		}, function(){
			$(this).css('background-color', linkAnalysisVar.freeze ? linkAnalysisVar.selectedColor: linkAnalysisVar.deselectedColor);
		});
		
		$('[data-toggle="tooltip"]').tooltip();
		
		this.render();
	},
	events : {
		'click #laColorBtn' : 'colorLegend',
		'click #laI2ExportBtn' : 'i2Export',
		'click #laI2VlxExportBtn' : 'i2Export',
		'click #laClearBtn' : 'clear',
		'click #laSearchBtn' : 'search',
		'click #userGuideBtn' : 'launchUserGuide',
		'click .highlighting' : 'highlightClick',
		'click .freezing' : 'freezeClick',
		'mouseover .heirarchy' : 'heirarchyHover',
		'click .heirarchy' : 'heirarchyClick',
		'click .stretching' : 'stretchClick',
		'click .fullscreen' : 'fullScreenClick',
		'click .entityType' : 'selectEntity',
		'click #snapshotSaveBtn' : 'saveSnapshot',
		'click #snapshotListBtn' : 'listSnapshot'
	},
	colorLegend: function() {
		updateColorLegend();
		
		$('#colorLegendId').puidialog({
			width: 300,
			height: 200,
	        resizable: true,
	        minimizable: false,
	        maximizable: false,
	        draggable: true,
	        responsive: true,
	        modal: false
	    });
		$('#colorLegendId').puidialog('show');
		
		$('[data-toggle="tooltip"]').tooltip();
	},
	i2Export: function(event) {		
		if (linkAnalysisVar.nodes.length == 0 && linkAnalysisVar.edges.length == 0) {
			bootbox.dialog({
				title: "Notice!",
				message: "Please add nodes to export."
			});
		}
		else {
			var action = $(event.target).data("action");			
			var nodes = linkAnalysisVar.nodes.get({
				filter: function (item) {
					return !(item.id && item.id.indexOf(linkAnalysisVar.resolveNameId) === 0);
				}
			});
			var edges = linkAnalysisVar.edges.get();			
			var postData = {
						network: {"nodes": nodes, "edges": edges}
					};

			var form = $("#i2ExportForm");
			$(form).attr('action', '/search/api/linkanalysis/' + action);
			$(form).find('input').val(JSON.stringify(postData));
			form.submit();
		}
	},
	clear: function() {
		initDraw();		
		updateColorLegend();
		linkAnalysisVar.entityList = [];
		updateEntityLegend();
	},
	highlightClick: function(e) {
		linkAnalysisVar.highlighting = !linkAnalysisVar.highlighting;
		$(e.currentTarget).css({
			'background-color': linkAnalysisVar.highlighting ? linkAnalysisVar.selectedColor : linkAnalysisVar.deselectedColor
		});
		linkAnalysisVar.network.setOptions({
			interaction: { 
				dragView: !linkAnalysisVar.highlighting, 
				dragNodes: !linkAnalysisVar.highlighting,
				hideEdgesOnDrag: !linkAnalysisVar.highlighting
			}
		});
		
		if (linkAnalysisVar.highlighting) {
			$(".freezing").hide();
		} else {
			$(".freezing").show();
		}
	},
	freezeClick: function(e) {
		linkAnalysisVar.freeze = !linkAnalysisVar.freeze;
		$(e.currentTarget).css({
			'background-color': linkAnalysisVar.freeze ? linkAnalysisVar.selectedColor : linkAnalysisVar.deselectedColor
		});
		linkAnalysisVar.network.setOptions({
			physics: {
				enabled: !linkAnalysisVar.freeze
			}
		});
		
		if(linkAnalysisVar.freeze) {
			$(".links-resize").hide();
		} else {
			$(".links-resize").show();
		}
	},
	heirarchyHover: function(e) {
		var curValue = $(e.currentTarget).data('value');
		$(e.currentTarget).hover(function() {
			$(this).css('background-color', linkAnalysisVar.hoverColor);
		}, function(){
			$(this).css('background-color', curValue === linkAnalysisVar.heirarchy ? linkAnalysisVar.selectedColor: linkAnalysisVar.deselectedColor);
		});
	},
	heirarchyClick: function(e) {
		linkAnalysisVar.heirarchy = $(e.currentTarget).data('value');
		$(e.currentTarget).css({
			'background-color': linkAnalysisVar.selectedColor
		});
		$(e.currentTarget).siblings().css({
			'background-color': linkAnalysisVar.deselectedColor
		});
		if (linkAnalysisVar.heirarchy === $(".layoutDefault").data('value')) {
			linkAnalysisVar.customLayout = {};
		} else {
			linkAnalysisVar.customLayout = { hierarchical: { direction: linkAnalysisVar.heirarchy, levelSeparation: 150 } };
		}
		refresh();
	},
	stretchClick: function(e) {
		var stretchValue = $(e.currentTarget).data('value');
		if (linkAnalysisVar.freeze) {
			ALERT.warning("This feature is disabled!");
		} else {
			linkAnalysisVar.edgeLength = stretchValue === "EXPAND" 
				? (linkAnalysisVar.edgeLength + linkAnalysisVar.edgeStep)
				: (linkAnalysisVar.edgeLength - linkAnalysisVar.edgeStep);
			if (linkAnalysisVar.edgeLength >= linkAnalysisVar.minEdgeLength && linkAnalysisVar.edgeLength <= linkAnalysisVar.maxEdgeLength) {
				linkAnalysisVar.network.setOptions({edges: {length: linkAnalysisVar.edgeLength}});
				ALERT.info("Links length now is " + linkAnalysisVar.edgeLength, linkAnalysisVar.statusTimeout);
			} else {
				linkAnalysisVar.edgeLength = stretchValue === "EXPAND" 
					? linkAnalysisVar.maxEdgeLength
					: linkAnalysisVar.minEdgeLength;
				ALERT.warning("Cannot " + stretchValue.toLowerCase() + " any further.", linkAnalysisVar.statusTimeout);
			}
		}
	},
	fullScreenClick: function(e) {
		$(e.currentTarget).hide();
		$(e.currentTarget).siblings().show();
		
		var isFullScreen = JSON.parse($(e.currentTarget).data('value'));
		if (isFullScreen) {
			linkAnalysisVar.pageSidebarMinified = $(".body-container").hasClass("page-sidebar-minified");
		}
		
		screenfull.toggle($('body')[0]);
	},
	selectEntity: function(e) {
		var entityValue = $(e.currentTarget).data('value');
		var selectedNodes = e.ctrlKey ? linkAnalysisVar.network.getSelectedNodes() : [];
		var nodesWithEntity = linkAnalysisVar.nodes.get({
			filter: function (item) {
				return (item.image === entityValue 
						&& (!item['cluster'] || item['cluster'] === false));
			}
		});
		
		_.forEach(nodesWithEntity, function(item) {
			if (!item[linkAnalysisVar.resolveNameId] || item[linkAnalysisVar.resolveNameId] === '') {
				selectedNodes.push(item.id);
			}
		});
		
		linkAnalysisVar.network.selectNodes(selectedNodes);
		ALERT.info(selectedNodes.length + " item(s) selected.", linkAnalysisVar.statusTimeout);
	},
	search: function() {
		var qry = this.$el.find('#laSearchTxt').val().trim();
		if (qry == '') {
			ALERT.info("Please enter a search", linkAnalysisVar.statusTimeout);
		} else {
			ALERT.status("Loading...");

			var rows = linkAnalysisVar.laView.$el.find('#laRows').val();
			if (!validRows(rows)) {
				ALERT.clearStatus();
				ALERT.error("Rows must be between 1 to " + linkAnalysisVar.maxRows + "!", linkAnalysisVar.statusTimeout);
				return;
			}
			
			linkAnalysisVar.laView.model.set('query', qry); 
			linkAnalysisVar.laView.model.set('rows', rows); 

			ALERT.info("Retrieving " + rows + " document(s) with query, " + linkAnalysisVar.laView.model.get('query'), linkAnalysisVar.statusTimeout);
			search(getPostData(linkAnalysisVar.laView.model.get('query'), 
					rows, 
					$("#laFilterQuery").val() , 
					$("#laFacet").val()));
		}
	},
	launchUserGuide: function() {
		window.location = "/static/html/LinkAnalysis-QRG.docx";
	},
	render : function () {
		//this.$el.find('#laSearchTxt').val(this.model.get('query'));
		this.$el.find('#laSearchTxt').val('test');
		
		var theTemplateScript = $("#hb-rows").html();
		var theTemplate = Handlebars.compile(theTemplateScript);
		var availableRows = [1, 5, 10, 25, 50, linkAnalysisVar.maxRows];
		if (_.indexOf(availableRows, parseInt(this.model.get('rows'))) == -1) {
			availableRows.push(this.model.get('rows'));
		}
		var content  = { 
			rows : availableRows,
			selectedValue: this.model.get('rows')
		};
		var compiledHtml = theTemplate(content);
		this.$el.find('#laRows').html(compiledHtml);
		
		$("#laRows").select2({
			maximumInputLength: 4,
			width: 65,
			multiple: false,
			tags: true,
			matcher: function(params, text) {
				if ($.trim(params.term) === '') {
					return text;
				}
				var retVal = _.startsWith(text.text, params.term.trim()) ? text : null;
				return retVal;
			}
		}).select2("val", this.model.get('rows'));
	},
	saveSnapshot : function () {		
		new SaveSnapshotView();		
	},
	listSnapshot : function () {
		new ListSnapshotView();
	}
});

var LinkAnalysisSnapshotModel = Backbone.Model.extend({
	urlRoot : "/search/api/linkanalysis/snapshot",
	defaults : function() {
		return {
			id : null,
			label : "",
			description : "",
			dateCreated : null,
			userName : "",
			network : {}			
		};
	}
});

var LinkAnalysisSnapshotCollection = Backbone.Collection.extend({
	url : '/search/api/linkanalysis/snapshots',
	model : LinkAnalysisSnapshotModel
});

var SaveSnapshotView = ModalView.extend({

	template : Handlebars.compile($('#hb-link-analysis-snapshot').html()),
	model : new LinkAnalysisSnapshotModel(),
	events : {
		'click .submit' : 'saveSnapshot',
		'keyup #snapshot_name' : 'changeSnapshotName',
		'submit form' : 'onSubmit'
	},	
	initialize : function() {
		this.render();
	},	
	changeSnapshotName : function (event) {
		// del button pressed.  we don't care but we don't want default "removeSelectedNodes" either			
		if (event.keyCode == 46) {				
			event.stopPropagation();
		}
		
		if ($(event.currentTarget).val().trim().length > 0) {
			$('#snapshot_save_btn').removeClass('disabled');
		}
		else {
			$('#snapshot_save_btn').addClass('disabled');
		}
	},
	saveSnapshot : function () {
		console.log("SaveSnapshotView::saveSnapshot");
			
		var nodes = linkAnalysisVar.nodes.get();
		var edges = linkAnalysisVar.edges.get();
		var data = this.$el.find('form').serializeObject();
		
		this.model.clear();
		this.model.set({ 
				"label": data.name, 
				"description": data.description,
				"mapData": {"nodes": nodes, "edges": edges}			
		});
		ALERT.status("Saving...");
		this.model.save(null, {
			success: function (data) {					
				ALERT.info("Save was successful.");
				if (data && data.success && data.success == false) {
					ALERT.error(data.message ? data.message : "Error occuring while saving snapshot.  Contact support if problem persists.");
				}
			},
			error: function(resp) {
				ALERT.error("Error occuring while saving snapshot. Your session may have timed out.");
			},
			done: function() {
				ALERT.clearStatus();
			}
		});			
	},
	onSubmit : function(event) {
		if ($('#snapshot_name').val().trim().length > 0) {
			this.saveSnapshot();
			this.$el.modal('hide');
		}
		
		event.preventDefault();			
	},
	render : function () {
		this.modal(this.template());
	}
});

var ListSnapshotView = ModalView.extend({

	template : Handlebars.compile($('#hb-link-analysis-snapshot-list').html()),
	snapshots : null,
	model : new LinkAnalysisSnapshotCollection(),
	events : {
		'click .snapshot' : 'loadSnapshot',
		'click .removeSnapshot' : 'removeSnapshot'
	},
	initialize : function() {
		var that = this;
		ALERT.status("Loading...");
		this.model.fetch({
			success : function (e) {
				ALERT.clearStatus();
				that.render();
			},
			error: function(e) {
				ALERT.clearStatus();
				ALERT.error("Error trying to load snapshot. Your session may have timed out.")
			}
		});		
	},
	render : function () {
		this.modal(this.template({"snapshots" : this.model.models}));
	},
	loadSnapshot : function (event) {
		var selectedId = $(event.currentTarget).data('snapshot');
		console.log("loadSnapshot id:" + selectedId);
		ALERT.status("Loading...");
		if (selectedId) {				
			var snapshot = new LinkAnalysisSnapshotModel({id:selectedId});
			snapshot.fetch().done(function() {
				if (snapshot.get('network')) {
					var networkStr = snapshot.get('network');
					var network = JSON.parse(networkStr);
					var nodes = network.nodes;
					var edges = network.edges;
					if (nodes && edges) {
						console.log("retrieved snapshot -> " + snapshot.get('label'));
						initDraw(nodes, edges);
					}
				}
				ALERT.clearStatus();
			});
		}
		
		this.$el.modal('hide');
	},
	removeSnapshot : function(event) {
		var selectedId = $(event.currentTarget).data('snapshot');
		console.log("ListSnapshotView::removeSnapshot id:" + selectedId);

		if (selectedId) {
			var modelToRemove = this.model.get(selectedId);
			if (modelToRemove) {					
				modelToRemove.destroy({success : function(model, resp) {
					if (resp && resp.success == true) {
						$(event.target).closest('li').fadeOut();
					}
				}});
			}
		}
	}	
});
