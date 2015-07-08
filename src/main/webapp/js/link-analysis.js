var LinkAnalysisModel = Backbone.Model.extend({
    defaults: {
        query: "",
        start: "0",
        rows: "10",
        filterQuery: "",
    	facetField: ""
    },    
});

var LinkAnalysisDataSourceColorView = Backbone.View.extend({
	el : $("#colorLegendPanelId"),
	events : {
		'click .byDS' : 'highLightByDS'
	},
	highLightByDS: function(event) {
		var dsId = $(event.currentTarget).data('ds-id');
		var nodesWithDS = nodes.get({
		    filter: function (item) {
		    	if (network.isCluster(item.id)) {
		    		return false;
		    	} else {
					var ds = getDataSourceName(item['sourceAfiDocId']);
			    	return ds == dsId;
		    	}
		    }
		});
		var nodeIds = [];
		_.each(nodesWithDS, function(item) {
			nodeIds.push(item.id);
		})
		network.selectNodes(nodeIds);
	}
});

var LinkAnalysisView = Backbone.View.extend({
	el : $("#manualSearch"),
	initialize: function(){
		this.render();
	},
	events : {
		'click #laSearchBtn' : 'search'
	},
	search: function() {
		var qry = this.$el.find('#laSearchTxt').val().trim();
		if (qry == '') {
			ALERT.info("Please enter a search", 250);
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
			if ($("#laFilterQuery").val() || this.model.get("filterQuery")) {
				postData.filterQuery = { "AFI__DOC_TYPE_t": 
					[ $("#laFilterQuery").val() ? $("#laFilterQuery").val() : this.model.get("filterQuery") ] 
				};
			}
			if ($("#laFacet").val()) {
				postData.facet = true;
				postData.facetMethod = "fc";
				postData.facetField = $("#laFacet").val();
			}
			ALERT.info("Retrieving " + this.model.get('rows') + " document(s) with query, " + this.model.get('query'), 250);
			search(postData);
		}
	},
	render : function () {
		//this.$el.find('#laSearchTxt').val(decodeURI(this.model.get('query')));
		$('#laSearchTxt').val('test');
		
		var theTemplateScript = $("#hb-rows").html();
		var theTemplate = Handlebars.compile(theTemplateScript);
		var availableRows = [1, 5, 10, 15, 20];
		if (_.indexOf(availableRows, parseInt(this.model.get('rows'))) == -1) {
			availableRows.push(this.model.get('rows'));
		}
		var content  = { rows : availableRows };
		var compiledHtml = theTemplate(content);
		
		this.$el.find('#laRows').html(compiledHtml);
		$('div.laRows select').val(this.model.get('rows'));
	}
});

var LinkAnalysisOptionsView = Backbone.View.extend({
	el : $("#optionsMenu"),
	events : {
		'click #laClearBtn' : 'clear',
		'click #laColorBtn' : 'colorLegend',
		'click #laI2ExportBtn' : 'i2Export',
		'click #laI2XmlExportBtn' : 'i2XmlExport',
		'click #udBtn' : 'layoutUd',
		'click #duBtn' : 'layoutDu',
		'click #lrBtn' : 'layoutLr',
		'click #rlBtn' : 'layoutRl',
		'click #defaultLayoutBtn' : 'defaultLayout'
	},
	layoutUd: function() {
		customLayout = { hierarchical: { direction: "UD", levelSeparation: 150 } };
		refresh();
		hideOptions();
	},
	layoutDu: function() {
		customLayout = { hierarchical: { direction: "DU", levelSeparation: 150 } };
		refresh();
		hideOptions();
	},
	layoutLr: function() {
		customLayout = { hierarchical: { direction: "LR", levelSeparation: 150 } };
		refresh();
		hideOptions();
	},
	layoutRl: function() {
		customLayout = { hierarchical: { direction: "RL", levelSeparation: 150 } };
		refresh();
		hideOptions();
	},
	defaultLayout: function() {
		customLayout = {};
		refresh();
		hideOptions();
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
		hideOptions();
	},
	clear: function() {
		initDraw();		
		updateColorLegend();
		hideOptions();
	},
	i2Export: function() {
		if (i2Disabled) {
			$('#i2DisabledId').puidialog({
		        resizable: false,
		        minimizable: false,
		        maximizable: false,
		        draggable: false,
		        responsive: true,
		        modal: true
		    });
			$('#i2DisabledId').puidialog('show');
		} else {
			$('#i2NoticeId').puidialog({
		        resizable: false,
		        minimizable: false,
		        maximizable: false,
		        draggable: false,
		        responsive: true,
		        modal: true,
		        buttons: [{
	                text: 'OK',
	                icon: 'fa-check',
	                click: function() {
	                    $('#i2NoticeId').puidialog('hide');
	            		var queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1)
	            		window.location.href = "/search/api/linkanalysis/i2export.jnlp?search=" + getUrlVars().origin;
	                }
	            }]
		    });
			$('#i2NoticeId').puidialog('show');
		}
		hideOptions();
	},
	i2XmlExport: function() {
		if (i2Disabled) {
			$('#i2DisabledId').puidialog({
		        resizable: false,
		        minimizable: false,
		        maximizable: false,
		        draggable: false,
		        responsive: true,
		        modal: true
		    });
			$('#i2DisabledId').puidialog('show');
		} else {
			var queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1)
			window.location.href = "/search/api/linkanalysis/i2download?search=" + getUrlVars().origin;
		}
		hideOptions();
	}
});

