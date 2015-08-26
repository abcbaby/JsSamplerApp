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
		var query = $(event.currentTarget).data('see-also-query');
		var rows = $('#laRows').val();
		
		var postData = {
			"query": query,
		    "start": 0,
		    "rows": rows,
		    "matchAll": true,
		    "newSearch": true
		};
		if ($("#laFilterQuery").val()) {
			postData.filterQuery = { "AFI__DOC_TYPE_t": [ $("#laFilterQuery").val() ] };
		}
		if ($("#laFacet").val()) {
			postData.facet = true;
			postData.facetMethod = "fc";
			postData.facetField = $("#laFacet").val();
		}
		ALERT.info("Retrieving " + rows + " document(s) with query, " + query, linkAnalysisVar.statusTimeout);
		search(postData);
		
		this.bootBoxModal.modal('hide');
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
		this.render();
	},
	events : {
		'click #laColorBtn' : 'colorLegend',
		'click #laI2ExportBtn' : 'i2Export',
		'click #laI2XmlExportBtn' : 'i2XmlExport',
		'click #laClearBtn' : 'clear',
		'click #laSearchBtn' : 'search',
		'click .highlighting' : 'highlightClick',
		'click .freezing' : 'freezeClick',
		'mouseover .heirarchy' : 'heirarchyHover',
		'click .heirarchy' : 'heirarchyClick',
		'click .stretching' : 'stretchClick',
		'click .entityType' : 'selectEntity'
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
	},
	i2Export: function() {
		if (linkAnalysisVar.i2Disabled) {
			bootbox.dialog({
				title: "Notice!",
				message: "Export to i2 is disabled after any subsequent search!"
			});
		} else {
			bootbox.dialog({
				title: "Notice!",
				message: "i2 Viewer only support 32-Bit Java JRE. If you do not have it, please use the 'i2 iXv (XML)' option to manually download and import you data.",
				buttons: {
					main: {
						label: "OK",
						className: "btn-primary",
						callback: function() {
		            		var queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1)
		            		window.location.href = "/search/api/linkanalysis/i2export.jnlp?search=" + getUrlVars().origin;
		            	}
					}
				}
			});
		}
	},
	i2XmlExport: function() {
		if (linkAnalysisVar.i2Disabled) {
			bootbox.dialog({
				title: "Notice!",
				message: "Export to i2 is disabled after any subsequent search!"
			});
		} else {
			var queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1)
			window.location.href = "/search/api/linkanalysis/i2download?search=" + getUrlVars().origin;
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
		linkAnalysisVar.edgeLength = stretchValue === "EXPAND" 
			? (linkAnalysisVar.edgeLength + linkAnalysisVar.edgeStep)
			: (linkAnalysisVar.edgeLength - linkAnalysisVar.edgeStep);
		if (linkAnalysisVar.edgeLength >= linkAnalysisVar.minEdgeLength && linkAnalysisVar.edgeLength <= linkAnalysisVar.maxEdgeLength) {
			linkAnalysisVar.network.setOptions({edges: {length: linkAnalysisVar.edgeLength}});
		} else {
			ALERT.warning("Cannot " + stretchValue.toLowerCase() + " any further.", linkAnalysisVar.statusTimeout);
		}
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
		//var qry = this.$el.find('#laSearchTxt').val().trim();
		var qry = "test";
		if (qry == '') {
			ALERT.info("Please enter a search", linkAnalysisVar.statusTimeout);
		} else {
			this.model.set('query', qry); 
			this.model.set('rows', this.$el.find('#laRows').val()); 
			var postData = {
					"query": this.model.get('query'),
					"start": this.model.get('start'),
					"rows": this.model.get('rows'),
					"matchAll": true,
					"newSearch": true
			};
			if ($("#laFilterQuery").val() || this.model.get("filterQuery") !== '') {
				postData.filterQuery = {};
				postData.filterQuery[$("#laFacet").val()] = [$("#laFilterQuery").val() 
					? $("#laFilterQuery").val() 
					: this.model.get("filterQuery")];
			}
			if ($("#laFacet").val()) {
				postData.facet = true;
				postData.facetMethod = "fc";
				postData.facetField = $("#laFacet").val();
			}
			ALERT.info("Retrieving " + this.model.get('rows') + " document(s) with query, " + this.model.get('query'), linkAnalysisVar.statusTimeout);
			search(postData);
		}
	},
	render : function () {
		this.$el.find('#laSearchTxt').val(decodeURI(this.model.get('query')));
		
		var theTemplateScript = $("#hb-rows").html();
		var theTemplate = Handlebars.compile(theTemplateScript);
		var availableRows = [1, 5, 10, 15, 20];
		if (_.indexOf(availableRows, parseInt(this.model.get('rows'))) == -1) {
			availableRows.push(this.model.get('rows'));
		}
		var content  = { rows : availableRows };
		var compiledHtml = theTemplate(content);
		
		this.$el.find('#laRows').html(compiledHtml);
		$('#laRows').val(this.model.get('rows'));
	}
});

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    _.each(hashes, function(item) {
        hash = item.split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    });
    return vars;
}

