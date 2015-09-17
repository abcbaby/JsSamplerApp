
function validRows(rowsStr) {
	var termNum = parseInt(rowsStr);
	return rowsStr.match(/^\d+$/) !== null && termNum <= linkAnalysisVar.maxRows;
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

function getPostData(query, rows, filterQuery, facet) {
	var postData = {
		"query": query,
	    "start": 0,
	    "rows": rows,
	    "matchAll": true,
	    "newSearch": true
	};
	if (_.isUndefined(filterQuery) || filterQuery === "") {
		postData.filterQuery = {};
	} else {
		postData.filterQuery = { "AFI__DOC_TYPE_t": [ filterQuery ] };
	}
	if (!_.isUndefined(facet)) {
		postData.facet = true;
		postData.facetMethod = "fc";
		postData.facetField = facet;
	}
	
	return postData;
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
		contentType:"application/json; charset=utf-8",
		dataType : "json",
		data : JSON.stringify(postData),
		error: function() {
			var jsonData = loadJson("/network/addedData.json");
			syncNetwork(jsonData);
			linkAnalysisVar.network.stabilize();
		},
		success : function(jsonData) {
			linkAnalysisVar.customLayout.improvedLayout = true;
			syncNetwork(jsonData);
			linkAnalysisVar.network.stabilize();
		}
	});	
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

function initDraw(nodes, edges) {
	linkAnalysisVar.nodes = new vis.DataSet([]);
	linkAnalysisVar.edges = new vis.DataSet([]);
	linkAnalysisVar.nodesDeleted = new vis.DataSet([]);
	linkAnalysisVar.edgesDeleted = new vis.DataSet([]);
	linkAnalysisVar.dsColors = [];
	linkAnalysisVar.panelHeight = screenfull.isFullscreen
		? getNetworkFullScreenSize()
		: linkAnalysisVar.panelDefaultHeight;
	linkAnalysisVar.customLayout = {}; // {improvedLayout: false};
	linkAnalysisVar.heirarchy = $(".layoutDefault").data('value');
	$(".heirarchy").siblings().css({
		'background-color': linkAnalysisVar.deselectedColor
	});
	$(".layoutDefault").css({
		'background-color': linkAnalysisVar.selectedColor
	});
	$(".fullscreen").siblings().hide();
	$(".screenDefault").show();
	
	if (nodes || edges) {			
		syncNetwork({'nodes':nodes, 'edges':edges});			
	}
	
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
	var options = {
		layout: linkAnalysisVar.customLayout,
		height: linkAnalysisVar.panelHeight,
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
			stabilization: {
				enabled: true,
				iterations: 500
			},
			barnesHut: {
				gravitationalConstant: -2000,
				centralGravity: 0,
				springLength: 100,
				springConstant: 0.1,
				damping: 0.09
			},
			maxVelocity: 25,
			minVelocity: 1,
            timestep: 0.5,
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

function removeSelectedNodes() {
	var selection = linkAnalysisVar.network.getSelection();
	// somehow some selection may have null values, so remove it
	var selectedNodes = _.filter(linkAnalysisVar.nodes.get(selection.nodes), function(item) {
		return item != null;
	});
	if (selectedNodes.length > 0) {
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
}

function getNetworkFullScreenSize() {
	return (screen.height - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 28 + 150)) + "px";
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