function hideOptions() {
	$('#optionsMenu').puitieredmenu('hide');
}

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
			var jsonData = loadAlready ? loadJson("/network/addedData.json") : loadJson("/network/data.json");
			loadAlready = true;
			syncNetwork(jsonData);
		},
		success : function(jsonData) {
			syncNetwork(jsonData);
		}
	});
	ALERT.clearStatus();
	i2Disabled = true;
}

function syncNetwork(jsonData) {
	var newNodes = [];
	var newEdges = [];
	// don't bring in nodes/edges that has already been removed by user
	_.each(jsonData.nodes, function(it) {
		if (nodesDeleted.get(it.id) == null) {
			newNodes.push(it);
		}
	})
	_.each(jsonData.edges, function(it) {
		if (edgesDeleted.get(it.id) == null) {
			newEdges.push(it);
		}
	})
	
	var newNodes2 = [];
	var newEdges2 = [];
	// don't bring in nodes/edges that already exists
	_.each(newNodes, function(it) {
		if (nodes.get(it.id) == null) {
			newNodes2.push(it);
		}
	})
	_.each(newEdges, function(it) {
		if (edges.get(it.id) == null) {
			newEdges2.push(it);
		}
	})
	
	if (!_.isEmpty(newNodes2) || !_.isEmpty(newEdges2)) {
		if (!_.isEmpty(newNodes2)) {
			var newNodesGrp = _.forEach(newNodes2, function(item) {
				var ds = getDataSourceName(item['sourceAfiDocId']);
				var dsColor = _.find(dsColors, function(it) { 
					return it.group === ds; 
				})
				if (_.isUndefined(dsColor)) {
					var colorObj = getGroupColor(ds);
					dsColor = {
						group: ds,
						colorObj: colorObj,
						color: colorObj.hex
					}
					dsColors.push(dsColor);
				}
				
				$.extend(true, item, dsColor);
			})
			nodes.update(newNodesGrp);
			//nodes.update(newNodes2);
		}
		if (!_.isEmpty(newEdges2)) {
			edges.update(newEdges2);
		}

		updateColorLegend();
		
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
	var color = _.find(dsColors, function(item) { 
		return item.group === grpName; 
	});
	
	if (_.isUndefined(color)) {
		var color = colors[Math.floor(Math.random() * colors.length) + 0];
		if (dsColors.length > 1) {
			while (true) {
				if (_.isUndefined(_.find(dsColors, function(item) { 
						return item.color.hex === color.hex; 
					}))) {
					break;
				} else {
					color = colors[Math.floor(Math.random() * colors.length) + 0];
				}
			}
		}
	}
	
	return color;
}

function updateColorLegend() {
	theTemplateScript = $("#hb-color-legend").html();
	theTemplate = Handlebars.compile(theTemplateScript);
	content  = { dsColors: dsColors };
	compiledHtml = theTemplate(content);
	$("#colorLegendPanelId").html(compiledHtml);
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
	nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	nodesDeleted = new vis.DataSet([]);
	edgesDeleted = new vis.DataSet([]);
	dsColors = [];
	customLayout = {};
	refresh();
}

function refresh() {
	draw();
	// put all cluster nodes back
	var allNodes = nodes.get();
	for (var i = 1; i <= resolveId; i++) {
		var rId = createResolveId(i);
		var c = nodes.get(rId);
		if (c != null) {
			loadCluster(c);
		}
	}
}

function draw() {
	customLayout.randomSeed = 2;
	var panelHeight = ($(window).height() - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 50)) + "px";
	var options = {
		layout: customLayout,
		height: panelHeight,
		interaction: {
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
			length: edgeLength
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
			minVelocity: 1
		}
	};

	var data = {
		nodes : nodes,
		edges : edges
	};
	network = new vis.Network(container[0], data, options);
	
	registerNetworkListeners();

	return network;
}