function loadJson(url) {
	var jsonData;
	$.ajax({
		type : "GET",
		url : url,
		async : false,
		beforeSend : function(x) {
			if (x && x.overrideMimeType) {
				x.overrideMimeType("application/j-son;charset=UTF-8");
			}
		},
		dataType : "json",
		success : function(data) {
			jsonData = data;
		}
	});

	return jsonData;
}

function search(postData) {
	postData.maxRowsOverride = true; // lift default max row restriction
	$.ajax({
		type : "POST",
		url : "/search/api/linkanalysis/documents",
		async : false,
		contentType:"application/json; charset=utf-8",
		dataType : "json",
		data : JSON.stringify(postData),
		beforeSend: function() {
			ALERT.status("Loading...");
		},
		error: function() {
			var jsonData = linkAnalysisVar.loadAlready ? loadJson("/network/addedData.json") : loadJson("/network/data.json");
			linkAnalysisVar.loadAlready = true;
			syncNetwork(jsonData);
		},
		success : function(jsonData) {
			syncNetwork(jsonData);
		}
	});
	ALERT.clearStatus();
	linkAnalysisVar.i2Disabled = true;
}

function syncNetwork(jsonData) {
	var newNodes = [];
	var newEdges = [];
	// don't bring in nodes/edges that has already been removed by user
	_.each(jsonData.nodes, function(it) {
		if (linkAnalysisVar.nodesDeleted.get(it.id) == null) {
			newNodes.push(it);
		}
	})
	_.each(jsonData.edges, function(it) {
		if (linkAnalysisVar.edgesDeleted.get(it.id) == null) {
			newEdges.push(it);
		}
	})
	
	var newNodes2 = [];
	var newEdges2 = [];
	// don't bring in nodes/edges that already exists
	_.each(newNodes, function(it) {
		if (linkAnalysisVar.nodes.get(it.id) == null) {
			newNodes2.push(it);
		}
	})
	_.each(newEdges, function(it) {
		if (linkAnalysisVar.edges.get(it.id) == null) {
			newEdges2.push(it);
		}
	})
	
	if (!_.isEmpty(newNodes2) || !_.isEmpty(newEdges2)) {
		if (!_.isEmpty(newNodes2)) {
			// add unique entities to display in legend
			_.forEach(newNodes2, function(item) {
				var foundEntity = _.find(linkAnalysisVar.entityList, function(it) {
					return it["image"] === item["image"];
				});
				
				if (_.isUndefined(foundEntity)) {
					linkAnalysisVar.entityList.push({
						type: item.type,
						image: item.image
					});
				}
			})

			linkAnalysisVar.nodes.update(newNodes2);
		}
		if (!_.isEmpty(newEdges2)) {
			var newEdgesGrp = _.forEach(newEdges2, function(item) {
				var ds = getDataSourceName(item[linkAnalysisVar.docId]);
				var dsColor = _.find(linkAnalysisVar.dsColors, function(it) { 
					return it.group === ds; 
				})
				if (_.isUndefined(dsColor)) {
					var colorObj = getGroupColor(ds);
					dsColor = {
						group: ds,
						colorObj: colorObj,
						color: colorObj.hex
					}
					linkAnalysisVar.dsColors.push(dsColor);
				}
				
				$.extend(true, item, dsColor);
			})
			linkAnalysisVar.edges.update(newEdgesGrp);
		}

		updateColorLegend();
		updateEntityLegend();
		
		reCluster();
	}
}

function getDataSourceName(sourceAfiDocId) {
	var ds = "unknown";
	if (!_.isNull(sourceAfiDocId) && !_.isUndefined(sourceAfiDocId)) {
		var srcId = (_.isArray(sourceAfiDocId) ? sourceAfiDocId[0] : sourceAfiDocId).split('|');
		ds = srcId[1];
	}
	return ds;
}

