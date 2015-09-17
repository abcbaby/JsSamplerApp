var linkAnalysisVar = {
	cssColors: loadJson("/js/css-color-names.json"),
	colors: [],
	entityList: [],
	maxRows: 500,
	minEdgeLength: 200,
	maxEdgeLength: 1000,
	edgeStep: 50,
	edgeLength: 250,
	statusTimeout: 1000,
	panelDefaultHeight: ($(window).height() - (($(".security-banner").height() * 2) + $(".navbar-header").height() + 28 + 100)) + "px",
	panelHeight: this.panelDefaultHeight,
	pageSidebarMinified: false,
	docId: 'sourceAfiDocId',
	resolveId: 1,
	resolveNameId: 'resolveId',
	mergePropertySeparator: '; ',
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
	network: undefined
};

$(document).ready(function() {
	var alertId = ALERT.status("Loading...");

	var queryStr = getUrlVars();
	
	_.mapKeys(linkAnalysisVar.cssColors, function(value, key) {
		linkAnalysisVar.colors.push({name: key, hex: value});
	});
	
	var query = decodeURI(queryStr.query);
	new LinkAnalysisDataSourceColorView();
	linkAnalysisVar.laView = new LinkAnalysisView({
		model : new LinkAnalysisModel({ 
			query: query,
			start: queryStr.start, 
			rows: queryStr.rows, 
			filterQuery: queryStr.filterQuery,
			facetField: queryStr.facetField 
		})
	});
	
	var postData = getPostData(query, queryStr.rows, queryStr.filterQuery, queryStr.facetField);
	postData.start = queryStr.start;
	postData.maxRowsOverride = true; // lift default max row restriction

	$.ajax({
		type : "POST",
		url : "/search/api/linkanalysis/documents",
		contentType:"application/json; charset=utf-8",
		dataType : "json",
		data : JSON.stringify(postData),
		error: function() {
			var jsonData = loadJson("/network/data.json");
			initDraw(jsonData.nodes, jsonData.edges);
			
			ALERT.warning("Loaded " + linkAnalysisVar.nodes.length + " nodes.");
		},
		success: function(jsonData) {
			initDraw(jsonData.nodes, jsonData.edges);
			
			if (linkAnalysisVar.nodes.length === 0) {
				ALERT.warning("Data cannot be represented in the chart! Please try again.");
			}
		},
		complete: function() {			
			ALERT.clearStatus(alertId);
		}
	});

	registerPageListeners();

	$("#sidebarItemLinkAnalysis").css('display', 'inline');
	
});