function createClusterNode(selectedNodes, rId, resolveName) {
	var largestNode = _.max(selectedNodes, function(e) {
		return _.isUndefined(e.size)
			? e.font.size
			: e.size;
	});
	var imgSize = parseInt(_.isUndefined(largestNode.size) 
		? largestNode.font.size 
		: largestNode.size) + 4;
	var sameType = _.every(selectedNodes, function(e) {
		// don't compare by type, since person can be suspect or officer, which have diff. image
		return selectedNodes[0].image == e.image;
	});
	return sameType
		? {
			id: rId, 
			resolveName: resolveName,
			label: resolveName + ' [' + selectedNodes.length + ']', 
			title: resolveName + ' [' + selectedNodes.length + ']', 
			type: selectedNodes[0].type, 
			cluster: true,
			size: imgSize, 
			shape: "image", 
			image: selectedNodes[0].image
		}
		: {
			id: rId, 
			resolveName: resolveName,
			label: resolveName + ' [' + selectedNodes.length + ']', 
			title: resolveName + ' [' + selectedNodes.length + ']', 
			type: 'Mixed',
			cluster: true,
			font: {size: imgSize},
			shape: 'box'
		};
}

function reCluster() {
	for (var i = 1; i < resolveId; i++) {
		var rId = createResolveId(i);
		var c = nodes.get({
		    filter: function (item) {
		    	return item.id === rId;
		    }
		});
		if (c.length == 1) {
			var clusterNode = c[0];
			var nodesInClusterIds = network.getNodesInCluster(clusterNode.id);
			network.openCluster(clusterNode.id);
			nodes.remove(clusterNode.id);
			
			var selectedNodes = nodes.get(nodesInClusterIds);

			nodes.update(selectedNodes);
			var cluster = createClusterNode(selectedNodes, rId, clusterNode.resolveName);
			nodes.update(cluster);

			loadCluster(cluster);			
		}
	}
}

function loadCluster(cluster) {
	var clusterOptionsByData = {
		joinCondition:function(childOptions) {
			return childOptions[resolveNameId] == cluster.id;
		},
		clusterNodeProperties: cluster
	}
	network.cluster(clusterOptionsByData);
}

function isUnfielded(txt) {
	return txt.indexOf(" (UNFIELDED") !== -1;
}

function createResolveId(resolveId) {
	return 'resolveId-' + resolveId + "-";	
}

function highlightNodes() {
	selectNodesFromHighlight();
	var curSelectedNodes = network.getSelectedNodes();
	var allSelectedNodes = _.union(selectedNodes, curSelectedNodes);
	var nodeIdsNotClusterd = _.filter(allSelectedNodes, function(nodeId) {
		var node = nodes.get(nodeId);
		return (_.isUndefined(node[resolveNameId]) || node[resolveNameId] == '') ? true : false;
	});
	network.selectNodes(nodeIdsNotClusterd);
	ALERT.info(nodeIdsNotClusterd.length + " item(s) selected.", 250);
}