function getGroupColor(grpName) {
	var color = _.find(linkAnalysisVar.dsColors, function(item) { 
		return item.group === grpName; 
	});
	
	if (_.isUndefined(color)) {
		color = randomDarkColor();
		while (true) {
			var obj = _.find(linkAnalysisVar.dsColors, function(item) { 
				return item.colorObj.hex === color.hex; 
			});
			if (_.isUndefined(obj)) {
				break;
			} else {
				color = randomDarkColor();
			}
		}
	}
	
	return color;
}

function updateColorLegend() {
	theTemplateScript = $("#hb-color-legend").html();
	theTemplate = Handlebars.compile(theTemplateScript);
	content  = { dsColors: linkAnalysisVar.dsColors };
	compiledHtml = theTemplate(content);
	$("#colorLegendPanelId").html(compiledHtml);
}

function updateEntityLegend() {
	theTemplateScript = $("#hb-entity-legend").html();
	theTemplate = Handlebars.compile(theTemplateScript);
	content  = { entityList: linkAnalysisVar.entityList };
	compiledHtml = theTemplate(content);
	$("#entityLegendPanelId").html(compiledHtml);
	
	$('[data-toggle="tooltip"]').tooltip();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function initDraw() {
	linkAnalysisVar.nodes = new vis.DataSet([]);
	linkAnalysisVar.edges = new vis.DataSet([]);
	linkAnalysisVar.nodesDeleted = new vis.DataSet([]);
	linkAnalysisVar.edgesDeleted = new vis.DataSet([]);
	linkAnalysisVar.dsColors = [];
	linkAnalysisVar.customLayout = {};
	linkAnalysisVar.heirarchy = $(".layoutDefault").data('value');
	$(".heirarchy").siblings().css({
		'background-color': linkAnalysisVar.deselectedColor
	});
	$(".layoutDefault").css({
		'background-color': linkAnalysisVar.selectedColor
	});
	refresh();
}

function refresh() {
	draw();
	// put all cluster nodes back
	var allNodes = linkAnalysisVar.nodes.get();
	for (var i = 1; i <= linkAnalysisVar.resolveId; i++) {
		var rId = createResolveId(i);
		var c = linkAnalysisVar.nodes.get(rId);
		if (c != null) {
			loadCluster(c);
		}
	}
}

function draw() {
	linkAnalysisVar.customLayout.randomSeed = 2;
	// height - 2 security banners, navbars, entity length + LA search bar
	var panelHeight = ($(window).height() - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 28 + 100)) + "px";
	var options = {
		layout: linkAnalysisVar.customLayout,
		height: panelHeight,
		interaction: {
			hideEdgesOnDrag: true,
	    	multiselect: true,
	    	navigationButtons: true
	    },
	    nodes: {
	        scaling: {
	            label: {
	                min: 8,
	                max: 30,
	                drawThreshold: 12,
	                maxVisible: 20
	            }
	        },
	    	shadow: true
	    },
        edges: {
            smooth: {
            	type: 'continuous'
            },
			length: linkAnalysisVar.edgeLength
		},
		physics : {
			stabilization: true,
			barnesHut: {
				gravitationalConstant: -2000,
				centralGravity: 0,
				springLength: 100,
				springConstant: 0.1,
				damping: 0.09
			},
			maxVelocity: 25,
			minVelocity: 1,
            timestep: 0.75,
		}
	};

	var data = {
		nodes : linkAnalysisVar.nodes,
		edges : linkAnalysisVar.edges
	};
	linkAnalysisVar.network = new vis.Network(linkAnalysisVar.container[0], data, options);
	
	registerNetworkListeners();

	return linkAnalysisVar.network;
}

function mergeNodesAttributes(selectedNodes, resolveLabelName) {
	var returnObj = {};
	var cloneNode = $.extend(true, {}, selectedNodes[0]); // need to clone, otherwise, will set to actual node
	
	_.forIn(cloneNode, function(value, key) {
		switch (key) {
			case "values":
				var mergedValues = cloneNode.values;
				_.forEach(selectedNodes, function(node, i) {
					if (i !== 0) {
						_.forIn(node.values, function(value, key) {
							if (_.isUndefined(mergedValues[key])) {
								mergedValues[key] = value;
							} else {
								if (_.isArray(mergedValues[key]) || _.isArray(value)) {
									if (_.isArray(mergedValues[key]) && _.isArray(value)) {
										mergedValues[key].concat(value);
									} else if (_.isArray(mergedValues[key])) {
										mergedValues[key].push(value);
									} else if (_.isArray(value)) { // Abraham merged multiple images from diff. src into one
										mergedValues[key] += linkAnalysisVar.mergePropertySeparator + value.join(linkAnalysisVar.mergePropertySeparator);
									}
								} else {
									var elements = mergedValues[key].split(linkAnalysisVar.mergePropertySeparator);
									var existValue = _.find(elements, function (it) { 
										return it === value;
									});
									if (_.isUndefined(existValue)) { // no duplicates
										mergedValues[key] = mergedValues[key] + linkAnalysisVar.mergePropertySeparator + value;
									}
								}
							}
						});
					}
				});
				
				mergedValues.resolveLabel = resolveLabelName;
				
				returnObj[key] = mergedValues;
				break;
			case "seeAlso":
				var mergedSeeAlso = cloneNode.seeAlso;
				_.forEach(selectedNodes, function(node, i) {
					if (i !== 0) {
						var thisSeeAlso = node.seeAlso;
						_.forEach(thisSeeAlso, function(it) {
							var sameSeeAlsoItem = _.find(mergedSeeAlso, function(item) {
								return item.displayValue === it.displayValue;
							});
							
							if (_.isUndefined(sameSeeAlsoItem)) {
								mergedSeeAlso.push(it);
							}
						});
					}
				});
				
				returnObj[key] = mergedSeeAlso;
				break;
		}
	});
	return returnObj;
}

