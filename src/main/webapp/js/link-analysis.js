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
		'click #laSearchBtn' : 'search',
		'click #laClearBtn' : 'clear',
		'click #laI2ExportBtn' : 'i2Export',
		'click #udBtn' : 'layoutUd',
		'click #duBtn' : 'layoutDu',
		'click #lrBtn' : 'layoutLr',
		'click #rlBtn' : 'layoutRl',
		'click #defaultLayoutBtn' : 'defaultLayout'
	},
	search: function() {
		var qry = $('#laSearchTxt').val().trim();

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
			ALERT.info("Retrieving " + this.model.get('rows') + " document(s) with query, " + this.model.get('query'));
			search(postData);
			disableI2Export(true);
		}
	},
	layoutUd: function() {
		draw({ hierarchical: { direction: "UD", levelSeparation: 150 } });
		reCluster()
	},
	layoutDu: function() {
		draw({ hierarchical: { direction: "DU", levelSeparation: 150 } });
		reCluster()
	},
	layoutLr: function() {
		draw({ hierarchical: { direction: "LR", levelSeparation: 150 } });
		reCluster()
	},
	layoutRl: function() {
		draw({ hierarchical: { direction: "RL", levelSeparation: 150 } });
		reCluster()
	},
	defaultLayout: function() {
		draw({});
		reCluster()
	},
	clear: function() {
		initDraw({nodes: {}, edges: {}});
	},
	i2Export: function() {
		var queryParams = window.location.href.slice(window.location.href.indexOf('?') + 1)
		window.location.href = "/search/api/linkanalysis/i2export" + queryParams;
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

function startsWith(str, prefix) {
    return str.substring(0, prefix.length) === prefix;
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
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
			nodes.update(jsonData.nodes);
			edges.update(jsonData.edges);
		},
		success : function(jsonData) {
			var existNodeIds = [];
			var existEdgeIds = [];
			_.each(jsonData.nodes, function(it) {
				existNodeIds.push(it.id);
			})
			_.each(jsonData.edges, function(it) {
				existEdgeIds.push(it.id);
			})
			var existingNodes = nodes.get(existNodeIds);
			var existingEdges = edges.get(existEdgeIds);

			var newNodes = [];
			var newEdges = [];
			_.each(jsonData.nodes, function(item) {
				if (_.isUndefined(_.findWhere(existingNodes, {id: item.id}))) {
					newNodes.push(item);
				}
			});
			_.each(jsonData.edges, function(item) {
				if (_.isUndefined(_.findWhere(existingEdges, {id: item.id}))) {
					newEdges.push(item);
				}
			});

			nodes.update(newNodes);
			edges.update(newEdges);
		}
	});
	ALERT.clearStatus();
}

function clearSelection() {
	network.selectNodes([]);
	network.selectEdges([]);
}

function initDraw() {
	nodes = new vis.DataSet([]);
	edges = new vis.DataSet([]);
	draw({});
}

function draw(customLayout) {
	customLayout.randomSeed = 2;
	var panelHeight = ($(window).height() - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 50)) + "px";
	var options = {
		layout: customLayout,
		height : panelHeight,
		interaction: {
	    	multiselect: true,
	    	navigationButtons: true,
	    	keyboard: true
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
			length : 250
		},
		physics : {
			stabilization: false,
			barnesHut : {
				gravitationalConstant : -2000,
				centralGravity : 0,
				springLength : 100,
				springConstant : 0.04,
				damping : 0.09
			}
		}
	};

	// create a network
	var container = document.getElementById("network");

	var data = {
		nodes : nodes,
		edges : edges
	};
	network = new vis.Network(container, data, options);

	registerListeners();

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

function reCluster() {
	for (var i = 1; i <= resolveId; i++) {
		var c = nodes.get('resolveId-' + i);
		if (c != null) {
			loadCluster(c);
		}
	}
}

function loadCluster(cluster) {
	var clusterOptionsByData = {
			joinCondition:function(childOptions) {
				return childOptions[cluster.id] == cluster.id;
			},
			clusterNodeProperties: cluster
		}
		network.cluster(clusterOptionsByData);
}

function disableI2Export(disableI2) {
	$("#laI2ExportBtn").prop("disabled", disableI2);
}

function isUnfielded(txt) {
	return txt.indexOf(" (UNFIELDED") !== -1;
}