function selectNodesFromHighlight() {
	var fromX, toX, fromY, toY;
	var nodesIdInDrawing = [];
	var xRange = getStartToEnd(rect.startX, rect.w);
	var yRange = getStartToEnd(rect.startY, rect.h);
	if (!_.isUndefined(rect.startX) && !_.isUndefined(rect.startY)
		&& !_.isUndefined(rect.w) && !_.isUndefined(rect.h)) {
		var allNodes = nodes.get({returnType:"Object"});
		_.each(allNodes, function(curNode) {
			var nodePosition = network.getPositions([curNode.id]);
			var nodeXY = network.canvasToDOM({x: nodePosition[curNode.id].x, y: nodePosition[curNode.id].y})
			if (xRange.start <= nodeXY.x && nodeXY.x <= xRange.end
					&& yRange.start <= nodeXY.y && nodeXY.y <= yRange.end) {
				nodesIdInDrawing.push(curNode.id);
			}
		});
	}
	network.selectNodes(nodesIdInDrawing);
}

function getStartToEnd(start, theLen) {
	return theLen > 0
		? {start: start, end: start + theLen}
		: {start: start + theLen, end: start};
}

function removeSelectedNodes() {
	var selection = network.getSelection();
	// somehow some selection may have null values, so remove it
	var selectedNodes = _.filter(nodes.get(selection.nodes), function(item) {
		return item != null;
	});
	var selectedEdges = _.filter(edges.get(selection.edges), function(item) {
		return item != null;
	});
	nodesDeleted.update(selectedNodes);
	edgesDeleted.update(selectedEdges);
	nodes.remove(selection.nodes);
	edges.remove(selection.edges);
	if (!_.isEmpty(nodes.get()) && !_.isUndefined(network.popup) && !_.isUndefined(nodes.get()[0])) {
		network.popup.popupTargetId = nodes.get()[0].id;
	}
	
}

function saveDrawingSurface() {
	var saved = false;
	var canvas = network.canvas.frame.canvas;
	var ctx = canvas.getContext('2d');
	try {
	    drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	    saved = true;
	} catch(err) {
	}
	
	return saved;
}

function restoreDrawingSurface(ctx) {
	var restored = false;
	try {
		ctx.putImageData(drawingSurfaceImageData, 0, 0);
		restored = true;
	} catch(err) {
	}
	return restored;
}

function registerNetworkListeners() {
	network.on("oncontext", function (e) {
		if (e.nodes.length != 0) {
			network.selectNodes(e.nodes);
			var selection = network.getSelection();
			var theTemplateScript = $("#hb-context-menu").html();
			var theTemplate = Handlebars.compile(theTemplateScript);
			var seeAlsoList;
			var selectedNodes = nodes.get(e.nodes);
			if (selectedNodes.length == 1 && selectedNodes[0] != null) {
				seeAlsoList = selectedNodes[0].seeAlso;
			}
			var canClusterExpand = _.some(e.nodes, function(e) {
				return network.isCluster(e);
			});
			var content  = {
				viewProperties: !network.isCluster(e.nodes[0]) && e.nodes.length == 1,
				seeAlso: seeAlsoList,
				canCluster: e.nodes.length > 1,
				canClusterExpand: canClusterExpand,
			};
			var compiledHtml = theTemplate(content);
			$("#contextMenu").html(compiledHtml);
			$("#contextMenu").css({
				display : "block",
				left : e.pointer.DOM.x + container.offset().left,
				top : e.pointer.DOM.y + container.offset().top
			});
		}
		return false;
	});
	
	network.on("click", function() {
		$("#contextMenu").hide();
	});

    network.on("dragStart", function (params) {
		if (highlighting) { 
	    	drag = true;
			rect.startX = params.pointer.DOM.x;
			rect.startY = params.pointer.DOM.y;
			container[0].style.cursor = "crosshair";
			saveDrawingSurface();
		}
	});
    
/* Cannot use network dragging event since it will only be called when node or view is moved, 
 * using "mousemove" instead     
    network.on("dragging", function (params) {
		var canvas = network.canvas.frame.canvas;
		var ctx = canvas.getContext('2d');
		rect.w = params.pointer.DOM.x - rect.startX;
		rect.h = params.pointer.DOM.y - rect.startY ;
		
		if (restoreDrawingSurface(ctx)) {
			drawHighlightRectangle(ctx);
		}
    });*/
    
    network.on("dragEnd", function (params) {
		if (highlighting && drag) { 
			container[0].style.cursor = "default";
			var canvas = network.canvas.frame.canvas;
			var ctx = canvas.getContext('2d');
			rect.w = params.pointer.DOM.x - rect.startX;
			rect.h = params.pointer.DOM.y - rect.startY ;
			var newRect = rect;
			
			if (restoreDrawingSurface(ctx)) {
				highlightNodes();
			} else {
				drawHighlightRectangle(ctx);
				
				setTimeout(function() {
					highlightNodes();
				}, 350);
			}
			drawingSurfaceImageData = null;
			drag = false;
		}
    });	
}

