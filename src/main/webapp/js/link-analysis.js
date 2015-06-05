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
		_.bindAll(this, 'render', 'search', 'reset', 'clear');
		
		this.render(); // not all views are self-rendering. This one is.
	},
	events : {
		'click #laSearchBtn' : 'search',
		'click #laResetBtn' : 'reset',
		'click #laClearBtn' : 'clear',
		'click #udBtn' : 'layoutUd',
		'click #duBtn' : 'layoutDu',
		'click #lrBtn' : 'layoutLr',
		'click #rlBtn' : 'layoutRl',
		'click #defaultLayoutBtn' : 'defaultLayout'
	},
	search: function() {
		this.model.set('query', this.$el.find('#laSearchTxt').val()); 
		this.model.set('rows', this.$el.find('#laRows').val()); 
		var postData = {
			"query": this.model.get('query'),
			"rows": this.model.get('rows'),
		    "start": 0,
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
		search(postData);
		ALERT.info("Retrieved " + this.model.get('rows') + " documents with query, " + this.model.get('query'));
	},
	layoutUd: function() {
		draw({ hierarchical: { direction: "UD" } });
		reCluster()
	},
	layoutDu: function() {
		draw({ hierarchical: { direction: "DU" } });
		reCluster()
	},
	layoutLr: function() {
		draw({ hierarchical: { direction: "LR" } });
		reCluster()
	},
	layoutRl: function() {
		draw({ hierarchical: { direction: "RL" } });
		reCluster()
	},
	defaultLayout: function() {
		draw({});
		reCluster()
	},
	reset: function() {
		initDraw({nodes: {}, edges: {}});	
		var queryStr = getUrlVars();
		initDraw(loadJson("/network/data.json"));
	},
	clear: function() {
		initDraw({nodes: {}, edges: {}});		
	},
	render : function () {
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
			var jsonData = loadJson("/network/addedData.json");			
			nodes.update(jsonData.nodes);
			edges.update(jsonData.edges);
		},
		success : function(jsonData) {
			nodes.update(jsonData.nodes);
			edges.update(jsonData.edges);
		}
	});
	ALERT.clearStatus();
}

function clearSelection() {
	network.selectNodes([]);
	network.selectEdges([]);
}

function initDraw(jsonData) {
	nodes = new vis.DataSet(jsonData.nodes);
	edges = new vis.DataSet(jsonData.edges);
	draw({});
}

function draw(customLayout) {
	customLayout.randomSeed = 2;
	var panelHeight = ($(window).height() - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 50)) + "px";
	var options = {
		height : panelHeight,
		interaction: {
	    	multiselect: true,
	    	navigationButtons: true,
	    	keyboard: true
	    },
	    nodes: {
	    	shadow: true
	    },
        edges: {
			smooth: false,
			length : 400
		},
		layout: customLayout,
		physics : {
			stabilization: true,
			barnesHut : {
				gravitationalConstant : -2000,
				centralGravity : 0.1,
				springLength : 100,
				avoidOverlap: 0.75,
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

function createClusterNode(selectedNodes, cId, sameType) {
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
			id: cId, 
			label: selectedNodes[0].type + ' [' + selectedNodes.length + ']', 
			title: selectedNodes[0].type + ' [' + selectedNodes.length + ']', 
			type: selectedNodes[0].type, 
			cluster: true,
			size: imgSize, 
			shape: "image", 
			image: selectedNodes[0].image
		}
		: {
			id: cId, 
			label: 'Cluster ' + clusterId + ' [' + selectedNodes.length + ']', 
			title: 'Cluster ' + clusterId + ' [' + selectedNodes.length + ']', 
			type: 'Mixed',
			cluster: true,
			font: {size: imgSize},
			shape: 'box'
		};
}

function reCluster() {
	for (var i = 0; i < clusterId; i++) {
		var c = nodes.get('clusterId-' + i);
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
				seeAlso: seeAlsoList,
				canCluster: e.nodes.length > 1,
				canClusterExpand: canClusterExpand,
				allowRemove: false};
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
			case "Remove":
				if (_.isEmpty(selection.edges)) {
					nodes.remove(selection.nodes);
					edges.remove(selection.edges);
					if (!_.isEmpty(nodes.get())) {
						network.popup.popupTargetId = nodes.get()[0].id;
					}
				}
				break;
			case "Cluster":
				var cId = 'clusterId-' + clusterId;
				var selectedNodes = _.without(nodes.get(selection.nodes), null);
				var sameType = _.every(selectedNodes, function(e) {
					// don't compare by type, since person can be suspect or officer, which have diff. image
					return selectedNodes[0].image == e.image;
				});
				_.each(selectedNodes, function(item) {
					item[cId] = cId;
				});
				nodes.update(selectedNodes);
				var cluster = createClusterNode(selectedNodes, cId, sameType);
				nodes.update(cluster);

				loadCluster(cluster);
				clusterId++;
				break;
			case "Cluster Expand":
				_.each(selection.nodes, function(item) {
					if (network.isCluster(item)) {
						network.openCluster(item);
						nodes.remove(item);
					}
				});
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
						if (endsWith(selectedMenuItem, " (OR)")) {
							queryType = seeAlsoItem.queries.or;
						}
						
						var postData = {
							"query": queryType.fielded,
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
						search(postData);
						ALERT.info("Retrieved " + rows + " documents with query, " + queryType.fielded);
	
					}
				}
		}
		clearSelection();
		$contextMenu.hide();
	});

	network.on("click", function() {
		$contextMenu.hide();
	});
}

var nodes, edges, network;
var queryList = [];
var clusterId = 0;

$(document).ready(function() {
	var queryStr = getUrlVars();
	var jsonData = loadJson("/network/data.json");

	initDraw(jsonData);

	if (jsonData.nodes.length == 0) {
		ALERT.warning("Data cannot be represented in the chart! Please try again.");
	}
	
	// some json data have not been pulled yet, therefore, need timeout, otherwise, IE *sometimes* fail
	setTimeout(function(){
		laView = new LinkAnalysisView({
			model : new LinkAnalysisModel({ 
				rows: queryStr.rows, 
				filterQuery: queryStr.filterQuery,
				facetField: queryStr.facetField 
			})
		});
	}, 500);
});

Handlebars.registerHelper('addDivider', function (index) {
	return index == 0 ? "" : "<li class=\"divider\"></li>";
});	
	        		
Handlebars.registerHelper('loadSeeAlso', function (displayValue) {
	return displayValue.indexOf(" ") == -1
		? "<li><a href=\"#\">" + displayValue + "</a></li>\n"
		: "<li><a href=\"#\">" + displayValue + " (AND)</a></li>\n" 
			+ "<li><a href=\"#\">" + displayValue + " (OR)</a></li>\n"; 
});	
