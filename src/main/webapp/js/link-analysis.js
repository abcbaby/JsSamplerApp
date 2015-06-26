var dataSourcesWithNoOntology = 
	[
		"AFI PROJECTS",
		"AFI RFIS",
		"AFI INTELVIEW",
		"CBP IRS-FIR",
		"CBP IRS HSIR",
		"CBP IRS-SRR MOBILITY",
		"CBP IRS-SRR TRADE",
		"CCD DOCUMENT",
		"CCD NAME BIRTH COUNTRY",
		"CCD NAME CITIZENSHIP",
		"CCD NAME DOB",
		"ICE IIR",
		"ICE INTEL PRODUCTS",
		"ICE NAME TRACE",
		"LEISS ARJIS",
		"LEISS AZCENTRAL",
		"LEISS AZEAST",
		"LEISS AZNORTH",
		"LEISS AZSOUTH",
		"LEISS FBI N-DEX",
		"LEISS LALEAS",
		"LEISS LINXCA",
		"LEISS LINXHR",
		"LEISS LINNCR",
		"LEISS LINXNW",
		"SQ13",
		"SQ15",
		"SQ16",
		"TF CASE ACTIVITY",
		"TF CASE ATTACHMENT",
		"TF CASE RESEARCH"
    ];

var LinkAnalysisModel = Backbone.Model.extend({
    defaults: {
        query: "",
        rows: "10",
        filterQuery: "",
    	facetField: ""
    },    
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
			ALERT.info("Please enter a search");
		} else {
			this.model.set('query', qry); 
			this.model.set('rows', this.$el.find('#laRows').val()); 
			var postData = {
					"query": this.model.get('query'),
					"rows": this.model.get('rows'),
					"start": 0,
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
			ALERT.info("Retrieving " + this.model.get('rows') + " document(s) with query, " + this.model.get('query'));
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
		draw();
		reCluster();
	},
	layoutDu: function() {
		customLayout = { hierarchical: { direction: "DU", levelSeparation: 150 } };
		draw();
		reCluster();
	},
	layoutLr: function() {
		customLayout = { hierarchical: { direction: "LR", levelSeparation: 150 } };
		draw();
		reCluster();
	},
	layoutRl: function() {
		customLayout = { hierarchical: { direction: "RL", levelSeparation: 150 } };
		draw();
		reCluster();
	},
	defaultLayout: function() {
		customLayout = {};
		draw();
		reCluster();
	},
	clear: function() {
		initDraw();		
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
			nodes.update(jsonData.nodes);
			edges.update(jsonData.edges);
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
			nodes.update(newNodes2);
		}
		if (!_.isEmpty(newEdges2)) {
			edges.update(newEdges2);
		}
	}
}