function registerPageListeners() {
	// need to disabled right mouse click otherwise, the network right-mouse click menu will not display properly
	document.body.oncontextmenu = function() {return false;}

	$("#contextMenu").on("click", "a", function(e) {
		var selection = network.getSelection();
		var selectedMenuItem = $(e.target).text();

		queryList.push(selectedMenuItem);
		switch (selectedMenuItem) {
			case "View Detail":
				// currently removed from menu
				var selectedNodes = nodes.get(selection.nodes);
				window.open('/search/document/' + selectedNodes[0]['sourceAfiDocId'],'_blank');
				break;
			case "Remove From Graph":
				removeSelectedNodes();
				break;
			case "Resolve":
				var theTemplateScript = $("#hb-resolve-input").html();
				var theTemplate = Handlebars.compile(theTemplateScript);
				var content  = {
					totalNodesSelected: selection.nodes.length,
					resolveName: 'Resolve #' + resolveId
				};
				var compiledHtml = theTemplate(content);
				$("#resolveInputForm").html(compiledHtml);
				
				$('#resolveInputPanelId').puidialog({
			        minimizable: false,
			        maximizable: false,
			        draggable: false,
			        responsive: true,
			        modal: true,
			        buttons: [{
		                text: 'OK',
		                icon: 'fa-check',
		                click: function() {
		            		var selection = network.getSelection();
		    				var resolveName = $("#resolveName").val().trim();
		    				var rId = createResolveId(resolveId);
		    				var selectedNodes = _.without(nodes.get(selection.nodes), null);
		    				var sameType = _.every(selectedNodes, function(e) {
		    					// don't compare by type, since person can be suspect or officer, which have diff. image
		    					return selectedNodes[0].image == e.image;
		    				});
		    					
		    				_.each(selectedNodes, function(item) {
		    					item[resolveNameId] = rId;
		    				});

		    				nodes.update(selectedNodes);
		    				var cluster = createClusterNode(selectedNodes, rId, resolveName);
		    				nodes.update(cluster);

		    				loadCluster(cluster);
		    				resolveId++;
		    				network.unselectAll();
		    				
		                    $('#resolveInputPanelId').puidialog('hide');
		                }
		            }]
			    });
				$('#resolveInputPanelId').puidialog('show');
				
				break;
			case "Un-Resolve":
				_.each(selection.nodes, function(item) {
					if (network.isCluster(item)) {
						var nodesInCluster = network.getNodesInCluster(item);
						_.each(nodesInCluster, function(it) {
							var node = nodes.get(it);
							node[resolveNameId] = '';
							nodes.update(node);
							node = nodes.get(it);
						})
						network.openCluster(item);
						nodes.remove(item);
					}
				});
				break;
			case "Properties":
				var selectedNodes = nodes.get(selection.nodes);
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
			default:
				if (selectedMenuItem != "See Also") {
					var selectedNodes = nodes.get(selection.nodes);
					var seeAlsoItem = _.findWhere(selectedNodes[0].seeAlso, {
						displayValue: selectedMenuItem.lastIndexOf(" ") == -1 
							? selectedMenuItem 
							: selectedMenuItem.substring(0, selectedMenuItem.lastIndexOf(" "))
					});
					if (!_.isUndefined(seeAlsoItem) && !_.isNull(seeAlsoItem)) {
						var rows = $('#laRows').val();
						var queryType = seeAlsoItem.queries.and; // default to and
						if (_.endsWith(selectedMenuItem, "-OR)")) {
							queryType = seeAlsoItem.queries.or;
						}
						
						var query = isUnfielded(selectedMenuItem) ? queryType.unfielded : queryType.fielded;
						
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
						ALERT.info("Retrieving " + rows + " document(s) with query, " + query, 250);
						search(postData);
					}
				}
		}
		if (selectedMenuItem != "Resolve") {
			network.unselectAll();
		}
		$("#contextMenu").hide();
	});
    
    container.on("mousedown", function(e) {
		if (highlighting) { 
			// handles multiple selection w/ Ctrl key
			selectedNodes = e.ctrlKey ? network.getSelectedNodes() : null;
		}
	}); 

	container.on("mousemove", function(e) {
		if (highlighting && drag) { 
			var canvas = network.canvas.frame.canvas;
			var ctx = canvas.getContext('2d');
			rect.w = (e.pageX - this.offsetLeft) - rect.startX;
			rect.h = (e.pageY - this.offsetTop) - rect.startY ;
			
			if (restoreDrawingSurface(ctx)) {
				drawHighlightRectangle(ctx);
			}
		}
	});

	$(document).keyup(function(e){
	    if (e.keyCode == 46) { // delete button pressed
	    	removeSelectedNodes();
	    }
	}) 
	
	$('.laFacet').tooltip();
	$('.laFilterQuery').tooltip();
	$('.laRows').tooltip();
	$('.selectDraw').tooltip();
	$('#stretchId').tooltip();

	$('#optionsMenu').puitieredmenu({
	    popup: true,
	    trigger: $('#optionsTrigger')
	});
	
	$('#highLightId').change(function() {
		highlighting = $(this).prop('checked');
		network.setOptions({
			interaction: { 
				dragView: !highlighting 
			}
		});
	});
	
	$("#stretchId").val(edgeLength);
	$('#stretchId').puispinner({
		min: minEdgeLength,
        max: maxEdgeLength,
		step: 50
	});
	$('#stretchId').change(function() {
		edgeLength = parseInt($('#stretchId').val());
		if (edgeLength >= minEdgeLength && edgeLength <= maxEdgeLength) {
			network.setOptions({edges: {length: edgeLength}});
		} else {
			ALERT.warning("Value must be between " + minEdgeLength + " and " + maxEdgeLength + ".", 250);
		}
	});
}