function createClusterNode(selectedNodes, rId, resolveName) {
	var largestNode = _.max(selectedNodes, function(e) {
		return e.size;
	});
	var resolveLabelName = resolveName + ' [' + selectedNodes.length + ']';
	var clusterNode = {
		id: rId, 
		resolveName: resolveName,
		label: resolveLabelName, 
		title: resolveLabelName, 
		type: selectedNodes[0].type, 
		cluster: true,
		size: parseInt(largestNode.size) + 4, 
		shape: "image", 
		image: selectedNodes[0].image
	};
	
	var mergeObj = mergeNodesAttributes(selectedNodes, resolveLabelName);
	_.forIn(mergeObj, function(value, key) {
		clusterNode[key] = value;
	});
	
	return clusterNode;
}

function reCluster() {
	for (var i = 1; i < linkAnalysisVar.resolveId; i++) {
		var rId = createResolveId(i);
		var c = linkAnalysisVar.nodes.get({
		    filter: function (item) {
		    	return item.id === rId;
		    }
		});
		if (c.length === 1) {
			var clusterNode = c[0];
			linkAnalysisVar.network.openCluster(clusterNode.id);
			
			loadCluster(clusterNode);			
		}
	}
}

function loadCluster(cluster) {
	var clusterOptionsByData = {
		joinCondition:function(childOptions) {
			return childOptions[linkAnalysisVar.resolveNameId] == cluster.id;
		},
		clusterNodeProperties: cluster
	}
	linkAnalysisVar.network.cluster(clusterOptionsByData);
}

function isUnfielded(txt) {
	return txt.indexOf(" (UNFIELDED") !== -1;
}

function createResolveId(resolveId) {
	return 'resolveId-' + resolveId;	
}

function highlightNodes() {
	selectNodesFromHighlight();
	var curSelectedNodes = linkAnalysisVar.network.getSelectedNodes();
	var allSelectedNodes = _.union(linkAnalysisVar.selectedNodes, curSelectedNodes);
	var nodeIdsNotClusterd = _.filter(allSelectedNodes, function(nodeId) {
		var node = linkAnalysisVar.nodes.get(nodeId);
		return (_.isUndefined(node[linkAnalysisVar.resolveNameId]) || node[linkAnalysisVar.resolveNameId] == '') ? true : false;
	});
	linkAnalysisVar.network.selectNodes(nodeIdsNotClusterd);
	ALERT.info(nodeIdsNotClusterd.length + " item(s) selected.", linkAnalysisVar.statusTimeout);
}

function selectNodesFromHighlight() {
	var fromX, toX, fromY, toY;
	var nodesIdInDrawing = [];
	var xRange = getStartToEnd(linkAnalysisVar.rect.startX, linkAnalysisVar.rect.w);
	var yRange = getStartToEnd(linkAnalysisVar.rect.startY, linkAnalysisVar.rect.h);
	if (!_.isUndefined(linkAnalysisVar.rect.startX) && !_.isUndefined(linkAnalysisVar.rect.startY)
		&& !_.isUndefined(linkAnalysisVar.rect.w) && !_.isUndefined(linkAnalysisVar.rect.h)) {
		var allNodes = linkAnalysisVar.nodes.get({returnType:"Object"});
		_.each(allNodes, function(curNode) {
			var nodePosition = linkAnalysisVar.network.getPositions([curNode.id]);
			var nodeXY = linkAnalysisVar.network.canvasToDOM({x: nodePosition[curNode.id].x, y: nodePosition[curNode.id].y})
			if (xRange.start <= nodeXY.x && nodeXY.x <= xRange.end
					&& yRange.start <= nodeXY.y && nodeXY.y <= yRange.end) {
				nodesIdInDrawing.push(curNode.id);
			}
		});
	}
	linkAnalysisVar.network.selectNodes(nodesIdInDrawing);
}

