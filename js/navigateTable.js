
/*
 * Plugin para poder navegar una tabla por linea con las teclas up y down
 * 
 * Basado en el plugin keyTable.js descargado de http://www.sprymedia.co.uk/article/KeyTable
 */

function NavigateTable ( oInit )
{
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API parameters
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
        /**
         * Div contenedor que tiene el scroll para hacer autoscroll
         */
        this.container = null; 
        
	/*
	 * Variable: block
	 * Purpose:  Flag whether or not KeyTable events should be processed
	 * Scope:    KeyTable - public
	 */
	this.block = false;
	
	/*
	 * Variable: event
	 * Purpose:  Container for all event application methods
	 * Scope:    KeyTable - public
	 * Notes:    This object contains all the public methods for adding and removing events - these
	 *           are dynamically added later on
	 */
	this.event = {
		"remove": {}
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Function: fnGetCurrentPosition
	 * Purpose:  Get the currently focused cell's position
	 * Returns:  array int: [ x, y ]
	 * Inputs:   void
	 */
	this.fnGetCurrentPosition = function ()
	{
//		return [ _iOldX, _iOldY ];
                return _iOldY;
	};
	
	
	/*
	 * Function: fnGetCurrentData
	 * Purpose:  Get the currently focused cell's data (innerHTML)
	 * Returns:  string: - data requested
	 * Inputs:   void
	 */
	this.fnGetCurrentData = function ()
	{
		return _nOldFocus.innerHTML;
	};
	
	
	/*
	 * Function: fnGetCurrentTD
	 * Purpose:  Get the currently focused cell
	 * Returns:  node: - focused element
	 * Inputs:   void
	 */
	this.fnGetCurrentTD = function ()
	{
		return _nOldFocus;
	};
	
	
	/*
	 * Function: fnSetPosition
	 * Purpose:  Set the position of the focused cell
	 * Returns:  -
	 * Inputs:   int:x - x coordinate
	 *           int:y - y coordinate
	 * Notes:    Thanks to Rohan Daxini for the basis of this function
	 */
	this.fnSetPosition = function( x, y )
	{
		if ( typeof x == 'object' && x.nodeName )
		{
			_fnSetFocus( x );
		}
		else
		{
			_fnSetFocus( _fnRowFromCoords(y) );
		}
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private parameters
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Variable: _nBody
	 * Purpose:  Body node of the table - cached for renference
	 * Scope:    KeyTable - private
	 */
	var _nBody = null;
	
	/*
	 * Variable: 
	 * Purpose:  
	 * Scope:    KeyTable - private
	 */
	var _nOldFocus = null;
	
	/*
	 * Variable: _iOldX and _iOldY
	 * Purpose:  X and Y coords of the old elemet that was focused on
	 * Scope:    KeyTable - private
	 */

	var _iOldY = null;
	
	/*
	 * Variable: _that
	 * Purpose:  Scope saving for 'this' after a jQuery event
	 * Scope:    KeyTable - private
	 */
	var _that = null;
	
	/*
	 * Variable: sFocusClass
	 * Purpose:  Class that should be used for focusing on a cell
	 * Scope:    KeyTable - private
	 */
	var _sFocusClass = "focus";
	
	/*
	 * Variable: _bKeyCapture
	 * Purpose:  Flag for should KeyTable capture key events or not
	 * Scope:    KeyTable - private
	 */
	var _bKeyCapture = false;
	
	/*
	 * Variable: _oaoEvents
	 * Purpose:  Event cache object, one array for each supported event for speed of searching
	 * Scope:    KeyTable - private
	 */
	var _oaoEvents = {
		"action": [],
		"esc": [],
		"focus": [],
		"blur": []
	};
	
	/*
	 * Variable: _oDatatable
	 * Purpose:  DataTables object for if we are actually using a DataTables table
	 * Scope:    KeyTable - private
	 */
	var _oDatatable = null;
	
	var _bForm;
	var _nInput;
	var _bInputFocused = false;
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Key table events
	 */
	
	/*
	 * Function: _fnEventAddTemplate
	 * Purpose:  Create a function (with closure for sKey) event addition API
	 * Returns:  function: - template function
	 * Inputs:   string:sKey - type of event to detect
	 */
	function _fnEventAddTemplate( sKey )
	{
		/*
		 * Function: -
		 * Purpose:  API function for adding event to cache
		 * Returns:  -
		 * Inputs:   1. node:x - target node to add event for
		 *           2. function:y - callback function to apply
		 *         or
		 *           1. int:x - x coord. of target cell (can be null for live events)
		 *           2. int:y - y coord. of target cell (can be null for live events)
		 *           3. function:z - callback function to apply
		 * Notes:    This function is (interally) overloaded (in as much as javascript allows for
		 *           that) - the target cell can be given by either node or coords.
                 *           
                 * Elimine x de esta funcion
		 */
		return function ( y, z ) {
			if ( 
			     (y===null || typeof y == "number") && 
			     typeof z == "function" )
			{
				_fnEventAdd( sKey, y, z );
			}
			else if ( typeof y == "object" && typeof y == "function" )
			{
				var aCoords = _fnCoordsFromRow( y );
				_fnEventAdd( sKey, aCoords[1], z );
			}
			else
			{
				alert( "Unhandable event type was added: y:" +y+ "  z:" +z );
			}
		};
	}
	
	
	/*
	 * Function: _fnEventRemoveTemplate
	 * Purpose:  Create a function (with closure for sKey) event removal API
	 * Returns:  function: - template function
	 * Inputs:   string:sKey - type of event to detect
	 */
	function _fnEventRemoveTemplate( sKey )
	{
		/*
		 * Function: -
		 * Purpose:  API function for removing event from cache
		 * Returns:  int: - number of events removed
		 * Inputs:   1. node:x - target node to remove event from
		 *           2. function:y - callback function to apply
		 *         or
		 *           1. int:x - x coord. of target cell (can be null for live events)
		 *           2. int:y - y coord. of target cell (can be null for live events)
		 *           3. function:z - callback function to remove - optional
		 * Notes:    This function is (interally) overloaded (in as much as javascript allows for
		 *           that) - the target cell can be given by either node or coords and the function
		 *           to remove is optional
		 */
		return function ( x, y, z ) {
			if ( (x===null || typeof arguments[0] == "number") && 
			     (y===null || typeof arguments[1] == "number" ) )
			{
				if ( typeof arguments[2] == "function" )
				{
					_fnEventRemove( sKey, x, y, z );
				}
				else
				{
					_fnEventRemove( sKey, x, y );
				}
			}
			else if ( typeof arguments[0] == "object" )
			{
				var aCoords = _fnCoordsFromRow( x );
				if ( typeof arguments[1] == "function" )
				{
					_fnEventRemove( sKey, aCoords[0], aCoords[1], y );
				}
				else
				{
					_fnEventRemove( sKey, aCoords[0], aCoords[1] );
				}
			}
			else
			{
				alert( "Unhandable event type was removed: x" +x+ "  y:" +y+ "  z:" +z );
			}
		};
	}
	
	/* Use the template functions to add the event API functions */
	for ( var sKey in _oaoEvents )
	{
		if ( sKey )
		{
			this.event[sKey] = _fnEventAddTemplate( sKey );
			this.event.remove[sKey] = _fnEventRemoveTemplate( sKey );
		}
	}
	
	
	/*
	 * Function: _fnEventAdd
	 * Purpose:  Add an event to the internal cache
	 * Returns:  -
	 * Inputs:   string:sType - type of event to add, given by the available elements in _oaoEvents
	 *           int:x - x-coords to add event to - can be null for "blanket" event
	 *           int:y - y-coords to add event to - can be null for "blanket" event
	 *           function:fn - callback function for when triggered
	 */
	function _fnEventAdd( sType, y, fn )
	{
		_oaoEvents[sType].push( {
			"y": y,
			"fn": fn
		} );
	}
	
	
	/*
	 * Function: _fnEventRemove
	 * Purpose:  Remove an event from the event cache
	 * Returns:  int: - number of matching events removed
	 * Inputs:   string:sType - type of event to look for
	 *           node:nTarget - target table cell
	 *           function:fn - optional - remove this function. If not given all handlers of this
	 *             type will be removed
	 */
	function _fnEventRemove( sType, x, y, fn )
	{
		var iCorrector = 0;
		
		for ( var i=0, iLen=_oaoEvents[sType].length ; i<iLen-iCorrector ; i++ )
		{
			if ( typeof fn != 'undefined' )
			{
				if ( 
				     _oaoEvents[sType][i-iCorrector].y == y &&
					   _oaoEvents[sType][i-iCorrector].fn == fn )
				{
					_oaoEvents[sType].splice( i-iCorrector, 1 );
					iCorrector++;
				}
			}
			else
			{
				if ( 
				     _oaoEvents[sType][i-iCorrector].y == y )
				{
					_oaoEvents[sType].splice( i, 1 );
					return 1;
				}
			}
		}
		return iCorrector;
	}
	
	
	/*
	 * Function: _fnEventFire
	 * Purpose:  Look thought the events cache and fire off the event of interest
	 * Returns:  int:iFired - number of events fired
	 * Inputs:   string:sType - type of event to look for
	 *           int:y - y coord of  ell
	 * Notes:    It might be more efficient to return after the first event has been tirggered,
	 *           but that would mean that only one function of a particular type can be
	 *           subscribed to a particular node.
	 */
	function _fnEventFire ( sType, y )
	{
            
//                console.log("fnEventFire... sType:"+sType+" y:"+y);
		var iFired = 0;
		var aEvents = _oaoEvents[sType];
		for ( var i=0 ; i<aEvents.length ; i++ )
		{
			if ( (aEvents[i].y == y    ) ||
			     (aEvents[i].y === null )
			)
			{
				aEvents[i].fn( _fnRowFromCoords(y), y );
				iFired++;
			}
		}
		return iFired;
	}
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Focus functions
	 */
	
	/*
	 * Function: _fnSetFocus
	 * Purpose:  Set focus on a node, and remove from an old node if needed
	 * Returns:  -
	 * Inputs:   node:nTarget - node we want to focus on
	 *           bool:bAutoScroll - optional - should we scroll the view port to the display
	 */
	function _fnSetFocus( nTarget, bAutoScroll )
	{
            bAutoScroll = true;
		/* If node already has focus, just ignore this call */
		if ( _nOldFocus == nTarget )
		{
			return;
		}
		
		if ( typeof bAutoScroll == 'undefined' )
		{
			bAutoScroll = true;
		}
		
		/* Remove old focus (with blur event if needed) */
		if ( _nOldFocus !== null )
		{
			_fnRemoveFocus( _nOldFocus );
		}
		
		/* Add the new class to highlight the focused row */
		jQuery(nTarget).addClass( _sFocusClass );
		
		/* If it's a DataTable then we need to jump the paging to the relevant page */
		var oSettings;
		
		/* Cache the information that we are interested in */
		var aNewPos = _fnCoordsFromRow( nTarget );
		_nOldFocus = nTarget;
		_iOldY = aNewPos;		
                
		var iViewportHeight, iViewportWidth, iScrollTop, iScrollLeft, iHeight, iWidth, aiPos, containerPos;
		if ( bAutoScroll )
		{
//                    console.log("bAutoScroll ");
			/* Scroll the viewport such that the new cell is fully visible in the rendered window */
			if (this.container == null) {
//                            console.log("container == Null");
                            iViewportHeight = document.documentElement.clientHeight;
                            iViewportWidth = document.documentElement.clientWidth;
                            iScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                            iScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                            containerPos = [0,0];
                        } else {
//                            console.log("container => "+this.container);
                            iViewportHeight = this.container.offsetHeight;
                            iViewportWidth = this.container.offsetWidth;
                            iScrollTop = this.container.scrollTop;
                            iScrollLeft = this.container.scrollLeft;
                            containerPos = _fnGetPos( this.container );
                        }
                        
//                        console.log("Autoscroll: "+iViewportHeight+" "+iViewportWidth+" "+iScrollTop+" "+iScrollLeft);
                        
			iHeight = nTarget.offsetHeight;
			aiPos = _fnGetPos( nTarget );
                        
			
			/* Correct viewport positioning for vertical scrolling */
			if ( aiPos[1]+iHeight > containerPos[1]+iScrollTop+iViewportHeight )
			{
				/* Displayed element if off the bottom of the viewport */
                                this.container.scrollTop = aiPos[1]+iHeight - iViewportHeight - containerPos[1];
			}
			else if ( aiPos[1] < containerPos[1]+iScrollTop )
			{
				/* Displayed element if off the top of the viewport */
                                this.container.scrollTop = aiPos[1] - containerPos[1];
			}
			

		}
		

		/* Focused - so we want to capture the keys */
		_fnCaptureKeys();
		
		/* Fire of the focus event if there is one */
		_fnEventFire( "focus", _iOldY);
	}
	
	
	/*
	 * Function: _fnBlur
	 * Purpose:  Blur focus from the whole table
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnBlur()
	{
		_fnRemoveFocus( _nOldFocus );
		_iOldY = null;
		_nOldFocus = null;
		_fnReleaseKeys();
	}
	
	
	/*
	 * Function: _fnRemoveFocus
	 * Purpose:  Remove focus from a cell and fire any blur events which are attached
	 * Returns:  -
	 * Inputs:   node:nTarget - cell of interest
	 */
	function _fnRemoveFocus( nTarget )
	{
		jQuery(nTarget).removeClass( _sFocusClass );
		jQuery(nTarget).parent().removeClass( _sFocusClass );
		_fnEventFire( "blur", _iOldY );
	}
	
	
	/*
	 * Function: _fnClick
	 * Purpose:  Focus on the element that has been clicked on by the user
	 * Returns:  -
	 * Inputs:   event:e - click event
	 */
	function _fnClick ( e )
	{
		var nTarget = this;
		while ( nTarget.nodeName != "TD" )
		{
			nTarget = nTarget.parentNode;
		}
		
		_fnSetFocus( nTarget );
		_fnCaptureKeys();
	}
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Key events
	 */
	
	/*
	 * Function: _fnKey
	 * Purpose:  Deal with a key events, be it moving the focus or return etc.
	 * Returns:  bool: - allow browser default action
	 * Inputs:   event:e - key event
	 */
	function _fnKey ( e )
	{
		/* If user or system has blocked KeyTable from doing anything, just ignore this event */
		if ( _that.block || !_bKeyCapture )
		{
			return true;
		}
		
		/* If a modifier key is pressed (exapct shift), ignore the event */
		if ( e.metaKey || e.altKey || e.ctrlKey )
		{
		    return true;
		}
		var
			x, y,
			iTableWidth = _nBody.getElementsByTagName('tr')[0].getElementsByTagName('td').length, 
			iTableHeight;
		
		/* Get table height and width - done here so as to be dynamic (if table is updated) */

                iTableHeight = _nBody.getElementsByTagName('tr').length;

		
		/* Capture shift+tab to match the left arrow key */
		var iKey = (e.keyCode == 9 && e.shiftKey) ? -1 : e.keyCode;
		
		switch( iKey )
		{
			case 13: /* return */
			 	e.preventDefault();
 				e.stopPropagation();
				_fnEventFire( "action", _iOldY );
				return true;
				
			case 27: /* esc */
				if ( !_fnEventFire( "esc", _iOldY ) )
				{
					/* Only lose focus if there isn't an escape handler on the cell */
					_fnBlur();
					return;
				}
				y = _iOldY;
				break;
			
			case -1:
			case 37: /* left arrow */
                            //scroll left
                            if (this.container != null) {
                                this.container.scrollTop = this.container.offsetHeight;
                            }
                            break;
			case 38: /* up arrow */
//                                console.log("Up key pressed "+_iOldY);
				if ( _iOldY > 0 ) {
					y = _iOldY - 1;
				} else {
					return false;
				}
				break;
			
			case 39: /* right arrow */
                            //scroll right
                            if (this.container != null) {
                                iViewportHeight = this.container.offsetHeight;
                                iScrollTop = this.container.scrollTop;
                                this.container.scrollLeft = this.container.offsetWidth;
                            }
                            break;
			case 40: /* down arrow */
//                                console.log("Down key pressed "+_iOldY);
				if ( _iOldY < iTableHeight-1 ) {
					y = _iOldY + 1;
				} else {
					return false;
				}
				break;
                                
			case 9: /* tab */
			default: /* Nothing we are interested in */
				return true;
		}
		
		_fnSetFocus( _fnRowFromCoords( y) );
		return false;
	}
	
	
	/*
	 * Function: _fnCaptureKeys
	 * Purpose:  Start capturing key events for this table
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnCaptureKeys( )
	{
		if ( !_bKeyCapture )
		{
			_bKeyCapture = true;
		}
	}
	
	
	/*
	 * Function: _fnReleaseKeys
	 * Purpose:  Stop capturing key events for this table
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnReleaseKeys( )
	{
		_bKeyCapture = false;
	}
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Support functions
	 */
	
	/*
	 * Function: _fnCellFromCoords
	 * Purpose:  Calulate the target TD cell from x and y coordinates
	 * Returns:  node: - TD target
	 * Inputs:   int:x - x coordinate
	 *           int:y - y coordinate
	 */
	function _fnCellFromCoords( x, y )
	{
            return jQuery('tr:eq('+y+')>td:eq('+x+')', _nBody )[0];
        }
	
        /**
         * Mismo que lo anterior pero devuelve el tr en vez del td
         */
        function _fnRowFromCoords( y )
	{
            return jQuery('tr:eq('+y+')', _nBody )[0];
        }
	
	/*
	 * Function: _fnCoordsFromCell
	 * Purpose:  Calculate the x and y position in a table from a TD cell
	 * Returns:  array[2] int: [x, y]
	 * Inputs:   node:n - TD cell of interest
	 * Notes:    Not actually interested in this for DataTables since it might go out of date
	 */
	function _fnCoordsFromCell( n )
	{
                return [
                        jQuery('td', n.parentNode).index(n),
                        jQuery('tr', n.parentNode.parentNode).index(n.parentNode)
                ];
	}
	
        /*
         * Same as before but n is not a tr
         */
	function _fnCoordsFromRow( n )
	{
                return  jQuery('tr', n.parentNode).index(n);
	}

	/*
	 * Function: _fnSetScrollTop
	 * Purpose:  Set the vertical scrolling position
	 * Returns:  -
	 * Inputs:   int:iPos - scrolltop
	 * Notes:    This is so nasty, but without browser detection you can't tell which you should set
	 *           So on browsers that support both, the scroll top will be set twice. I can live with
	 *           that :-)
	 */
	function _fnSetScrollTop( iPos )
	{
		document.documentElement.scrollTop = iPos;
		document.body.scrollTop = iPos;
	}
	
	
	/*
	 * Function: _fnSetScrollLeft
	 * Purpose:  Set the horizontal scrolling position
	 * Returns:  -
	 * Inputs:   int:iPos - scrollleft
	 */
	function _fnSetScrollLeft( iPos )
	{
		document.documentElement.scrollLeft = iPos;
		document.body.scrollLeft = iPos;
	}
	
	
	/*
	 * Function: _fnGetPos
	 * Purpose:  Get the position of an object on the rendered page
	 * Returns:  array[2] int: [left, right]
	 * Inputs:   node:obj - element of interest
	 */
	function _fnGetPos ( obj )
	{
		var iLeft = 0;
		var iTop = 0;
		
		if (obj.offsetParent) 
		{
			iLeft = obj.offsetLeft;
			iTop = obj.offsetTop;
			obj = obj.offsetParent;
			while (obj) 
			{
				iLeft += obj.offsetLeft;
				iTop += obj.offsetTop;
				obj = obj.offsetParent;
			}
		}
		return [iLeft,iTop];
	}
	
	
	/*
	 * Function: _fnFindDtCell
	 * Purpose:  Get the coords. of a cell from the DataTables internal information
	 * Returns:  array[2] int: [x, y] coords. or null if not found
	 * Inputs:   node:nTarget - the node of interest
	 */
	function _fnFindDtCell( nTarget )
	{
		var oSettings = _oDatatable.fnSettings();
		for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
		{
			var nTr = oSettings.aoData[ oSettings.aiDisplay[i] ].nTr;
			var nTds = nTr.getElementsByTagName('td');
			for ( var j=0, jLen=nTds.length ; j<jLen ; j++ )
			{
				if ( nTds[j] == nTarget )
				{
					return [ j, i ];
				}
			}
		}
		return null;
	}
	
    
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Initialisation
	 */
	
	/*
	 * Function: _fnInit
	 * Purpose:  Initialise the KeyTable
	 * Returns:  -
	 * Inputs:   object:oInit - optional - Initalisation object with the following parameters:
	 *   array[2] int:focus - x and y coordinates of the initial target
	 *     or
	 *     node:focus - the node to set initial focus on
	 *   node:table - the table to use, if not given, first table with class 'KeyTable' will be used
	 *   string:focusClass - focusing class to give to table elements
	 *           object:that - focus
	 *   bool:initScroll - scroll the view port on load, default true
	 *   int:tabIndex - the tab index to give the hidden input element
	 */
	function _fnInit( oInit, that )
	{
            //inicializar contenedor
            if (typeof oInit.container != 'undefined') {
                this.container = oInit.container;
            }
            
		/* Save scope */
		_that = that;
                
        /* Capture undefined initialisation and apply the defaults */
		if ( typeof oInit == 'undefined' ) {
			oInit = {};
		}
		
		if ( typeof oInit.focus == 'undefined' ) {
			oInit.focus = 0;
		}
		
		if ( typeof oInit.table == 'undefined' ) {
			oInit.table = jQuery('table.KeyTable')[0];
		} else {
			$(oInit.table).addClass('KeyTable');
		}
		
		if ( typeof oInit.focusClass != 'undefined' ) {
			_sFocusClass = oInit.focusClass;
		}
		
		if ( typeof oInit.datatable != 'undefined' ) {
			_oDatatable = oInit.datatable;
		}
		
		if ( typeof oInit.initScroll == 'undefined' ) {
			oInit.initScroll = true;
		}
		
		if ( typeof oInit.form == 'undefined' ) {
			oInit.form = false;
		}
		_bForm = oInit.form;
		
		/* Cache the tbody node of interest */
		_nBody = oInit.table.getElementsByTagName('tbody')[0];
		
		/* If the table is inside a form, then we need a hidden input box which can be used by the
		 * browser to catch the browser tabbing for our table
		 */
                //no tenemos forms pero igual hay que requerir el focus para sacarlo de los input
                // si lo pongo en true no anda..
		if ( _bForm )  
//                if (true)
		{
			var nDiv = document.createElement('div');
			_nInput = document.createElement('input');
			nDiv.style.height = "1px"; /* Opera requires a little something */
			nDiv.style.width = "0px";
			nDiv.style.overflow = "hidden";
			if ( typeof oInit.tabIndex != 'undefined' )
			{
				_nInput.tabIndex = oInit.tabIndex;
			}
			nDiv.appendChild(_nInput);
			oInit.table.parentNode.insertBefore( nDiv, oInit.table.nextSibling );
			
			jQuery(_nInput).focus( function () {
				/* See if we want to 'tab into' the table or out */
//                                console.log("focus...")
				if ( !_bInputFocused )
				{
					_bKeyCapture = true;
					_bInputFocused = false;
                                        
					if ( typeof oInit.focus.nodeName != "undefined" )
					{
                                            
						_fnSetFocus( oInit.focus, oInit.initScroll );
					}
					else
					{
						_fnSetFocus( _fnRowFromCoords( oInit.focus), oInit.initScroll );
					}
					
					/* Need to interup the thread for this to work */
					setTimeout( function() { _nInput.blur(); }, 0 );
				}
			} );
			_bKeyCapture = false;
		}
		else
		{
                    
			/* Set the initial focus on the table */
			if ( typeof oInit.focus.nodeName != "undefined" )
			{
				_fnSetFocus( oInit.focus, oInit.initScroll );
			}
			else
			{
				_fnSetFocus( _fnRowFromCoords( oInit.focus), oInit.initScroll );
			}
			_fnCaptureKeys();
		}
		
		/*
		 * Add event listeners
		 * Well - I hate myself for doing this, but it would appear that key events in browsers are
		 * a complete mess, particulay when you consider arrow keys, which of course are one of the
		 * main areas of interest here. So basically for arrow keys, there is no keypress event in
		 * Safari and IE, while there is in Firefox and Opera. But Firefox and Opera don't repeat the
		 * keydown event for an arrow key. OUCH. See the following two articles for more:
		 *   http://www.quirksmode.org/dom/events/keys.html
		 *   https://lists.webkit.org/pipermail/webkit-dev/2007-December/002992.html
		 *   http://unixpapa.com/js/key.html
		 * PPK considers the IE / Safari method correct (good enough for me!) so we (urgh) detect
		 * Mozilla and Opera and apply keypress for them, while everything else gets keydown. If
		 * Mozilla or Opera change their implemention in future, this will need to be updated... 
		 * although at the time of writing (14th March 2009) Minefield still uses the 3.0 behaviour.
		 */
                //I comment this because it seems it doesn't work in jquery 1.9'
//		if ( jQuery.browser.mozilla || jQuery.browser.opera )
//		{
//			jQuery(document).bind( "keypress", _fnKey );
//		}
//		else
		{
			jQuery(document).bind( "keydown", _fnKey );
		}
		
		if ( _oDatatable )
		{
			jQuery('tbody td', _oDatatable.fnSettings().nTable).on( 'click', _fnClick );
		}
		else
		{
			jQuery('td', _nBody).on( 'click', _fnClick );
		}
		
		/* Loose table focus when click outside the table */
		jQuery(document).click( function(e) {
			var nTarget = e.target;
			var bTableClick = false;
			while ( nTarget )
			{
				if ( nTarget == oInit.table )
				{
					bTableClick = true;
					break;
				}
				nTarget = nTarget.parentNode;
			}
			if ( !bTableClick )
			{
				_fnBlur();
			}
		} );
                
        }
        
        /* Initialise our new object */
	_fnInit( oInit, this );
}