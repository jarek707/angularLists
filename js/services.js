'use strict';

angular.module('kword.service', [])
	.
	value( 'confKw', {
		paneType 	: 'keywords',
		mainHeader: 'Keywords',
		posNegClass: '',
		fields: [
				{ name: 'keyword', 	class: 'keyword', 		label: 'Keyword'},
				{ name: 'matchtype',class: '', 						label: 'Match Type' },
				{ name: 'make',   	class: '', 						label: 'Make' },
				{ name: 'model',   	class: '', 						label: 'Model' },
				{ name: 'status', 	class: 'status toggle',label: 'Status'}
			]
		}
	)
	.
	value( 'confTa', {
		paneType 	: 'textAds',
		mainHeader: 'Text Ads',
		posNegClass: 'hid',
		fields: [
				{ name: 'keyword', class: 'keyword', 			label: 'Headline'},
				{ name: 'desc1',   class: '', 						label: 'Desc 1' },
				{ name: 'desc2',   class: '', 						label: 'Desc 2' },
				{ name: 'status',  class: 'status toggle',label: 'Status'}
			]
		}
	)
	.
	value('fileHandler', {
		down: function( scope, k ) {
			var strS = '';
			var fieldsO = {};

			$.each( scope.conf.fields, function(a,b) { // header
				strS += b.label + "\t"; 
				fieldsO[b.name] = true;
			});
			strS = strS.replace(/	$/,"\n");

			$.each( k, function(a,b) {			// data
				$.each(b, function(c,d) {
					if ( fieldsO[c] === true ) strS += d + "\t";
				})
				strS = strS.replace(/	$/,"\n");
			});

			if ( navigator.userAgent.indexOf('Chrome') > -1 ){
				scope.downloadFile = scope.paneType + '-' + scope.list.name.replace(/ : /g,'-').replace(/ /g,'');
				scope.$digest();
				document.getElementById('DOWNCSV').href = 
					'data:text/plain;charset=utf-8,' + encodeURIComponent( strS );
				setTimeout("document.getElementById('DOWNCSV').click();", 300);
			} else {
				window.location.href =
					'data:application/csv;charset=utf-8,' + encodeURIComponent( strS );
			}
		},
		up: function( scope, el, dummy, bulk ) {
			var reader = new FileReader( scope );
			reader.readAsText(el.files[0]);
			reader.onload = function( arg ) {
				$.ajax({
					url:scope.apiUrl + 'upload' + bulk + '/' + scope.list.id, //data, 
					type: 'POST',
					data: {data: arg.target.result },
					headers : {'Content-Type':'application/json; charset=UTF-8; enctype="multipart/form-data"' }
				}).success( function(returnData ) { 
					var res = eval('(' + returnData + ')');

					var msgS = ( typeof res.fldCount != 'undefined' ) ? 'Upload of ' + res.fldCount + ' rows' : 'Upload';
					scope.init().msg( msgS, res.result == 'success');
					$('form')[0].reset();
				});
			}
		}
	})
	.
	value( 'cachePager', {
		store : {},
		rows : 3,
		start : 0,
		activeO : {},

		isMissing: function( key, subKey ) { 
			return 	typeof this.store[key] == 'undefined'
							? true 
							: typeof this.store[key][subKey] == 'undefined';
		},

		fetchList: function( key, subKey , subSubKey ) {
			return 	typeof subSubKey == 'undefined'
							? this.store[key][subKey]
							: this.store[key][subKey][subSubKey];	
		},

		dropItem: function( key, subKey, itemIndex ) {
			var refreshed = [];
			for ( var i in this.store[key][subKey] ) {
				if ( parseInt(this.store[key][subKey][i].id) != itemIndex ) {
					refreshed.push( this.store[key][subKey][i] );
				}
			}
			this.store[key][subKey] = refreshed;
			return this.store[key][subKey];
		},

		sortItems: function( field, order ) {
			var workO	= {};
			var keys	= [];
			var		__	= this;

			$.each( this.activeO, function(a,b) { 
				if ( $.inArray(b[field], keys) == -1 ) keys.push(b[field]);
			});

			keys = keys.sort();
			if ( order == 'DESC' ) keys = keys.reverse();

			$.each( this.activeO, function(a,b) { 
				if ( typeof workO[b[field]] == 'undefined') workO[b[field]] = [];
				workO[b[field]].push(b);
			});

			this.activeO = [];
			for (var i in keys ) {
				$.each( workO[keys[i]], function(c,d) { __.activeO.unshift( d ); })
			}

			return this.activeO;
		},

		findItems: function( searchS, itemId ) {
			var list = this.store['items'][itemId];

			this.activeO = [];
			if ( typeof list != 'undefined' ) {
				for ( var i in list ) {
					if ( list[i].keyword.indexOf( searchS ) > -1 ) {
						this.activeO.push( list[i] );
					}
				}
			}
			return this.activeO.length;
		},

		refreshActiveO: function( key, subKey, itemIndex ) {
			return this.activeO = this.dropItem( key, subKey, itemIndex );
		},

		hasNoEmpties: function(key,subKey) {
			for (var k in this.store[key][subKey] ) {
				if ( this.store[key][subKey][k].id == -1 ) 
					return false;
			}
			return true;
		},

		pushItem: function(key, subKey, item ) {
			if ( typeof this.store[key][subKey] == undefined ) 
				this.store[key][subKey] = [];
			return this.store[key][subKey].unshift( item );
			//return this.store[key][subKey];
		},

		push: function( key, subKey, data ) {
			subKey = ( subKey == '' ) ? '_default' : subKey;

			if ( typeof this.store[key] == 'undefined' ) {
				this.store[key] = {};
				
				if ( typeof this.store[key][subKey] == 'undefined' ) {
					this.store[key][subKey] = {};
				}
				this.store[key][subKey] = data;
			} else {
				if ( typeof this.store[key][subKey] == 'undefined' ) {
					this.store[key][subKey] = data;
				} else {
					this.store[key][subKey];
				}
			}
			return this.store[key][subKey];
		},

		pageScroll: function( way, newRowCount ) {
			if ( typeof newRowCount != 'undefined' ) this.rowCount = newRowCount;
			
			if ( typeof way != 'undefined' ) {
				switch (way) {
					case 'first': this.start = 0; break;
					case 'prev': 
						this.start -= (( this.rowCount <= this.start ) ?this.rowCount : this.start);
						break;
					case 'next': 
						var last = $(this.activeO).size();
						if ( (this.start + 2*this.rowCount ) >= last ) 
							this.start = last - this.rowCount;
						else
							this.start += this.rowCount;
						break;
					case 'last':
						var last = $(this.activeO).size();
						this.start = last - this.rowCount;
							break;
					case 'mid':
						var last = $(this.activeO).size();
						this.start = Math.floor((last-this.rowCount*2)/2);
						break;
					default : ; //do nothing
				}
			}

			var showRows = [];
			var cnt = 0;
			var _ = this;
			$.each( _.activeO, function( key, obj ) { 
				if ( ( (cnt++) < (_.rowCount + _.start)) && ( cnt > _.start )  ) {
					showRows.push(obj);
				}
			});

			return showRows;
		},

		getPage: function() {
			return typeof this.start == 'undefined' ? '' 
				: Math.ceil((this.start/this.rowCount) + 1 ) + '/' + Math.ceil(this.activeO.length/this.rowCount);
		},

		pagerOpen: function( key, subKey, rowCount, start ) { // rowCount == -1
			this.start = start;
			this.rowCount = rowCount;

			this.activeO = this.store[key][subKey];
			rowCount += ( typeof start != 'undefined' ) ? start : 0;

			if ( (typeof rowCount == 'undefined') ||  (rowCount == -1) ) {
				return this.activeO;
			} else {
				return this.pageScroll('first');
			}
		}
	}
)