function getStartToEnd(start, theLen) {
	return theLen > 0
		? {start: start, end: start + theLen}
		: {start: start + theLen, end: start};
}

function removeSelectedNodes() {
	var selection = linkAnalysisVar.network.getSelection();
	// somehow some selection may have null values, so remove it
	var selectedNodes = _.filter(linkAnalysisVar.nodes.get(selection.nodes), function(item) {
		return item != null;
	});
	bootbox.dialog({
		title : "Remove node(s)",
		message : "Are you sure you want to delete " + selectedNodes.length + " nodes? This action cannot be undone.",
		buttons : {
			main : {
				label : "OK",
				className : "btn-primary",
				callback : function() {
	            	var selection = linkAnalysisVar.network.getSelection();
	            	// somehow some selection may have null values, so remove it
	            	var selectedNodes = _.filter(linkAnalysisVar.nodes.get(selection.nodes), function(item) {
	            		return item != null;
	            	});
	            	var selectedEdges = _.filter(linkAnalysisVar.edges.get(selection.edges), function(item) {
	            		return item != null;
	            	});
	            	linkAnalysisVar.nodesDeleted.update(selectedNodes);
	            	linkAnalysisVar.edgesDeleted.update(selectedEdges);
	            	linkAnalysisVar.nodes.remove(selection.nodes);
	            	linkAnalysisVar.edges.remove(selection.edges);
	            	
	            	// update entity legend
	            	var newEntityList = _.remove(linkAnalysisVar.entityList, function(entity) {
	            		var foundNodes = linkAnalysisVar.nodes.get({
	            			filter: function (item) {
	            				return (item.image === entity.image);
	            			}
	            		});
	            		
	            		return foundNodes.length > 0;
	            	});
	            	
	            	linkAnalysisVar.entityList = newEntityList;
	            	updateEntityLegend();
	            	
	            	if (!_.isEmpty(linkAnalysisVar.nodes.get()) && !_.isUndefined(linkAnalysisVar.network.popup) && !_.isUndefined(linkAnalysisVar.nodes.get()[0])) {
	            		linkAnalysisVar.network.popup.popupTargetId = linkAnalysisVar.nodes.get()[0].id;
	            	}
	            	
	            	linkAnalysisVar.network.unselectAll();
            	}
			}
		}
	});
}

function saveDrawingSurface() {
	var saved = false;
	var canvas = linkAnalysisVar.network.canvas.frame.canvas;
	var ctx = canvas.getContext('2d');
	try {
	    linkAnalysisVar.drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	    saved = true;
	} catch(err) {
	}
	
	return saved;
}

function restoreDrawingSurface(ctx) {
	var restored = false;
	try {
		ctx.putImageData(linkAnalysisVar.drawingSurfaceImageData, 0, 0);
		restored = true;
	} catch(err) {
	}
	return restored;
}

