/* ========================================================================
 * sqlsearchwp v1.0.0
 * ========================================================================
 *
 * What it does:
 * 		Creates a sql search form that submits the form's query to 
 *		skyserverws.
 * 
 * Licensed under MIT 
 * ======================================================================== */
(function($) {
	'use strict';

	// PUBLIC CLASS DEFINITION
	// ================================

	var SQLSDEBUG = true;

	var sqlsearchwp = {

		context: '#sqls-container',
		
		levels: [
			'info',
			'warning',
			'danger',
		],
		
		buttons: [
			'submit',
			'images',
			'syntax',
			'clear'
		],
		
		whichs: [
			'test',
			'freeform',
			'searchform',
			'dr14',
			'dr14-secondary'
		],
		targets: {
		dr14:{
		    url:"https://skyserver.sdss.org/casjobs/RestAPI/contexts/dr14/query",
		    ContentType:"application/json",
		    type: "POST",
		    data:{"Query":"","Accept":"application/xml"},
		    success: function (data) {
			sqlsearchwp.showResults( data , false , true, true, false );
		    }
		},
		dr14Secondary:{
		    url:"https://skyserver.sdss.org/casjobs/RestAPI/contexts/dr14/query",
		    ContentType:"application/json",
		    type: "POST",
		    data:{"Query":"","Accept":"application/xml"},
		    success: function (data, newWin) {
			sqlsearchwp.showResults( data , false , true, true, sqlsearchwp.newWin );
		    }
		}
		},
		newWin:false,
		/*query: { 
			test: 
				'SELECT TOP 10 '+
				'p.objid,p.ra,p.dec,p.u,p.g,p.r,p.i,p.z, '+
				'p.run, p.rerun, p.camcol, p.field, '+
				's.specobjid, s.class, s.z as redshift, '+
				's.plate, s.mjd, s.fiberid '+
			'FROM PhotoObj AS p '+
				'JOIN SpecObj AS s ON s.bestobjid = p.objid '+
			'WHERE '+
				'p.u BETWEEN 0 AND 19.6 '+
			'AND g BETWEEN 0 AND 20' ,
			prod: ''
			},*/
			
		init: function(  ){
						
			var s=this;
			
			// get base url of files, test or prod query, target query location, and how to show results.
			var webroot = $( sqlsearchwp.context ).data('sqls-webroot');
			var which = $( sqlsearchwp.context ).data('sqls-which');
			var target = sqlsearchwp.targets[which];
			
			//initialize query to be default text
			target.data.Query = "SELECT TOP 10 p.objid,p.ra,p.dec,p.u,p.g,p.r,p.i,p.z,p.run, p.rerun, p.camcol, p.field, s.specobjid, s.class, s.z as redshift,s.plate, s.mjd, s.fiberid FROM PhotoObj AS p JOIN SpecObj AS s ON s.bestobjid = p.objid WHERE p.u BETWEEN 0 AND 19.6 AND g BETWEEN 0 AND 20";
			// Show the Search Page
			//this.showMessage( 'Welcome' , 'Please enjoy this form.' , 'info' , false );
			this.showInstructions( webroot+"includes/" );
			this.showForm( sqlsearchwp.context , false , true );
			this.showResults( '<pre>Results Empty!\n\n<strong>Check Syntax</strong> or <strong>Submit</strong> to get results</pre>' , false , false, false, false);
			
			// Prevent form submitting/reloading page
			$( sqlsearchwp.context ).on( "submit" , "form#sqls-form" , function( e ){ e.preventDefault(); });
			$( sqlsearchwp.context ).on( "submit" , "form#sqls-searchform" , function( e ){ e.preventDefault(); });
			
			// Add (delegated) click event handlers to buttons
			//$( sqlsearchwp.context ).on( "click" , "#sqls-submit" , sqlsearchwp.doSubmit );
			$("#sqls-edit").on('click', sqlsearchwp.enableQuery);
			$("#sqls-query").on('input', sqlsearchwp.doQueryUpdate);
			$("#sqls-download").on('click', sqlsearchwp.download);
			$("#sqls-newWindow").on('click', sqlsearchwp.updateCheckbox);
			$( sqlsearchwp.context ).on( "click" , "#sqls-submit" , { target:target , which:which } , sqlsearchwp.doSubmit );
			$( sqlsearchwp.context ).on( "click" , "#sqls-syntax" , sqlsearchwp.doSyntax );
			$( sqlsearchwp.context ).on( "click" , "#sqls-reset" , sqlsearchwp.doReset );
			/*var uagent = navigator.userAgent.toLowerCase();
			if (uagent.search("iphone") > -1) {
				document.getElementById('sqls-form').innerHTML = '<table width=50%><tr><td><button id="sqls-edit" name="sqls-edit" class ="sqls-edit btn btn-primary" data-unlock="yes">Edit</button></td><td><button id="sqls-reset" name="sqls-reset" class="sqls-reset btn btn-tertiary">Reset</button></td></tr></table><textarea id="sqls-query" name="cmd" class="sqls-query" data-colnum=60 rows=10 cols=60 disabled>SELECT TOP 10 p.objid,p.ra,p.dec,p.u,p.g,p.r,p.i,p.z,p.run, p.rerun, p.camcol, p.field, s.specobjid, s.class, s.z as redshift,s.plate, s.mjd, s.fiberid FROM PhotoObj AS p JOIN SpecObj AS s ON s.bestobjid = p.objid WHERE p.u BETWEEN 0 AND 19.6 AND g BETWEEN 0 AND 20</textarea><table width=50%><tr>	<td><button id="sqls-submit" name="sqls-submit" class="sqls-submit btn btn-primary">Submit</button></td><td><button id="sqls-syntax" name="sqls-syntax" data-sqls-submitto="http://skyserver.sdss.org/dr14/en/tools/search/x_results.aspx?searchtool=SQL&TaskName=Skyserver.Search.SQL&ReturnHtml=true&format=html&syntax=Syntax&cmd=" class="sqls-syntax btn btn-secondary">Check Syntax</button></td></tr></table>';
			}*/
			//document.getElementsByTagName("BODY")[0].onresize = sqlsearchwp.doResize;
			//sqlsearchwp.doResize();
				
			/*if ( which ==="searchform" ) {
				$( sqlsearchwp.context ).on( "click" , "#sqls-images" , sqlsearchwp.doSubmit );
				$( sqlsearchwp.context ).on( "change" , "#sqls-inregion" , sqlsearchwp.toggleFootprint );
				$( sqlsearchwp.context ).on( "change" , "#sqls-forobjects" , sqlsearchwp.toggleRedshifts );
				$( sqlsearchwp.context ).on( "click" , "#sqls-fpcheck" , sqlsearchwp.doFootprint );
				$( sqlsearchwp.context ).on( "click" , "#sqls-generate" , sqlsearchwp.doGenerate );
				$( 'form#sqls-searchform' ).on( "change" , "select" , sqlsearchwp.doUpdate );
				$( 'form#sqls-searchform' ).on( "change" , "input" , sqlsearchwp.doUpdate );
				}*/
			
		},
		
		updateCheckbox: function(e) {
			var setting = e.currentTarget.dataset.value;
			if (setting === "no") {
				setting = "yes";
				sqlsearchwp.newWin = true;
				e.currentTarget.dataset.value = setting;
			} else {
				setting = "no";
				sqlsearchwp.newWin = false;
				e.currentTarget.dataset.value = setting;
			}
		},
		
		openWindow: function(content) {
			var type = 'text/html';
			var a = document.createElement("a");
			var file = new Blob([content], {type: type});
			//window.open(URL.createObjectURL(file));
			a.href = URL.createObjectURL(file);
			a.target = "_blank";
			a.click();
		},
		
		download: function(e) {
			//console.log('hi');
			var docText = sessionStorage.getItem('queryResults');
			var lines = docText.split('\n');
			docText = '';
			for (var i = 0; i < lines.length-1; i++) {
				var values = lines[i].split(',');
				for (var x = 0; x < values.length; x++) {
					values[x] = '\"'.concat(values[x]);
					values[x] += '\"';
					docText += values[x];
					if (x !== values.length - 1) {
						docText += ',';
					}
				}
				if (i !== lines.length - 1) {
					docText += '\n';
				}
			}
			//console.log(docText);
			var name = 'results.csv';
			var type = 'text/csv';
            var a = document.createElement("a");
			var file = new Blob([docText], {type: type});
			//window.open(URL.createObjectURL(file));
			a.href = URL.createObjectURL(file);
			a.download = name;
			a.click();
			//window.open('data:text/csv;charset=utf-8,' + escape(docText), 'results.csv');
		},
		
		doResize: function() {
			var queryBlock = document.getElementById('sqls-query');
			var winWidth = $(window).width();
			if(winWidth >= 975) {
				queryBlock.cols = 80;
			}
			if(winWidth < 974) {
				queryBlock.cols = 60;
			}
			if(winWidth < 553) {
				queryBlock.cols = 60 - Math.round((553-winWidth)/8) - 1;
			}
		},

		enableQuery: function(e) {
		if(e.currentTarget.dataset.unlock === "yes") {
		    $("#sqls-query").prop("disabled", false);
		    e.currentTarget.dataset.unlock = "no";
			e.currentTarget.innerHTML = 'Lock';
		}
		else {
		    $("#sqls-query").prop("disabled", true);
		    e.currentTarget.dataset.unlock = "yes";
			e.currentTarget.innerHTML='Unlock';
		}
	        },

		/**
		 *@summary Update the inner html of the query textarea with what the user enters
		 *
		 *@param Object e Event Object
		 **/
		doQueryUpdate: function(e) {
		
                   var textValue = e.target.value;
		   document.getElementById("sqls-query").innerHTML = textValue;
		   sqlsearchwp.targets.dr14.data.Query = textValue;
		   sqlsearchwp.targets.dr14Secondary.data.Query = textValue;

	        },
		
		/**
		 * @summary Toggle the Reshifts form
		 * 
		 * @param Object e Event Object
		**/
		toggleRedshifts: function( e ) {

		
			$('#sqls-forwrapper').collapse();
			$('#sqls-returnspectra').collapse();

			if ( $( ':selected' , this).val() === 'only objects' ) {
				$('#sqls-forwrapper').collapse('show');
				$('#sqls-returnspectra').collapse('show');
			} else {
				$('#sqls-forwrapper').collapse('hide');
				$('#sqls-returnspectra').collapse('hide');
			}
			
		},
		
		/**
		 * @summary Toggle the Footprint form
		 * 
		 * @param Object e Event Object
		**/
		toggleFootprint: function( e ) {

			
			$('#sqls-fpwrapper').collapse();

			if ( $( ':selected' , this).val() === 'around' ) {
				$('#sqls-fpwrapper').collapse('show');
			} else {
				$('#sqls-fpwrapper').collapse('hide');
			}
			
		},
		
		/**
		 * @summary Checks if RA, DEC, and Radius are in SDSS Footprint
		 * 
		 * @param Object e Event Object
		**/
		doFootprint: function( e ) {
			
			var _query = e.currentTarget.dataset.sqlsSubmitto +
				'&ra=' + encodeURI( $( '#sqls-ra' , sqlsearchwp.context ).val() ) +
				'&dec=' + encodeURI( $( '#sqls-dec' , sqlsearchwp.context ).val() ) +
				'&radius=' + encodeURI( $( '#sqls-radius' , sqlsearchwp.context ).val() );
			var display = $( sqlsearchwp.context ).data('sqls-display');

			if ( display === 'div' ) {				
				$('#sqls-fpresult').html('Working... ');
				var xhttp;
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState === 4 && this.status === 200) {
						var response = this.responseText;
						$('#sqls-fpresult').html(response);
					}
				};
				xhttp.open("GET", _query , true);
				xhttp.send();

			} else if ( display === 'iframe' ) {
				sqlsearchwp.showResults( '' , false , true);
				$('#sqls-fpresult').append('<div class="alert alert-info alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><div class="embed-responsive embed-responsive-4by3"><iframe  class="embed-responsive-item" src="' + _query + '" name="sqls-fpresult-iframe" id="sqls-fpresult-iframe"></iframe></div></div>');
				
			} else {
				console.log( "Display type not supported: " + display + "." );
			}
		
		},
		
		/**
		 * @summary Submits form data to target db
		 * 
		 * @param Object e Event Object
		**/
		doSubmit: function( e ) {
			
			// Get target db from form data
		
			//var display = $( sqlsearchwp.context ).data('sqls-display');
			//var _query = e.currentTarget.dataset.sqlsSubmitto +
			//encodeURI( $( '#sqls-query' ).val() );

			var query = e.data.target.data.Query;
			var target = e.data.target;
			var which = e.data.which;

			if ( which === 'dr14' || which === 'dr14Secondary') {
			    target.data = {"Query":query};
			    $.ajax( target );
			    
			}
			else {
			    
			    //send query from form to skyserverws and listen for return
			    var xhttp;
			    xhttp = new XMLHttpRequest();
			    xhttp.onreadystatechange = function() {
				if (this.readyState === 4 && this.status === 200) {
				    var response = this.responseText;
				    response = response.replace(/.*<body.*?>/i , "");
				    response = response.replace(/<\/body.*/i , "");

				    sqlsearchwp.showResults( response , false , true, true );
				    sqlsearchwp.showForm( '' , true , false );
				}
			    };
			    xhttp.open("GET", query , true);
			    xhttp.send();
			}
			
			/*if ( display === 'div' && false) {				
				//send query from form to skyserverws and listen for return
				var xhttp;
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState === 4 && this.status === 200) {
						var response = this.responseText;
						response = response.replace(/.*<body.*?>/i , "");
						response = response.replace(/<\/body.*//*i , "");
						sqlsearchwp.showResults( response , false , true );
						sqlsearchwp.showForm( '' , true , false );
					}
				};
				xhttp.open("GET", _query , true);
				xhttp.send();
			} else if ( display === 'iframe' && false) {
				sqlsearchwp.showResults( '' , false , true);
				$('#sqls-results').append('<div class="embed-responsive embed-responsive-4by3"><iframe  class="embed-responsive-item" src="' + _query + '" name="sqls-iframe" id="sqls-iframe"></iframe></div>');
				sqlsearchwp.showForm( '' , true , false );
			} else {
				console.log( "Display type not supported: " + display + "." );
			}*/
			
		},
		
		/**
		 * @summary Change button to "Update Query" when parameters change and
		 *   query has already been generated once.
		 * 
		 * @param Object e Event Object
		**/
		doUpdate: function( e ) {
			if (SQLSDEBUG) { console.log( $( '#sqls-generate' ).html() ); }

			if ( $( '#sqls-query' ).html().trim() !== '' ){
				$( '#sqls-generate' ).html('Update Query');
			} else {
				$( '#sqls-generate' ).html('Generate Query');
			}
		},
		
		/**
		 * @summary Generates SQL query based on SearchForm
		 * 
		 * @param Object e Event Object
		**/
		doGenerate: function( e ) {
			
			var _query = 'SELECT ';
			var count = false;
			var _ok=true;
			var _fields = [];
			var _from=[];
			var _where = [];
			
			// count  or top ##, and fields to return
			switch ( $('input:checked' ,'div.returnobj').val() ){
				case ( 'count' ):
					_query += 'count(*) as count ';
					count = true;
					break;
				case ( 'all' ):
					break;
				default:
					_query += 'top '+ $('input:checked' ,'div.returnobj').val() +' ';
					$('input:checked' ,'div.returnimg').each( function( index ){
						_fields.push( $( this ).val() );
					} );
					break;
			}
			
			// showme
			// quasars: photoobj p, specobj s where p.objid=s.bestobjid and (s.class = 'QSO')
			var showme=$( 'option:selected' , '#sqls-showme' ).val();
			switch ( showme ){
				case ('quasar'):
					if ( _from.indexOf( 'photoobj p' ) === -1 ) {_from.push( 'photoobj p' ) ; }
					if ( _from.indexOf( 'specobj s' ) === -1 ) {_from.push( 'specobj s' ) ; }
					if ( _where.indexOf( 'p.objid=s.bestobjid' ) === -1 ) { _where.push( 'p.objid=s.bestobjid' ) ; }
					if ( _where.indexOf( "(s.class = 'QSO')" ) === -1 ) { _where.push( "(s.class = 'QSO')" ) ; }
					break;
				default:
					if ( _from.indexOf( $( 'option:selected' , '#sqls-showme' ).val() ) === -1 ) {_from.push( $( 'option:selected' , '#sqls-showme' ).val() ) ; }
					break;
			}
			
			//inregion
			if ( $( 'option:selected' , '#sqls-inregion' ).val() === 'around' ){
				
				// error checking
				[ '#sqls-ra' , '#sqls-dec' , '#sqls-radius'].forEach( function( e , i , a ) {
					if ( $( e , '#sqls-fpwrapper' ).val().trim().length === 0 ) {
						sqlsearchwp.showMessage( 'Input error' , 'Neither ra, dec, or radius cannot be blank when searching the region "around" ' , 'danger' , false );
						$( e , '#sqls-fpwrapper' ).focus();
						_ok=false;
					}
				});
				if (_ok) {
					var thisfrom = 'dbo.fgetNearByObjEq('+ $( '#sqls-ra' , '#sqls-fpwrapper' ).val() +','+ $( '#sqls-dec' , '#sqls-fpwrapper' ).val() +','+ $( '#sqls-radius' , '#sqls-fpwrapper' ).val() +') n ';
					if ( _from.indexOf( thisfrom ) === -1 ) {_from.push( thisfrom ) ; }
					if ( _where.indexOf( 'p.objid=n.objid' ) === -1 ) { _where.push( 'p.objid=n.objid' ) ; }
				}
			}
			
			// withmags
			['u','g','r','i','z'].forEach( function( e , i , a ){
				if ( $( '#sqls-' + e + 'min' , '.withmags' ).val().trim().length > 0 ) {
					_where.push( 'p.' + e + ' >= ' +$( '#sqls-'+e+'min' , '.withmags' ).val() );
				}
			});
			['u','g','r','i','z'].forEach( function( e , i , a ){
				if ( $( '#sqls-' + e + 'max' , '.withmags' ).val().trim().length > 0 ) {
					_where.push( 'p.' + e + ' <= ' +$( '#sqls-'+e+'max' , '.withmags' ).val() );
				}
			});
			
			// andcolors
			['ug','gr','ri','iz','ur'].forEach( function( e , i , a ){
				if ( $( '#sqls-' + e + 'min' , '.andcolors' ).val().trim().length > 0 ) {
					_where.push( $( '#sqls-'+e+'min' , '.andcolors' ).data("sqlsCompare") + ' >= ' + $( '#sqls-'+e+'min' , '.andcolors' ).val() );
				}
			});
			['ug','gr','ri','iz','ur'].forEach( function( e , i , a ){
				if ( $( '#sqls-' + e + 'max' , '.andcolors' ).val().trim().length > 0 ) {
					_where.push( $( '#sqls-'+e+'max' , '.andcolors' ).data("sqlsCompare") + ' <= ' +$( '#sqls-'+e+'max' , '.andcolors' ).val() );
				}
			});
			
			//for object with/out spectra
			if ( $( 'option:selected' , '#sqls-forobjects' ).val() === 'only objects' ){
				
				if ( _from.indexOf( 'specobj s' ) === -1 ) {_from.push( 'specobj s' ) ;}
				if ( _where.indexOf( 'p.objid=s.bestobjid' ) === -1 ) { _where.push( 'p.objid=s.bestobjid' ) ; }
				
				// error checking
				/*/
				[ '#sqls-redshiftmin' , '#sqls-redshiftmax' ].forEach( function( e , i , a ) {
					if ( $( e , '#sqls-forwrapper' ).val().trim().length === 0 ) {
						sqlsearchwp.showMessage( 'Input error' , 'Redshift max and min cannot be blank when specifying "only objects with spectra" ' , 'danger' , false );
						$( e , '#sqls-forwrapper' ).focus();
						_ok=false;
					}
				});
				/*/
				
				// Both redshift limits given
				if ( ( $( '#sqls-redshiftmin' , '#sqls-forwrapper' ).val().trim().length > 0 ) && ( $( '#sqls-redshiftmax' , '#sqls-forwrapper' ).val().trim().length > 0 ) ){
					var thiswhere = 's.z BETWEEN ' + $( '#sqls-redshiftmin' , '#sqls-forwrapper' ).val() + ' AND ' + $( '#sqls-redshiftmax' , '#sqls-forwrapper' ).val();
					if ( _where.indexOf( thiswhere ) === -1 ) { _where.push( thiswhere ) ; }

				// error - only one redshift limit given
				} else if ( ( $( '#sqls-redshiftmin' , '#sqls-forwrapper' ).val().trim().length > 0 ) || ( $( '#sqls-redshiftmax' , '#sqls-forwrapper' ).val().trim().length > 0 ) ){
						sqlsearchwp.showMessage( 'Input error' , 'Both redshift max and min must be specified with "only objects with spectra" ' , 'danger' , false );
						$( e , '#sqls-forwrapper' ).focus();
						_ok=false;
					
				// warning - no redshift limits given, pretty much pointless
				} else {
						//sqlsearchwp.showMessage( 'Input warning' , 'When specifying "only objects with spectra" redshift limits should be given' , 'warning' , false );
						//$( e , '#sqls-forwrapper' ).focus();
				}
				
				['redshift','spectrumid','plate'].forEach( function( e , i , a ){
					if ( $( '#specdata' + e , '.returnspectra' ).prop('checked') === true ) {
						if ( !(count) && _fields.indexOf( $( '#specdata' + e , '.returnspectra' ).val() ) === -1 ) { _fields.push( $( '#specdata' + e , '.returnspectra' ).val() ) ; }
					}
				});
			}
			
			if (_ok) {
				_query += _fields.join(', ') + " \n";
				_query += 'FROM ' + _from.join(', ') + " \n";
				_query += ( _where.length > 0 ) ? ' WHERE ' + _where.join(' AND ') +  " \n" : '';
				$( e.currentTarget.dataset.sqlsGeneratetoid ).html( _query );
			}
		
		},
		
		/**
		 * @summary Sends form data to skyserverws for syntax review
		 * 
		 * @param Object e Event Object
		**/
		doSyntax: function( e ) {
			//if (SQLSDEBUG) { console.log('doSyntax'); }
	
			// Get target db from form data
			var display = $( sqlsearchwp.context ).data('sqls-display');
			var _query = e.currentTarget.dataset.sqlsSubmitto +
				encodeURI( $( '#sqls-query' ).val() );

			if ( display === 'div' ) {				
				//send query from form to skyserverws and listen for return
				var xhttp;
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState === 4 && this.status === 200) {
						var response = this.responseText;
						sqlsearchwp.showResults( response , false , true, false );
					}
				};
				xhttp.open("GET", _query, true);
				xhttp.send();
				
			} else if ( display === 'iframe' ) {
				
			    sqlsearchwp.showResults( '' , false , true, false);
				$('#sqls-results').append('<div class="embed-responsive embed-responsive-4by3"><iframe  class="embed-responsive-item" src="' + _query + '" name="sqls-iframe" id="sqls-iframe"></iframe></div>');
				sqlsearchwp.showForm( '' , true , false );
				
			} else {
				
				console.log( "Display type not supported: " + display + "." );
				
			}
		},
		
		/**
		 * @summary Resets form data
		 * 
		 * @param Object e Event Object
		**/
		doReset: function( e ) {
			// Reset query - don't do this while testing...
			sqlsearchwp.showResults( '<pre>Results Empty!\n\n<strong>Check Syntax</strong> or <strong>Submit</strong> to get results</pre>' , false , false, false, false );
			sqlsearchwp.showForm( sqlsearchwp.context , false , true );
		},
		
		doCollapse: function( toggle, container, show ) {
			$('.collapse').collapse();
			if ( show === true ) {
				$(container).collapse('show');
			} else {
				$(container).collapse('hide');
			}
		},
		
		/**
		 * @summary Appends or updates the displayed messages.
		 * 
		 * @param String $title Message Title
		 * @param String $msg Message text
		 * @param String $level One of info, warning, error
		 * @param Boolean $append Append or replace current message(s)
		**/
		showMessage: function( title , msg , level , append ) {
			var msgContainer = $( '.sqls-messages' )[0];
			var msgWrapper = $( '.sqls-messages-wrap' )[0];
			
			// Append or replace existing contents
			var message = ( append !== undefined && append ) ? $(msgContainer).html() : '' ;
			
			// Class for error level
			var msgLevel = ( ( level !== undefined ) && ( sqlsearchwp.levels.indexOf( level ) >= 0 ) ) ? 'alert-'+level : 'alert-primary' ;
			
			// Put Content in alert
			message += ( title !== undefined ) ? 
				'<h3 class="sqls-msg-title ' + msgLevel + ' ">' + 
					'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
					title + '</h3>' : 
				'' ;
			message += ( msg !== undefined ) ? 
				'<div class="sqls-msg-body ' + msgLevel + ' ">'+
					msg + '</div>' : 
				'' ;
			message = '<div class="alert ' + msgLevel + ' alert-dismissable sqls-msg" role="alert">' + message + '</div>';
			$(msgContainer).html( message );
			
			// Hide if empty
			$( msgWrapper ).show();
			if ( $(msgContainer).html().length === 0 ) {
				$( msgWrapper ).hide();
			} 
		},
		
		showInstructions: function( instructions ) {
			var instContainer = $( '.sqls-instructions' )[0];
			var instWrapper = $( '.sqls-instructions-wrap' )[0];
			var which = $( sqlsearchwp.context ).data('sqls-which');

			var xhttp;
			xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState === 4 && this.status === 200) {
					var response = this.responseText;
					$( instContainer ).html(response);
				}
			};
			xhttp.open("GET", instructions + 'instructions-' + which + '.txt' , true);
			xhttp.send();
		},
		
		showForm: function( context , append , show ) {
			var toggle = $('#sqls-form-wrap>h2>a[data-toggle]');
			var container = $( '#sqls-formwrapper' );
			if (SQLSDEBUG) { console.log(  $( toggle ).attr('href') ); }
			
			var contents = ( append !== undefined && append ) ? $(container).html() : '' ;
			
			//var _query = sqlsearchwp.query[ $( context ).data('sqls-which') ];
			
			//$( '#sqls-query' ).prop( 'value' , sqlsearchwp.query[ $( context ).data('sqls-which') ] );
			sqlsearchwp.doCollapse( '#sqls-form-wrap>h2>a[data-toggle]', container, show );
			
		},
		
		/**
		 * @summary Appends or updates the displayed Results.
		 * 
		 * @param String $results Results to display
		 * @param Boolean $append Append or replace current message(s)
		**/
		showResults: function( results , append , show, format, newWin ) {
			if(format) {
				sessionStorage.setItem('queryResults', results);
				document.getElementById('sqls-download').style = '';
			} else {
				document.getElementById('sqls-download').style = 'display:none;';
			}
			var container = $( '#sqls-results' );

			var contents = ( append !== undefined && append ) ? $(container).html() : '' ;
			
			contents += ( results !== undefined ) ? results : '' ;
			if (format) {
			    contents = sqlsearchwp.formatResults(contents);
			} 
			$(container).html(contents);
			if (newWin) {
				sqlsearchwp.openWindow(contents);
			}
			sqlsearchwp.doCollapse( '#sqls-results-wrap>h2>a[data-toggle]', $('#sqls-results-outer'), show );
		},

		formatResults: function(data) {
		        var output = '<pre><table class="table-bordered table-responsive">';
		        var lines = data.split('\n');
			for(var i = 0; i < lines.length; i++) {
			    output += '<tr>';
			    var items = lines[i].split(',');
			    var symbolBegin = '<td>';
			    var symbolEnd = '</td>';
			    if (i === 0) {
				symbolBegin = '<th>';
				symbolEnd = '</th>';
			    }
			    for (var x = 0; x < items.length; x++) {
				output += symbolBegin;
				output += items[x];
				output += symbolEnd;
			    }
			    output += '</tr>';
			}
			output += '</table></pre>';
			//output += '<div class="clearfix"></div><div class="row"><div class="col-xs-12 col-sm-12 col-md-12 text-center"><button id="sqls-download" name="sqls-download" class ="sqls-download btn btn-primary btn-dr14">Download</button></div></div>';
			return output;
			
	        }
	};

	$(document).ready( function(  ) {
		if ( $( '#sqls-container' ).length === 1 ) {
			sqlsearchwp.init(  );
		} else {
			if (SQLSDEBUG) { console.log('Error running sqlsearchwp.js. One and only one "#sqls-container" expected.');}
		}
	} );
	
})(jQuery);