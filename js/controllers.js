// vi: set ts=2 or set tab=2 spaces in lesser editors

function LG()  { console.log( arguments );	}
function LGT() {
	var args  = $.makeArray(arguments); 
	var delay = args.pop();
	setTimeout( function() {LG( args );}, delay );
}

'use strict';

window.JQ = jQuery;

function mainCtrl($scope, $routeParams, $http, cachePager, confTa ) {
	var __     = this;
	this.scope = $scope;
	this.CP    = cachePager;
	this.http  = $http;
	$scope.conf= confTa;
	$scope.paneType = 'TA';

	var CP = cachePager;

	$.extend( $scope, {	
		notify : '',
		type: 'Positive', 
		reverseType: 'Negative', 
		tabRows :[{h:'5'}, {h:'10'}, {h:'20'}, {h:'30'}, {h:'50'}],
		//apiUrl : '/proxy.php//api/textad/'
		apiUrl : '/api/'
	} );
	$scope.tabRowCount = $scope.tabRows[1];

// Mehtods 
	$scope.msg = function(content, success) {
		this.notify = content + ( success ? ' successful' : ' failed' );
		__.notify( success );
	}

	$scope.toggleType = function( useIt ) {
		if ( usetIt ) {
			$scope.type 				= ( $scope.type == 'Positive' ) ? 'Negative' : 'Positive';
			$scope.reverseType 	= ( $scope.type == 'Positive' ) ? 'Negative' : 'Positive';
			$scope.list	  	= false;
			__.init();
		}
	}

	// Item Table - BEGIN
	$scope.fieldClick = function(id, field) {
		switch ( field ) {
			case 'status':
				this.item        = __.itemById( id );
				this.item.status = this.item.status == 'production' ? 'testing' : 'production';

				if ( this.item.id != -1 ) 
					__.httpRow(this.item,'save', this.cbRow);
			break;
			default: break;
		}
	}

	$scope.isAddRow = function( id ) { return id == -1 ? 'newRow' : ''; }

	$scope.domRow = function( elm, enabled, targetEl ) {
		if ( enabled ) {
			$(elm).find('input').attr('disabled', false).addClass('edit');
			$(elm).find('.keyword > input').focus();
			$(elm).find('input').keypress(__.keyPressItem);
		} else {
			$(elm).find('input').unbind('keypress',__.keyPressItem);
			$(elm).find('input').attr('disabled', 'disabled').removeClass('edit');
			if ( targetEl.hasClass('del') ) {
				CP.refreshActiveO('items',$scope.list.id,-1);
			}
		}
	}

	$scope.newRow = function( ) {
		if ( $scope.list.id > 0 ) {
			if ( CP.hasNoEmpties( 'items', $scope.list.id ) ) { // allow only one new row without saving
				CP.pushItem( 'items', $scope.list.id,
					{	id:-1, 
						listId: $scope.list.id, 
						keyword:'', 
						desc1:'', 
						desc2:'', 
						status:'testing'}
				);
				setTimeout("$('#items_wrap tr#item_list_-1 btn.edit').trigger('click');" , 300);
			}
			$scope.items = CP.pageScroll('first');
		}
	}

	$scope.editRow	= function( id, cancelling )	{ 
		if ( !cancelling ) {
			__.httpRow( __.itemById( id ), 'save', $scope.cbRow ); 
			if ( id == -1 ) {
				setTimeout( "$('#items_list tr.header .add').trigger('click')" , 200);
			}
			$("*:focus").blur();
		}
	}

	$scope.delRow = function( id, cancelling) {
		if ( id == -1 ) { // cancel new row
 			CP.refreshActiveO('items',$scope.list.id,-1);
			$scope.items = CP.pageScroll('first');
			$scope.$digest(); // HACK 
		} else { // delete
			if ( !cancelling ) {
				$scope.item = __.itemById( id );
				if ( confirm('This will delete headline:\n\n"' + $scope.item.keyword 
						+ '"\n\nClick OK to delete.') ) {
					__.httpRow( $scope.item, 'del', $scope.cbRow );
				}
			}
		}
	}

	$scope.cbRow = function( result, action ) {
		if ( typeof result.newId != 'undefined' ) { 
			__.itemById( -1 ).id = result.newId;
			result = parseInt( result.newId ) > 0;
		} else {
			result = result == '"success"';
		}

		if ( ( action == 'del' ) && result ) {
			CP.refreshActiveO('items', $scope.list.id, $scope.item.id);
			$scope.items = CP.pageScroll();
		}

		$scope.msg( 'Keyword ' + ( action=='del' ? 'delete ' : 'save ' ), result); 
	}

	$scope.editBulk = function(dummy, opening) {
	 	if ( opening ) {
			$("#items_wrap tr.item_list").addClass('write');
			$("#items_wrap tr.item_list input").attr('disabled',false).addClass('edit');
			$("#items_wrap tr.item_list input:first").focus();
		} else {
			if ( confirm( "Save all items? ") ) {
				$.each($("#items_wrap tr.item_list"), function( id, domEl ) {
					if ($(domEl).hasClass('write')) {
						$(domEl).find('.edit').trigger('click');
					}
				});
			} else {
				$scope.delBulk(false, true);
			}
		}
	}

	$scope.delBulk = function(dummy,opening) {
	 	if ( opening ) {
			$("#items_wrap tr.item_list").removeClass('write');
			$("#items_wrap tr.item_list input").attr('disabled','disabled').removeClass('edit');
		} else {
			//$scope.msg( 'Deleting all items not implemented - ', false);
			//$scope.$digest();
		}
	}

	$scope.domBulk = function() {
	}

	$scope.listChange = function() {
		if ( $scope.list.id < 0 ) {
			if (confirm('You don\'t have root category "' + $scope.list.name + '".\n\nWould you like to create it?')) {
				$scope.editList( -1, false );
			}
		}
		$scope.activeListId =  $scope.list.id;
		__.loadItems( $scope.list.id );
	}
	// Item Table - END

	$scope.pager 		= function ( way ) { $scope.items = CP.pageScroll( way );	}
	$scope.getPage 	= function ( way ) { return CP.getPage(); 								}

	$scope.itemsResize = function( arg ) {
		$scope.items = CP.pageScroll('',parseInt(arg.tabRowCount.h));
	}

	$scope.listRestore = function() {
		var idParent = $('.fullBox.lists' );
		if ( idParent.hasClass('write') ) 
			idParent.find('.del').trigger('click'); // ugly cheat
		$('.fullBox.lists').find('select, .add, .del, .edit').show(); // show list selects
	}

	$scope.domList = function( dataPar, editting, el ) {
		$(dataPar).find('select')[editting ? 'hide' : 'show']();
		$(dataPar).find('input' )[editting ? 'show' : 'hide']()
														.focus()
														.val( el.hasClass('add') ? '' : $scope.list.name );
		$(dataPar).find('form input').show();

		var input = $(dataPar).find('input');
		if ( editting && typeof input.data('events').keypress == 'undefined' )
			input.keypress(__.keyPressList);
	}

	$scope.addList 	= function(dataId, cancelling)	{ 
		__.addListMode = true;
		if ( !cancelling) {
			__.httpList({ id: -1, name: $scope.list.name }, 'save', $scope.cbList );
		}
	}

	$scope.editList	= function(dataId, cancelling)	{ 
		if ( !cancelling ) {
			if ( __.addListMode || ( dataId == -1 ) ) $scope.list.id = -1;

			__.httpList( $scope.list, 'save', $scope.cbList ); 		
		}
	}
	$scope.delList	= function(dataId, cancelling)	{
		__.addListMode = false;
		if ( !cancelling && confirm('Delete list "' + $scope.list.name + '".\n\nPlease confirm.') ) {
			__.httpList( $scope.list, 'del', $scope.cbList );
		}
	}

	$scope.cbList = function( result, action ) {
		__.addListMode = false;
		$scope.msg( 'List ' + ( action=='del' ? 'delete ' : 'save ' ), result == '"success"');
		
		var categoryName = __.getListHead($scope.list.name);
		__.init( function() { $scope.categoryClick(categoryName) } ); 

	}

	$scope.lookF = function() {
		CP.findItems( $scope.lookStr, $scope.list.id );
		$scope.items = CP.pageScroll();
	}

	$scope.categoryClick = function(name) {
		$scope.listRestore();
		LG( $scope.listHeads );

		if ( typeof name == 'undefined' ) {
			if ( typeof $scope.list != 'undefined' && $scope.list ) {
				var listName = $scope.list.name;
				$scope.lists =  __.getListByName( __.getListHead(listName) );
				if ( typeof $scope.lists == 'undefined' )
					$scope.lists =  __.getListByName( $scope.listHeads[0] );
				$scope.list = $scope.lists[__.listById( $scope.activeListId )];
			} else {
				$scope.lists = __.getListByName( $scope.listHeads[0] );
				$scope.list  = $scope.lists[ $scope.lists[0].id == -1 ? 1 : 0 ]; // get non-empty
			}
		} else {
			$scope.lists = __.getListByName( __.getListHead(name) );
			if ( typeof $scope.lists == 'undefined' )
				$scope.lists =  __.getListByName( $scope.listHeads[0] );
			$scope.list  = $scope.lists[ $scope.lists[0].id == -1 ? 1 : 0 ]; // get non-empty
		}
		if ( $scope.list )
			__.loadItems( $scope.list.id );
	}

	$scope.init = function() { __.init(); return this; }
	__.init();
}