function registerNetworkListeners() {
	linkAnalysisVar.network.on("oncontext", function (e) {
		if (e.nodes.length != 0) {
			linkAnalysisVar.network.selectNodes(e.nodes);
			var selection = linkAnalysisVar.network.getSelection();
			var theTemplateScript = $("#hb-context-menu").html();
			var theTemplate = Handlebars.compile(theTemplateScript);
			var selectedNodes = linkAnalysisVar.nodes.get(e.nodes);
			var hasSameType = false;
			if ( e.nodes.length > 1) {
				var entityType = selectedNodes[0].type;
				hasSameType = _.every(selectedNodes, function(item) {
					return item.type === entityType;
				});
			}
			var canClusterExpand = _.some(e.nodes, function(e) {
				return linkAnalysisVar.network.isCluster(e);
			});
			var content  = {
				oneSelected: e.nodes.length === 1,
				canCluster: hasSameType,
				canClusterExpand: canClusterExpand,
			};
			var compiledHtml = theTemplate(content);
			$("#contextMenu").html(compiledHtml);
			// calculate where to display menu so it does not off screen
			$("#contextMenu").css({
				display: "block",
				left: e.pointer.DOM.x < ($(window).width() / 2)
					? e.pointer.DOM.x + linkAnalysisVar.container.offset().left
					: (e.pointer.DOM.x + linkAnalysisVar.container.offset().left) - $("#contextMenu").width(),
				top: e.pointer.DOM.y < ($(window).height() / 2)
					? e.pointer.DOM.y + linkAnalysisVar.container.offset().top
					: (e.pointer.DOM.y + linkAnalysisVar.container.offset().top) - $("#contextMenu").height()
			});
		}
		return false;
	});
	
	linkAnalysisVar.network.on("click", function() {
		$("#contextMenu").hide();
	});

    linkAnalysisVar.network.on("dragStart", function (params) {
		if (linkAnalysisVar.highlighting) { 
	    	linkAnalysisVar.drag = true;
	    	
			// handles multiple selection w/ Ctrl key
			linkAnalysisVar.selectedNodes = params.event.srcEvent.ctrlKey ? linkAnalysisVar.network.getSelectedNodes() : null;
	    	
			linkAnalysisVar.rect.startX = params.pointer.DOM.x;
			linkAnalysisVar.rect.startY = params.pointer.DOM.y;
			linkAnalysisVar.container[0].style.cursor = "crosshair";
			saveDrawingSurface();
		}
	});
    
    linkAnalysisVar.network.on("dragging", function (params) {
		if (linkAnalysisVar.highlighting && linkAnalysisVar.drag) { 
			var canvas = linkAnalysisVar.network.canvas.frame.canvas;
			var ctx = canvas.getContext('2d');
			linkAnalysisVar.rect.w = params.pointer.DOM.x - linkAnalysisVar.rect.startX;
			linkAnalysisVar.rect.h = params.pointer.DOM.y - linkAnalysisVar.rect.startY ;
			
			if (restoreDrawingSurface(ctx)) {
				drawHighlightRectangle(ctx);
			}
		}
    });
    
    linkAnalysisVar.network.on("dragEnd", function (params) {
		if (linkAnalysisVar.highlighting && linkAnalysisVar.drag) { 
			linkAnalysisVar.container[0].style.cursor = "default";
			var canvas = linkAnalysisVar.network.canvas.frame.canvas;
			var ctx = canvas.getContext('2d');
			linkAnalysisVar.rect.w = params.pointer.DOM.x - linkAnalysisVar.rect.startX;
			linkAnalysisVar.rect.h = params.pointer.DOM.y - linkAnalysisVar.rect.startY ;
			
			if (restoreDrawingSurface(ctx)) {
				highlightNodes();
			} else {
				// if there are icons from diff. domain (e.g from APIS), will get CORS,
				// therefore, have to redraw to let user see what they've selected
				setTimeout(function() {
					drawHighlightRectangle(ctx);
					setTimeout(function() {
						highlightNodes();
					}, 300);
				}, 50);
			}
			linkAnalysisVar.drawingSurfaceImageData = null;
			linkAnalysisVar.drag = false;
		}
    });	
}

