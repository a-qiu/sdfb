document.addEventListener('DOMContentLoaded', function () {
	var key = "0AhtG6Yl2-hiRdHpTZFIwM1dBZDY5ZUYxR3FISGRkd2c"
	Tabletop.init({
		key: key,
		callback: init
	})
});

function node() {
	this.id = null; 	// Person ID 			>> 1
	this.label = null;	// SHOULD BE First Last (Birth) BUT FOR NOW IT RETURNS ID
	this.name = null;	// First Last 			>> Sama Kanbour
	this.life = null; 	// (Birth - Death)		>> (1992-2040)
}

// TODO
function initGroups(nodes, groups) {

	var grouparr = {}; // should be a hash map with the key of group and an array of IDs
	groups.forEach(function(row) {

		var n = true;
		for (var key in grouparr)
		{
			if(key==row.group)
				n = false;
		}
		if (n){
			grouparr[row.group] = new Array(nodes[row.id].name);
		}
		else{
			//if(nodes[row.id] matches a id)
			grouparr[row.group].push(nodes[row.id].name);
		}
		//console.log(grouparr);

		//row.id should return the id of the person
		//row.group should retunr the name of the group, for examples Puritans 
	})
	//console.log(grouparr);
	// nodes[1] returns info about person with ID 1.
	// For instance, you can get the name of person 1 by doing nodes[1].name
	// which should return 'Sama Kanbour'.


	//dynamic population of boxes
	$('#four').typeahead({
		local: Object.keys(grouparr).sort()
	});
	$('#five').typeahead({
		local: Object.keys(grouparr).sort()
	});
	$('#six').typeahead({
		local: Object.keys(grouparr).sort()
	});
	$('#seven').typeahead({
		local: Object.keys(grouparr).sort()
	});


	$("#findonegroup").click(function () {
		if ($("#four").val()) {
			showOneGroup($("#four").val(), grouparr);
		}
	});
	$("#findtwogroup").click(function () {
		if ($("#five").val() && $("#six").val()) {
			showTwoGroups($("#five").val(), $("#six").val(), grouparr);
		}
	});
}

// TODO
function showOneGroup(group, data) {
	$("group").val("");
	$("group").text("");
	//console.log("One Group");
	var arr = data[group];

	var g="";
	g+='<thead><tr><td>' + group +'</td></tr></thead>';
	for (var i=0; i<arr.length; i++)
	{
		g+='<tr><td>' + arr[i] + '</td></tr>';
	}
	$('group').append('<table>'+g+'</table>');

	//display table here
	//hidden iframe for group
	//create a download button so that this 
	$("#four").val('');
	$("#four").typeahead('setQuery', '');
}

// TODO
function showTwoGroups(group1, group2, data) {
	//display here
	//console.log("Two Group");

	//gets the third group of overlaps
	var arr1 = data[group1];
	var arr2 = data[group2];
	var inter = new Array();

	for( var i=0; i<arr1.length;i++){
		for (var j=0; j<arr2.length; j++){

			if(arr1[i] === arr2[j]){
				inter.push(arr1[i]);
				arr1.splice(i,1);
				arr2.splice(j,1);
				i--;
				j--;
			}
		}
	}
	//console.log("one"+arr1+"\ntwo"+arr2+"\ntogether"+inter);

	//display table here
	//$("group").append('<table>');
	var g="";
	g+='<thead><tr><td>' + group1+"</td> <td>"+group1+" & "+group2+"</td> <td>"+group2 +'</td></tr></thead>';	
	var nmax=Math.max(arr1.length, arr2.length,inter.length)
	for (var n=0; n<nmax; n++)
	{
		g+='<tr>';
		if(n<arr1.length){
			g+= '<td>'+ arr1[n]+'</td>';
		}
		else{
			g+= '<td></td>';
		}

		if(n<inter.length)
			g+= '<td>'+inter[n]+'</td>';
		else
			g+= '<td></td>';

		if(n<arr2.length)
			g+= '<td>' + arr2[n]+'</td>';
		else
			g+='<td></td>';

		g+='</tr>';
	}
	$('group').append('<table>'+g+'</table>');


	//hidden iframe for group
	//create a download button so that this 

	$("#five").val('');
	$("#five").typeahead('setQuery', '');
	$("#six").val('');
	$("#six").typeahead('setQuery', '');
}




