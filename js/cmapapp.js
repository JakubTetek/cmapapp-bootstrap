jsPlumb.ready(function() {
					
	// setup some defaults for jsPlumb.	
	var instance = jsPlumb.getInstance({
		Endpoint : ["Dot", {radius:2}],
		HoverPaintStyle : {strokeStyle:"#1e8151", lineWidth:2 },
		ConnectionOverlays : [
			[ "Arrow", { 
				location:1,
				id:"arrow",
                length:14,
                foldback:0.8,
			} ],
            [ "Label", { label:"", id:"label", cssClass:"aLabel" }]
		],
		Container:"statemachine-demo"
	});

	var windows = jsPlumb.getSelector(".statemachine-demo .w");

    // initialise draggable elements.  
	instance.draggable(windows, {containment:".demo"});

    // bind a click listener to each connection
	// connection to be renamed
	instance.bind("click", function(c) { 
		if (!(c.getOverlay("label").getLabel() == 'Add Text')) $('#renameLinkInput').val(c.getOverlay("label").getLabel());//$('#renameLinkInput').attr('placeholder', c.getOverlay("label").getLabel());
		
		$('#linkRenameModal').modal('show');

		$('#renameLinkForm').unbind().on('submit', function (event) {
			c.getOverlay("label").setLabel($('#renameLinkInput').val());
			$('#renameLinkInput').val('')
			$('#linkRenameModal').modal('hide');
			return false;
		});
		return false;
	});
	
	// focus input when modal loads
	$('#linkRenameModal, #conceptRenameModal').on('shown.bs.modal', function (e) {
		$('input:text').focus(function() { $(this).select(); });
		$('input:text').focus();
	})
	
	// remove input value when modal closes
	$('#linkRenameModal').on('hidden.bs.modal', function (e) {
		$('#renameLinkInput').val("");
	})
	
	
	// changing concept name on dblclick
	$(document).on('dblclick', '.w', function (event) {
		var $divID = $(this);

		$('#renameConceptInput').val($divID.text());
		$('#conceptRenameModal').modal('show');
		
		$('#renameConceptForm').unbind().on('submit', function (event) {
			// if main concept, still bold
			if ($divID.attr('id') == 'concept1') {
				$('#' + $divID.attr('id')).html('<strong>' + $('#renameConceptInput').val() + '</strong>');
			}
			else {
				$('#' + $divID.attr('id')).html($('#renameConceptInput').val());
			}
			
			$('#' + $divID.attr('id')).append("<div class='ep'></div>");
			$('#conceptRenameModal').modal('hide');
			instance.repaintEverything();
			return false;
		});

	});
	

	// bind a connection listener. note that the parameter passed to this function contains more than
	// just the new connection - see the documentation for a full list of what is included in 'info'.
	// this listener sets the connection's internal
	// id as the label overlay's text.
    instance.bind("connection", function(info) {
		//info.connection.getOverlay("label").setLabel(info.connection.id);
		info.connection.getOverlay("label").setLabel("Add Text");
    });

	// initialize the windows, make sources / targets
	initStuff (windows);
	

	// on click of add concept button
	$('#AddConceptButton').click(function () {
		AddConcept($('#AddConceptForm').val());
		$('#AddConceptForm').val("");
		return false;
	});
	
	// trying to add concepts
	function AddConcept(formValue) {
		// get the total number of windows
		var allConnections = (jsPlumb.getSelector(".statemachine-demo .w")).length;
		var divID = allConnections + 1;
		// add this new div
		if (!formValue) {
			var $newDiv = "<div class='w' id='concept" + divID + "'>Concept " + divID + "</strong><div class='ep'></div></div>";	
		}
		else {
			var $newDiv = "<div class='w' id='concept" + divID + "'>" + formValue + "</strong><div class='ep'></div></div>";
		}
		$('#concept1').before($newDiv);
				
		// jsplumb the new div
		instance.draggable(jsPlumb.getSelector("#concept" + divID), {containment:".demo"});
		var newWindows = jsPlumb.getSelector("#concept" + divID);
		initStuff (newWindows);
	}
	
	// initializing windows, making sources/targets functions
	function initStuff (win) {
		// suspend drawing and initialise.
		instance.doWhileSuspended(function() {
			var isFilterSupported = instance.isDragFilterSupported();
			// make each ".ep" div a source and give it some parameters to work with.  here we tell it
			// to use a Continuous anchor and the StateMachine connectors, and also we give it the
			// connector's paint style.  note that in this demo the strokeStyle is dynamically generated,
			// which prevents us from just setting a jsPlumb.Defaults.PaintStyle.  but that is what i
			// would recommend you do. Note also here that we use the 'filter' option to tell jsPlumb
			// which parts of the element should actually respond to a drag start.
			// here we test the capabilities of the library, to see if we
			// can provide a `filter` (our preference, support by vanilla
			// jsPlumb and the jQuery version), or if that is not supported,
			// a `parent` (YUI and MooTools). I want to make it perfectly
			// clear that `filter` is better. Use filter when you can.
			if (isFilterSupported) {
				instance.makeSource(win, {
					filter:".ep",
					anchor:"Continuous",
					connector:[ "StateMachine", { curviness:20, proximityLimit:150 } ],
					connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
					maxConnections:5,
					onMaxConnections:function(info, e) {
						alert("Maximum connections (" + info.maxConnections + ") reached");
					}
				});
			}
			else {
				var eps = jsPlumb.getSelector(".ep");
				for (var i = 0; i < eps.length; i++) {
					var e = eps[i], p = e.parentNode;
					instance.makeSource(e, {
						parent:p,
						anchor:"Continuous",
						connector:[ "StateMachine", { curviness:20, proximityLimit:200 } ],
						connectorStyle:{ strokeStyle:"#5c96bc",lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
						maxConnections:5,
						onMaxConnections:function(info, e) {
							alert("Maximum connections (" + info.maxConnections + ") reached");
						}
					});
				}
			}
		});

		// initialise all '.w' elements as connection targets.
		instance.makeTarget(win, {
			dropOptions:{ hoverClass:"dragHover" },
			anchor:"Continuous"				
		});
	};
	
	
	// and finally, make a couple of connections
	instance.connect({ source:"concept1", target:"concept2" });
	instance.connect({ source:"concept1", target:"concept3" });
	instance.connect({ source:"concept2", target:"concept4" });
	instance.connect({ source:"concept3", target:"concept4" });
	instance.connect({ source:"concept3", target:"concept5" });

	jsPlumb.fire("jsPlumbDemoLoaded", instance);

});