function registerListeners() {
	// need to disabled right mouse click otherwise, the network right-mouse click menu will not display properly
	document.body.oncontextmenu = function() {return false;}

	var $contextMenu = $("#contextMenu");

	network.on("oncontext", function (e) {
		if (e.nodes.length != 0) {
			network.selectNodes(e.nodes);
			var selection = network.getSelection();
			var theTemplateScript = $("#hb-context-menu").html();
			var theTemplate = Handlebars.compile(theTemplateScript);
			var seeAlsoList;
			var selectedNodes = nodes.get(e.nodes);
			if (selectedNodes[0] != null) {
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
			$contextMenu.html(compiledHtml);
			$contextMenu.css({
				display : "block",
				left : e.pointer.DOM.x + $("#network").offset().left,
				top : e.pointer.DOM.y + $("#network").offset().top
			});
		}
		return false;
	});

	$contextMenu.on("click", "a", function(e) {
		var selection = network.getSelection();
		var selectedMenuItem = $(e.target).text();
		queryList.push(selectedMenuItem);
		switch (selectedMenuItem) {
			case "View Detail":
				ALERT.info("Detail not implemented yet!");
				break;
			case "Delete":
				nodes.remove(selection.nodes);
				edges.remove(selection.edges);
				if (!_.isEmpty(nodes.get()) && !_.isUndefined(network.popup) && !_.isUndefined(nodes.get()[0])) {
					network.popup.popupTargetId = nodes.get()[0].id;
				}
				break;
			case "Resolve":
				$("#resolveName").val("");

				var theTemplateScript = $("#hb-resolve-input").html();
				var theTemplate = Handlebars.compile(theTemplateScript);
				var compiledHtml = theTemplate(content);
				$("#resolveInputForm").html(compiledHtml);

				$('#resolveInputPanelId').puidialog({
			        showEffect: 'fade',
			        hideEffect: 'fade',
			        minimizable: false,
			        maximizable: false,
			        draggable: false,
			        responsive: true,
			        modal: false,
			        buttons: [{
		                text: 'OK',
		                icon: 'fa-check',
		                click: function() {
		            		var selection = network.getSelection();
		    				var resolveName = $("#resolveName").val().trim();
		    				if (resolveName == "") {
		    					resolveName = 'Resolve ' + resolveId;
		    				}

		    				var rId = 'resolveId-' + resolveId;
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
		    					item[rId] = rId;
		    				});
		    				nodes.update(selectedNodes);
		    				var cluster = createClusterNode(selectedNodes, rId, sameType, resolveName);
		    				nodes.update(cluster);

		    				loadCluster(cluster);
		    				resolveId++;
		    				clearSelection();

		                    $('#resolveInputPanelId').puidialog('hide');
		                }
		            }]
			    });
				$('#resolveInputPanelId').puidialog('show');

				break;
			case "Un-Resolve":
				_.each(selection.nodes, function(item) {
					if (network.isCluster(item)) {
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

					var len = $("#" + dialogId).length;

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
						if (endsWith(selectedMenuItem, "-OR)")) {
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
						ALERT.info("Retrieving " + rows + " document(s) with query, " + query);
						search(postData);
						disableI2Export(true);
					}
				}
		}
		if (selectedMenuItem != "Resolve") {
			clearSelection();
		}
		$contextMenu.hide();
	});

	network.on("click", function() {
		$contextMenu.hide();
	});
}

var nodes, edges, network;
var queryList = [];
var resolveId = 1;
var loadAlready = false;


$(document).ready(function() {
	var queryStr = getUrlVars();

	initDraw();

	var laView = new LinkAnalysisView({
		model : new LinkAnalysisModel({
			query: queryStr.query,
			rows: queryStr.rows,
			filterQuery: queryStr.filterQuery,
			facetField: queryStr.facetField
		})
	});

	laView.search();
	disableI2Export(false);

	if (nodes.length == 0) {
		ALERT.warning("Data cannot be represented in the chart! Please try again.");
	}

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
	if (startsWith(obj['image'], "data:")) {
		str += '<tr>';
		str += '<td>Image</td>';
		str += '<td><img src="' + obj['image'] + '" height="200px" width="200px"></td>';
		str += '</tr>';
	}
	for (var propertyName in obj.values) {
		if (propertyName == "imageContent") {
			continue;
		}
		var name = propertyName.split(/(?=[A-Z])/).join(" ");
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
