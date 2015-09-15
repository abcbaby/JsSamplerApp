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

    linkAnalysisVar.network.on("dragStart", function (params) {
		if (linkAnalysisVar.highlighting) { 
	    	linkAnalysisVar.drag = true;
	    	
			// handles multiple selection w/ Ctrl key
			linkAnalysisVar.selectedNodes = params.event.srcEvent.ctrlKey ? linkAnalysisVar.network.getSelectedNodes() : null;
	    	
	    	// turn off physics so nodes/edges not moving
			linkAnalysisVar.network.setOptions({
				physics: {
					enabled: false
				}
			});
	    	
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
			
			// put back the physics & let nodes move naturally
			linkAnalysisVar.network.setOptions({
				physics: {
					enabled: !linkAnalysisVar.freeze
				}
			});			
		}
    });	

    linkAnalysisVar.network.on("stabilizationProgress", function(params) {
        var widthFactor = params.iterations/params.total;
        ALERT.status("Loading..." + Math.round(widthFactor*100) + "%");
    });
    
    linkAnalysisVar.network.on("stabilizationIterationsDone", function() {
        ALERT.status("Loading...100%");
        
        setTimeout(function () {
        	ALERT.clearStatus();
    	}, linkAnalysisVar.statusTimeout);
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
	});
	
	// custom code hiding common menus
	document.addEventListener(screenfull.raw.fullscreenchange, function () {
		var panelHeight;
		if (screenfull.isFullscreen) {
			$(".navbar-common").hide();
			$(".navbar-app").hide();
			panelHeight = getNetworkFullScreenSize();
			if (!linkAnalysisVar.pageSidebarMinified) {
				$("[data-click=sidebar-minify]").trigger("click");
			}
		} else {
			$(".navbar-common").show();
			$(".navbar-app").show();
			panelHeight = linkAnalysisVar.panelDefaultHeight;
			if (!linkAnalysisVar.pageSidebarMinified) {
				$("[data-click=sidebar-minify]").trigger("click");
			}
		}
		linkAnalysisVar.network.setOptions({
			height: panelHeight
		});
	});
	
	$("body").on("click", function(){
		$("#contextMenu").hide();
	}) 
    
	$(document).keyup(function(e){
	    if (e.keyCode == 46 && !linkAnalysisVar.resolveDialogOpen) { // delete button pressed
	    	removeSelectedNodes();
	    }
	}) 
}