//  this should be moved to services
mainCtrl.prototype = {

	notify: function( success, msg ) {
		$('#item_notify')[success ? 'removeClass' : 'addClass']('fail').show();
		setTimeout( "$('#item_notify').fadeOut('slow');", (success ? 1500 : 8000) );
	},

	getListByName: function( listName ) {
		return this.CP.fetchList('lists', this.scope.type, listName );
	},

	getListHead: function( name ) {
		return $.trim( ( name.indexOf(':') > -1 ) ? name.split(':')[0] : name );
	},

	_getById : function( id, items ) { 
		for ( var i in items ) {
			if ( items[i].id == id ) return i;
		}
		return false;
	},

	itemById : function( id, indexOnly ) {
		return ( (typeof indexOnly != 'undefined') && indexOnly )
							? this._getById( id, $scope.items )
							: this.scope.items[this._getById( id, this.scope.items )];
	},

	listById: function ( id ) {
		return this._getById( id, this.scope.lists );
	},

	httpRow: function( item , action, cbRow ) {
		var data = '';
		if ( item.keyword ) {
			switch ( action ) {
				case 'save': 
					$.each(item, function(a,b) { data += '/' + a + '=' + (b ? b : ' '); }); 
					break;
				case 'del' : data = '/' + item.id; break;
				default    : break;
			} 
		}else {
			alert('Please enter headline before saving.');
			$('#items_wrap .item_list:first btn.edit').trigger('click');
		}

		if ( data ) {
			this.http.get( this.scope.apiUrl + action + data ).success( 
				function( returnData ) { cbRow( returnData, action ); }
			);
		}
	},

	httpList: function( list, action, cbList ) {
		var data = list.id + '/' + list.name + '/' + this.scope.type.toLowerCase();

		var __ = this;
		this.http.get( this.scope.apiUrl + action + 'list/' + data )
			.success( function(returnData ) { 
				cbList( returnData, action );
			});
	},

	loadItems : function( id ) {
		$('#items_list')[id == -1 ? 'hide' : 'show']();
		var name = this.scope.list.name;
		this.scope.activeListId =  this.scope.list.id;

		var __ = this;
		if ( this.CP.isMissing( 'items', id ) ) {
			this.http.get( this.scope.apiUrl + 'getlist/' + name + '/' + this.scope.type.toLowerCase())
				.success( function(data) {
					__.CP.push('items', id, data );
					__.scope.items = __.CP.pagerOpen('items', id, parseInt(__.scope.tabRowCount.h), 0);
				if ( __.scope.items.length == 0 ) __.scope.newRow();
			});
		} else {
			this.scope.items = this.CP.pagerOpen('items', id, parseInt(this.scope.tabRowCount.h), 0);
		}
	},

	keyPressList: function( evt ) {
		switch ( evt.which ) {
			case '13': case 13:
				if ($(evt.target).parents('.fullBox.lists').hasClass('write')) {
					$(evt.target).parents('.fullBox.lists').find('.edit').trigger('click'); 
				}
				break;
			case '96': case 96: // escape key
				if ($(evt.target).parents('.fullBox.lists').hasClass('write')) {
					$(evt.target).parents('.fullBox.lists').find('.del').trigger('click'); 
				}
				break;
			default: return true;
		}
		return false;
	},

	keyPressItem: function( evt ) {
		var buttons = $(evt.target).parents('.item_list').find('buttons');
		switch ( evt.which ) {
			case '13': case 13:
				if ($(evt.target).parents('.item_list').hasClass('write'))
					buttons.find('.edit').trigger('click'); 
				break;
			case '96': case 96:
				if ($(evt.target).parents('.item_list').hasClass('write'))
					buttons.find('.del').trigger('click'); break;
			default: return true;
		}
		return false;
	},

	loadLists: function( reload , cb) {
		if ( reload || this.CP.isMissing( 'lists', this.scope.type ) ) {
			if ( reload ) { this.init(); return false; }

			var __ = this;
			this.http.get( this.scope.apiUrl + 'getlists/' + this.scope.type.toLowerCase() )
				.success( function(data) {
					var listHeads = [];
					$.each(data, function( key, val ) { 
						listHeads.push( key );
						if ( val[0].name != key ) { // create void list to match a list head
							val.unshift( {name: key, id: -1} );
						}
					});

					__.CP.push( 'listHeads',__.scope.type, listHeads);
					__.scope.listHeads = listHeads;

					__.CP.push( 'lists', __.scope.type, data );
					__.scope.categoryClick();
					if ( typeof cb == 'function' ) cb();
			});
		} else { // already loaded
			this.scope.listHeads 	= this.CP.pagerOpen( 'listHeads',	this.scope.type, -1 );
		}
	},

	init: function( cb )  {
  	this.CP.store = {}; // clear cache
		$('#items_list').hide();
		this.scope.listHeads 	= [];
		this.scope.lists  		= [];
		this.scope.items 			= [];
		this.activeListId     = false;
		this.loadLists(false, cb);
	}
}

//mainCtrl.$inject( ['$scope', '$routeParams', '$http'] );