function registerPageListeners() {
	// need to disabled right mouse click otherwise, the network right-mouse click menu will not display properly
	document.body.oncontextmenu = function() {return false;}

	$("#contextMenu").on("click", "a", function(e) {
		var selection = linkAnalysisVar.network.getSelection();
		var selectedMenuItem = $(e.target).text();

		switch (selectedMenuItem) {
			case "View Detail":
				// currently removed from menu
				var selectedNodes = linkAnalysisVar.nodes.get(selection.nodes);
				window.open('/search/document/' + selectedNodes[0][linkAnalysisVar.docId],'_blank');
				break;
			case "Remove From Graph":
				removeSelectedNodes();
				break;
			case "Resolve":
        		var selection = linkAnalysisVar.network.getSelection();
				var selectedNodes = _.without(linkAnalysisVar.nodes.get(selection.nodes), null);
	        	linkAnalysisVar.resolveDialogOpen = true;
				bootbox.prompt({
					title : "Enter name for " + selection.nodes.length + " resolved object(s)",
					value : selectedNodes[0].label,
					callback : function(result) {
						if (result !== null) {
		            		var selection = linkAnalysisVar.network.getSelection();
		    				var resolveName = result.trim();
		    				var rId = createResolveId(linkAnalysisVar.resolveId);
		    				var selectedNodes = _.without(linkAnalysisVar.nodes.get(selection.nodes), null);
		    					
		    				_.each(selectedNodes, function(item) {
		    					item[linkAnalysisVar.resolveNameId] = rId;
		    				});

		    				linkAnalysisVar.nodes.update(selectedNodes);
		    				var cluster = createClusterNode(selectedNodes, rId, resolveName);
		    				linkAnalysisVar.nodes.update(cluster);

		    				loadCluster(cluster);
		    				linkAnalysisVar.resolveId++;
		    				linkAnalysisVar.network.unselectAll();
						}
	                	linkAnalysisVar.resolveDialogOpen = false;
					}
				});

				break;
			case "Un-Resolve":
				_.each(selection.nodes, function(item) {
					if (linkAnalysisVar.network.isCluster(item)) {
						var nodesInCluster = linkAnalysisVar.network.getNodesInCluster(item);
						_.each(nodesInCluster, function(it) {
							var node = linkAnalysisVar.nodes.get(it);
							node[linkAnalysisVar.resolveNameId] = '';
							linkAnalysisVar.nodes.update(node);
							node = linkAnalysisVar.nodes.get(it);
						})
						linkAnalysisVar.network.openCluster(item);
						linkAnalysisVar.nodes.remove(item);
					}
				});
				break;
			case "Properties":
				var selectedNodes = linkAnalysisVar.nodes.get(selection.nodes);
				if (!_.isUndefined(selectedNodes[0])) {
					var idStr = selectedNodes[0]['id'].replace(/[^a-z\d]/gi, '-').toLowerCase();
					var dialogId = idStr + "-dialog";
					
					if($("#" + dialogId).length == 0) {
						var theTemplateScript = $("#hb-properties-dialog").html();
						var theTemplate = Handlebars.compile(theTemplateScript);
						var content  = {
							dialogId: dialogId,
							selectedNode: selectedNodes[0]
						};
						var compiledHtml = theTemplate(content);
						
						$("#propertiesDialogs").append(compiledHtml);
						
					    $("#" + dialogId).puidialog({
					        showEffect: 'fade',
					        hideEffect: 'fade',
					        width: 700,
					        height: 600,
					        minimizable: true,
					        maximizable: false,
					        draggable: true,
					        responsive: true,
					        modal: false,
					    });
					    
					    // put above the classifcation banner when minimizied
					    $(".pui-dialog-docking-zone").css({
					        bottom: "25px"
					    });
					}
				    
				    $("#" + dialogId).puidialog('show');
				}
				break;
			case "See Also":
				var selectedNodes = linkAnalysisVar.nodes.get(selection.nodes);
				if (!_.isUndefined(selectedNodes[0])) {
					var idStr = selectedNodes[0]['id'].replace(/[^a-z\d]/gi, '-').toLowerCase();
					var seeAlsoList = selectedNodes[0].seeAlso;
					
					var theTemplateScript = $("#hb-see-also").html();
					var theTemplate = Handlebars.compile(theTemplateScript);
					var content  = {
						seeAlso: seeAlsoList,
					};
					var compiledHtml = theTemplate(content);
					var bootBoxModal = bootbox.dialog({
						title: "See Also for " + idStr,
						message: compiledHtml
					});
					
					new LinkAnalysisSeeAlsoView(bootBoxModal);
				}
				break;
		}
		if (selectedMenuItem != "Resolve"
			&& selectedMenuItem != "Remove From Graph") {
			linkAnalysisVar.network.unselectAll();
		}
		$("#contextMenu").hide();
	});
    
	$(document).keyup(function(e){
	    if (e.keyCode == 46 && !linkAnalysisVar.resolveDialogOpen) { // delete button pressed
	    	removeSelectedNodes();
	    }
	}) 
}

function drawHighlightRectangle(ctx) {
	ctx.setLineDash([5]);
	ctx.strokeStyle = "rgb(0, 102, 0)";
	ctx.strokeRect(linkAnalysisVar.rect.startX, linkAnalysisVar.rect.startY, linkAnalysisVar.rect.w, linkAnalysisVar.rect.h);
	ctx.setLineDash([]);
	ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
	ctx.fillRect(linkAnalysisVar.rect.startX, linkAnalysisVar.rect.startY, linkAnalysisVar.rect.w, linkAnalysisVar.rect.h);
}

function randomDarkColor() {
	var color = linkAnalysisVar.colors[Math.floor(Math.random() * (linkAnalysisVar.colors.length - 0)) + 0];
	while (!isDarkColor(color.hex)) {
		color = linkAnalysisVar.colors[Math.floor(Math.random() * (linkAnalysisVar.colors.length - 0)) + 0];
	}
	
	return color;
}

function isDarkColor(hexColor) {
	var rgb = hexToRgb(hexColor);
    var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) /1000);
    
    return o > 192 ? false : true;
}

