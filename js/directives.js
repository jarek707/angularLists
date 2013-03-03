angular.module('kword.directive',['kword.service'])
	.
	directive('listHeads', function() {
		return function( scope, element, attrs ) {
			element.bind('click', click);
			element.parent().find('li:first').addClass('selected');

			function click( evt ) {
				$(evt.target).parent().find('li').removeClass('selected');
				$(evt.target).addClass('selected');
			}
		}
	})
  .
  directive('itemSort', function( cachePager ) {
    return function(scope, element, attrs) {
    	var order='ASC';
    	element.bind('click',click);

			function click( evt ) {
				var sib = $(element).prev();
				sib.parent().parent().find('.sort').addClass('hid');
				sib.toggleClass('asc').removeClass('hid');
				order = ( order == 'ASC' ) ? 'DESC' : 'ASC';
				cachePager.sortItems( attrs.itemSort, order );
				scope.items = cachePager.pageScroll('first');
				scope.$digest();
			}
    }
  })
  .
  directive('filesUpDown', function( fileHandler, cachePager ) {
    return function(scope, element, attrs) {
			var upClass = '';
			var btnType = '';

			if ( attrs.filesUpDown != '' ) {
				var params = attrs.filesUpDown.split(',');
				var upClass =	params[1];
				var btnType =	params[0];
			}

    	var par = element.parent();

			var htmlDown = "<div class='glyph download' title='Download CSV file'>Down</div>";
			var htmlUp   = "<form enctype='multipart/form-data' class='uploadForm'>"
						+ "<input name='file' type='file' />"
						+ "<div class='glyph upload " + upClass + "' title='Upload CSV file'>Up</div>"
						+ "</form>";

			switch ( btnType ) {
				case 'up'		: var html=htmlUp; 		break;
				case 'down' : var html=htmlDown; 	break;
				default			: var html=htmlDown +	htmlUp;
			}

  		par.append(html); 
			if ( upClass != 'up' )
  			par.find('.download').bind('click', down);
  		par.find(':file').change(up);

			function down() { 
				fileHandler.down( scope, cachePager.fetchList('items', scope.list.id) ); 
			}
			function up() { fileHandler.up(scope, this, element, upClass); }
		
  	}
  })
  .
  directive('editButtons', function() {
  	return function( scope, element, attrs) {
  			
  		var paramsA = attrs.editButtons.split(',');
  		var cb	    = $.trim(paramsA[0]);

  		var hasAdd =(typeof paramsA[1] != 'undefined' && paramsA[1]);

  		if ( hasAdd ) $(element).css('width','80px');
  		
 			$(element).html( 	"<btn class='del'>del</btn><btn class='edit'>ed</btn>"
  											+	(hasAdd ? "<btn class='add'>add</btn>"	: '') 
  									 );
  		$.each( $(element).find('btn'), function() { $(this).bind('click', click ); });

			function click( evt ) {
 				var el 				= $(evt.target);
 				var idParent 	= el.parents('[dataId]');
				var cancelling	= false;

				if ( idParent.hasClass('write') ) { // saving or canceling
					cancelling = el.hasClass('del');
					idParent.removeClass('write').find('.edit,.add,.del').show();
				} else { // editing or deleting
					if ( !el.hasClass('del') ) {
						idParent.addClass('write').find(el.hasClass('add') ? '.edit' : '.add').hide();
						cancelling = true;
					}
				}

  			scope['dom' + cb](idParent, idParent.hasClass('write'), el);				// manage dom
				scope[el.attr('class') + cb]( idParent.attr('dataId'), cancelling );	// manage data
 			}
  	}
  })
;