// Create a dictionnary of nodes and edges to speed up the search
function init(result) {
	var data = {
		nodes: {},
		edges: {}
	}
	result.nodes.elements.forEach(function (row) {
		var n = new node();
		n.id = row.id;
		n.name = row.first + ' ' + row.last;
		n.life = row.birth + '-' + row.death;
		// n.label = n.name + ' (' + row.birth + ')';
		n.label = row.id;
		data.nodes[n.id] = n;
	});
	result.edges.elements.forEach(function (row) {
		if (row.source in data.edges) {
			data.edges[row.source][row.target] = {};
		}
		if (!(row.source in data.edges)) {
			data.edges[row.source] = {};
			data.edges[row.source][row.target] = {};
		}
		if (row.target in data.edges) {
			data.edges[row.target][row.source] = {};
		}
		if (!(row.target in data.edges)) {
			data.edges[row.target] = {};
			data.edges[row.target][row.source] = {};
		}
	});
	initGraph(data);
	initGroups(data.nodes, result.groups.elements);
}

// Populate the suggested drop-down menus
// Make the buttons in the search panel functional
function initGraph(data){
	$('#one').typeahead({
		local: Object.keys(data.nodes).sort()
	});
	$('#two').typeahead({
		local: Object.keys(data.nodes).sort()
	});
	$('#three').typeahead({
		local: Object.keys(data.nodes).sort()
	});
	$('#eight').typeahead({
		local: Object.keys(data.nodes).sort()
	});

	var color = d3.scale.category20();
	var options = {
		element: 'figure',
		with_labels: true,
		layout_attr: {
			charge: -400,
			linkDistance: 80
		},
		pan_zoom: {
			enabled: false
		},
		node_attr: {
			r: 20,
			title: function (d) {
				return d.label;
			}
		},
		node_style: {
			fill: function (d) {
				return color(d.data.group);
			},
			stroke: 'none'
		},
		edge_style: {
			fill: '#999'
		},
		label_style: {
			fill: '#fff'
		}
	}

	$("#findonenode").click(function () {
		if ($("#one").val()) {
			showOneNode($("#one").val(), data, options);
		}
	});

	$("#findtwonode").click(function () {
		if ($("#two").val() && $("#three").val()) {
			showTwoNodes($("#two").val(), $("#three").val(), data, options);
		}
	});
}

function showOneNode(parent, data, options) {
	var G = jsnx.Graph();
	var edges = [];
	var p = data.nodes[parent].label;
	var fnodes = [];
	var snodes = [];
	for (var first in data.edges[parent]) {
		var f = data.nodes[first].label;
		fnodes.push(f);
		edges.push([p, f]);
		for (var second in data.edges[first]) {
			var s = data.nodes[second].label;
			snodes.push(s);
			edges.push([f, s]);
		}
	}
	G.add_nodes_from(snodes, {
		group: 2
	});
	G.add_nodes_from(fnodes, {
		group: 1
	});
	G.add_nodes_from([p], {
		group: 0
	});
	G.add_edges_from(edges);
	jsnx.draw(G, options);
	$("#one").val('');
	$("#one").typeahead('setQuery', '');
	d3.selectAll('.node').on('click', function (d) {
		if (d3.event.ctrlKey) {
			showOneNode(d.node, data, options);
		}
	});
}

function showTwoNodes(person1, person2, data, options) {
	var G = jsnx.Graph();
	var edges = [];
	var p1 = data.nodes[person1].label;
	var p2 = data.nodes[person2].label;
	var n1 = [p1];
	var n2 = [p2];
	for (var child in data.edges[person1]) {
		var c = data.nodes[child].label;
		n1.push(c);
		edges.push([p1, c]);
	}
	for (var child in data.edges[person2]) {
		var c = data.nodes[child].label;
		n2.push(c);
		edges.push([p2, c]);
	}
	G.add_nodes_from(n1, {
		group: 1
	});
	G.add_nodes_from(n2, {
		group: 2
	});
	G.add_edges_from(edges);
	jsnx.draw(G, options);
	$("#two").val('');
	$("#two").typeahead('setQuery', '');
	$("#three").val('');
	$("#three").typeahead('setQuery', '');
}