var linkAnalysisVar = {
	cssColors: loadJson("/js/css-color-names.json"),
	colors: [],
	entityList: [],
	minEdgeLength: 200,
	maxEdgeLength: 1000,
	edgeStep: 50,
	edgeLength: 250,
	statusTimeout: 500,
	docId: 'sourceAfiDocId',
	resolveId: 1,
	resolveNameId: 'resolveId',
	mergePropertySeparator: '; ',
	i2Disabled: false,
	hoverColor: 'lime',
	selectedColor: 'darkgray',
	deselectedColor: 'transparent',
	drag: false,
	highlighting: false,
	freeze: false,
	heirarchy: $(".layoutDefault").data('value'),
	resolveDialogOpen: false,
	rect: {},
	drawingSurfaceImageData: undefined,
	selectedNodes: undefined, // be careful here since same name use in various places
	container:  $("#network"),
	customLayout: undefined,
	dsColors: undefined,
	laView: undefined,
	nodes: undefined,
	edges: undefined,
	nodesDeleted: undefined,
	edgesDeleted: undefined,
	network: undefined,
	loadAlready: false
};

$(document).ready(function() {
	var queryStr = getUrlVars();
	
	_.mapKeys(linkAnalysisVar.cssColors, function(value, key) {
		linkAnalysisVar.colors.push({name: key, hex: value});
	});

	initDraw();

	new LinkAnalysisDataSourceColorView();
	linkAnalysisVar.laView = new LinkAnalysisView({
		model : new LinkAnalysisModel({ 
			query: queryStr.query,
			start: queryStr.start, 
			rows: queryStr.rows, 
			filterQuery: queryStr.filterQuery,
			facetField: queryStr.facetField 
		})
	});
	
	linkAnalysisVar.laView.search();
	linkAnalysisVar.laView.model.set('start', '0'); 
	linkAnalysisVar.laView.model.set('filterQuery', ''); 
	
	linkAnalysisVar.i2Disabled = false;

	registerPageListeners();
	
	if (linkAnalysisVar.nodes.length == 0) {
		ALERT.warning("Data cannot be represented in the chart! Please try again.");
	}

	$("#sidebarItemLinkAnalysis").css('display', 'inline');
});

Handlebars.registerHelper('textColor', function (hexColor) {
	return isDarkColor(hexColor) ? 'white' : 'black';
});	

Handlebars.registerHelper('addDivider', function (index) {
	return index == 0 ? "" : "<li class=\"divider\"></li>";
});	

Handlebars.registerHelper('getProperties', function (obj) {
	var strArray = []; // use array instead of string concat for performance
	strArray.push('<tr>');
	strArray.push('<td>Node ID</td>');
	strArray.push('<td>');
	strArray.push(obj['id']);
	strArray.push('</td>');
	strArray.push('</tr>');
	if (_.startsWith(obj['image'], "data:")) {
		strArray.push('<tr>');
		strArray.push('<td>Image</td>');
		strArray.push('<td><img src="');
		strArray.push(obj['image']);
		strArray.push('" height="200px" width="200px"></td>');
		strArray.push('</tr>');
	}
	_.forIn(obj.values, function(value, key) {
		if (key === "imageContent") {
			strArray.push('<tr>');
			strArray.push('<td>More Image(s):</td>');
			strArray.push('<td>');
			if (typeof value === 'string') {
				strArray.push('<img src="');
				strArray.push(value);
				strArray.push('" height="200px" width="200px">');
			} else {
				_.forEach(value, function(it) {
					strArray.push('<img src="');
					strArray.push(it);
					strArray.push('" height="200px" width="200px"><br/>');
				})
			}
			strArray.push('</td>');
			strArray.push('</tr>');
		} else {
			var name = _.startCase(key);
			strArray.push('<tr>');
			strArray.push('<td>');
			strArray.push(name);
			strArray.push('</td>');
			strArray.push('<td>');
			if (key === linkAnalysisVar.docId) {
				// need to split since this may be a resolved nodes
				var sources;
				if (_.isArray(value)) { // e.g. imageContent
					sources = value;
				} else {
					sources = value.split(linkAnalysisVar.mergePropertySeparator); 
				}
				_.forEach(sources, function(item, i) {
					if (i !== 0) {
						strArray.push(linkAnalysisVar.mergePropertySeparator);
						strArray.push(" ");
					}
					strArray.push("<a target='_blank' href='/search/document/");
					strArray.push(item);
					strArray.push("'>");
					strArray.push(item);
					strArray.push("</a>");
				});
			} else {
				strArray.push(value);
			}
			strArray.push('</td>');
			strArray.push('</tr>');;
		}
	})
	
	return strArray.join("");
});	
	        		
Handlebars.registerHelper('seeAlsoSingleTerm', function(seeAlsoItem, options) {
	return seeAlsoItem.displayValue.search(" ") === -1
		? options.fn(this)
		: options.inverse(this);
});
