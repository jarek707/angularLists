<html lang="en" ng-app="kword" >
<head>
	<meta charset="utf-8">
	<title>TextAd</title>
	<link rel="stylesheet" href="css/app.css"/>
	<link rel="stylesheet" href="lib/bootstrap/css/bootstrap.min.css"/>
  <script src="js/jquery.js"></script>
	<script src="lib/angular/angular.js"></script>
	<script src="js/controllers.js"></script>
	<script src="js/services.js"></script>
	<script src="js/filters.js"></script>
	<script src="js/directives.js"></script>
	<script src="js/app.js"></script>
</head>

<body>
	<div id='content' ng-controller="mainCtrl" class="{{conf.paneType}}">
		<a id='DOWNCSV' href='' download='{{downloadFile}}.csv'>download</a>
		<div class='fullBox heading'>
			<h2><span></span>{{conf.mainHeader}}</h2>
		</div>

		<div class='fullBox right {{conf.posNegClass}}'>
				<div ng-click='toggleType(false)' style='text-decoration:underline; cursor:pointer;'>
					go to <span id='posNegText'>{{reverseType}}</span> Keywords
				</div>
		</div>

		<div class='fullBox listHeads'>
			<ul>
				<li list-heads ng-model='listHead' ng-repeat='lh in listHeads' ng-click="categoryClick(lh);">
					{{lh}}
				</li>
			</ul>
		</div>

		<div class='fullBox lists' dataId='{{list.id}}'>
			<select ng-model="list" ng-options="s.name for s in lists" ng-change="listChange()" />
			<input type='text' ng-model='list.name' />
			<buttons edit-buttons='List,true'></buttons>
			<div files-up-down='up,bulk'></div>
			<div id='item_notify' ng-model="notify">{{notify}}</div>
		</div> <!-- .fullBox.lists -->

		<div id='items_list'>
			<div id='items_wrap'>
				<table>
					<tr class='header'>
						<td>
							<div class='glyph sort hid'>Down</div>
							<div class='{{conf.fields[0].name}}' item-sort='{{conf.fields[0].name}}'>{{conf.fields[0].label}}</div>
							<div class='search'>
								<div>Search:</div>
								<input type='text' ng-model='lookStr' ng-change="lookF()"/>
							</div>
						</td>
						<td>
							<div class='glyph sort hid' ></div>
							<div item-sort='{{conf.fields[1].name}}'>{{conf.fields[1].label}}</div>
						</td>
						<td>
							<div class='glyph sort hid' ></div>
							<div item-sort='{{conf.fields[2].name}}'>{{conf.fields[2].label}}</div>
						</td>
						<td>
							<div class='glyph sort hid' ></div>
							<div class='{{conf.fields[3].name}}' item-sort='{{conf.fields[3].name}}'>{{conf.fields[3].label}}</div>
						</td>
						<td class='buttons'>
							<div class='glyph add' ng-click="newRow()">Add Row</div>
							<div files-up-down></div>
						</td>
					</tr>
					<tr id='item_list_{{item.id}}' dataId='{{item.id}}' class="item_list {{isAddRow(item.id)}}" 
						ng-repeat='item in items ' ng-click='openRow(item.id)'>
						<td ng-repeat='field in conf.fields' title="{{item.[field]}}" class="{{field.class}}" ng-click='fieldClick(item.id,field.name)'>
							<input ng-model='item[field.name]' type='text' disabled="disabled"
							title='{{item[field.name]}}'>
						</td>
						<td class='buttons'><buttons edit-buttons='Row'></buttons></td>
					</tr>
				</table>
			</div> <!-- items wrap -->
			<ul class='pager' dataId='all'>
				<li class='first nav' ng-click="pager('first')">first</li>
				<li class='prev nav' ng-click="pager('prev')">prev</li>
				<li class='next nav' ng-click="pager('next')">next </li>
				<li class='last nav' ng-click="pager('last')">last</li>
				<li><span>{{getPage()}}</span></li>
				<li class='buttons'>
					<buttons edit-buttons='Bulk'></buttons>
				</li>
				<li class='rowCount'>
					<div>Max Rows: </div>
					<select ng-model='tabRowCount' ng-options="t.h for t in tabRows" ng-change="itemsResize(this)"></select>
				</li>
			</ul>
		</div> <!-- #items_list -->

	</div>

</body>
</html>
