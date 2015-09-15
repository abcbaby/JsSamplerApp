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

function drawHighlightRectangle(ctx) {
	ctx.setLineDash([5]);
	ctx.strokeStyle = "rgb(0, 102, 0)";
	ctx.strokeRect(linkAnalysisVar.rect.startX, linkAnalysisVar.rect.startY, linkAnalysisVar.rect.w, linkAnalysisVar.rect.h);
	ctx.setLineDash([]);
	ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
	ctx.fillRect(linkAnalysisVar.rect.startX, linkAnalysisVar.rect.startY, linkAnalysisVar.rect.w, linkAnalysisVar.rect.h);
}