function drawHighlightRectangle(ctx) {
	ctx.setLineDash([5]);
	ctx.strokeStyle = "rgb(0, 102, 0)";
	ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
	ctx.setLineDash([]);
	ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
	ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
}

var cssColors = loadJson("/js/css-color-names.json");
var colors = []; // = loadJson("/static/js/search/crayola.json");
var nodes, edges, nodesDeleted, edgesDeleted, network;
var queryList = [];
var resolveId = 1;
var resolveNameId = 'resolveId';
var customLayout;
var minEdgeLength = 200;
var maxEdgeLength = 1000;
var edgeLength = 250;
var i2Disabled = false;
var container = $("#network");
var drawingSurfaceImageData, selectedNodes;
var rect = {};
var drag = false;
var highlighting = false;
var dsColors;
var laView, laOptionsView, laDsColorView;
var loadAlready = false;

$(document).ready(function() {
	var queryStr = getUrlVars();
	
	_.mapKeys(cssColors, function(value, key) {
		colors.push({name: key, hex: value});
	});

	initDraw();

	laOptionsView = new LinkAnalysisOptionsView();
	laDsColorView = new LinkAnalysisDataSourceColorView();
	laView = new LinkAnalysisView({
		model : new LinkAnalysisModel({ 
			query: queryStr.query,
			start: queryStr.start, 
			rows: queryStr.rows, 
			filterQuery: queryStr.filterQuery,
			facetField: queryStr.facetField 
		})
	});
	
	laView.search();
	laView.model.set('start', '0'); 
	
	i2Disabled = false;

	registerPageListeners();
	$('#highLightId').bootstrapToggle(highlighting ? 'on' : 'off');
	
	
	
	if (nodes.length == 0) {
		ALERT.warning("Data cannot be represented in the chart! Please try again.");
	}

	$("#sidebarItemLinkAnalysis").css('display', 'inline');
});

Handlebars.registerHelper('textColor', function (hexColor) {
	var rgb = hexToRgb(hexColor);
    var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) /1000);
    
    return o > 125 ? 'black' : 'white';
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
			strArray.push(value);
			strArray.push('</td>');
			strArray.push('</tr>');;
		}
	})
	
	return strArray.join("");
});	
	        		
Handlebars.registerHelper('loadSeeAlso', function (displayValue) {
	return "<li><a href=\"#\">" + displayValue + " (FIELDED-AND)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (FIELDED-OR)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (UNFIELDED-AND)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (UNFIELDED-OR)</a></li>\n";
});	