function initDraw() {
	nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	nodesDeleted = new vis.DataSet([]);
	edgesDeleted = new vis.DataSet([]);
	customLayout = {};
	draw(customLayout);
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

function createClusterNode(selectedNodes, rId, sameType, resolveName) {
	var largestNode = _.max(selectedNodes, function(e) {
		return _.isUndefined(e.size)
			? e.font.size
			: e.size;
	});
	var imgSize = parseInt(_.isUndefined(largestNode.size) 
		? largestNode.font.size 
		: largestNode.size) + 4;
	return sameType
		? {
			id: rId, 
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
			label: resolveName + ' [' + selectedNodes.length + ']', 
			title: resolveName + ' [' + selectedNodes.length + ']', 
			type: 'Mixed',
			cluster: true,
			font: {size: imgSize},
			shape: 'box'
		};
}

function unCluster() {
	for (var i = (resolveId - 1); i >= 1; i--) {
		var rId = createResolveId(i);
		if (network.isCluster(rId)) {
			network.openCluster(rId);
		}
	}
}

function reCluster() {
	for (var i = 1; i <= resolveId; i++) {
		var c = nodes.get(createResolveId(i));
		if (c != null) {
			loadCluster(c);
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
	return 'resolveId-' + resolveId;	
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
   drawingSurfaceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreDrawingSurface() {
	ctx.putImageData(drawingSurfaceImageData, 0, 0);
}

function registerNetworkListeners() {
	network.on("oncontext", function (e) {
		if (!highlighting && e.nodes.length != 0) {
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
				ALERT.info("Detail not implemented yet!");
				break;
			case "Delete":
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
	    					var sameType = !_.some(selection.nodes, function(e) {
	    						return network.isCluster(e);
		    				});
		    				if (sameType) {
			    				sameType = _.every(selectedNodes, function(e) {
			    					// don't compare by type, since person can be suspect or officer, which have diff. image
			    					return selectedNodes[0].image == e.image;
			    				});
	    					}
		    					
		    				_.each(selectedNodes, function(item) {
		    					item[resolveNameId] = rId;
		    				});

		    				nodes.update(selectedNodes);
		    				var cluster = createClusterNode(selectedNodes, rId, sameType, resolveName);
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
							console.log(node);
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
						ALERT.info("Retrieving " + rows + " document(s) with query, " + query);
						search(postData);
					}
				}
		}
		if (selectedMenuItem != "Resolve") {
			network.unselectAll();
		}
		$("#contextMenu").hide();
	});
	
	container.on("mousemove", function(e) {
		if (highlighting && drag) { 
			restoreDrawingSurface();
			rect.w = (e.pageX - this.offsetLeft) - rect.startX;
			rect.h = (e.pageY - this.offsetTop) - rect.startY ;
			
			ctx.setLineDash([5]);
			ctx.strokeStyle = "rgb(0, 102, 0)";
			ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
			ctx.setLineDash([]);
			ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
			ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
		}
	});
    
    container.on("mousedown", function(e) {
		if (highlighting && e.button == 2) { 
			saveDrawingSurface();
			var that = this;
			rect.startX = e.pageX - this.offsetLeft;
			rect.startY = e.pageY - this.offsetTop;
			drag = true;
			container[0].style.cursor = "crosshair";
		}
	}); 
	
	container.on("mouseup", function(e) {
		if (highlighting && e.button == 2) { 
			restoreDrawingSurface();
			drag = false;

			rect.w = (e.pageX - this.offsetLeft) - rect.startX;
			rect.h = (e.pageY - this.offsetTop) - rect.startY ;
			
			ctx.strokeStyle = "rgb(160, 160, 160)";
			ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
			ctx.fillStyle = "rgba(128, 128, 128, 0.2)";
			ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);

			container[0].style.cursor = "default";
			selectNodesFromHighlight();
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
			ALERT.warning("Value must be between " + minEdgeLength + " and " + maxEdgeLength + ".");
		}
	});
}

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
var canvas, ctx, drawingSurfaceImageData, selectedNodes;
var rect = {};
var drag = false;
var highlighting = false;
var loadAlready = false;

$(document).ready(function() {
	var queryStr = getUrlVars();
	
	initDraw();

	canvas = network.canvas.frame.canvas;
	ctx = canvas.getContext('2d');
	
	var laView = new LinkAnalysisView({
		model : new LinkAnalysisModel({ 
			query: queryStr.query,
			rows: queryStr.rows, 
			filterQuery: queryStr.filterQuery,
			facetField: queryStr.facetField 
		})
	});
	
	laView.search();
	i2Disabled = false;

	var laOptionsView = new LinkAnalysisOptionsView();

	registerPageListeners();
	$('#highLightId').bootstrapToggle(highlighting ? 'on' : 'off');

	if (nodes.length == 0) {
		ALERT.warning("Data cannot be represented in the chart! Please try again.");
	}

	$("#sidebarItemLinkAnalysis").css('display', 'inline');
});

Handlebars.registerHelper('addDivider', function (index) {
	return index == 0 ? "" : "<li class=\"divider\"></li>";
});	

Handlebars.registerHelper('getProperties', function (obj) {
	var str = '';
	str += '<tr>';
	str += '<td>Document ID</td>';
	str += '<td>' + obj['sourceAfiDocId'] + '</td>';
	str += '</tr>';
	str += '<tr>';
	str += '<td>Node ID</td>';
	str += '<td>' + obj['id'] + '</td>';
	str += '</tr>';
	if (_.startsWith(obj['image'], "data:")) {
		str += '<tr>';
		str += '<td>Image</td>';
		str += '<td><img src="' + obj['image'] + '" height="200px" width="200px"></td>';
		str += '</tr>';
	}
	for (var propertyName in obj.values) {
		if (propertyName == "imageContent") {
			continue;
		}
		//var name = propertyName.split(/(?=[A-Z])/).join(" ");
		var name = _.startCase(propertyName);
		str += '<tr>';
		str += '<td class="capitalize">' + name + '</td>';
		str += '<td>' + obj.values[propertyName] + '</td>';
		str += '</tr>';
	}
	
	return str;
});	
	        		
Handlebars.registerHelper('loadSeeAlso', function (displayValue) {
	return "<li><a href=\"#\">" + displayValue + " (FIELDED-AND)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (FIELDED-OR)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (UNFIELDED-AND)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (UNFIELDED-OR)</a></li>\n";
});	
