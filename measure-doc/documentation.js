readAllData();
addMeasureInput();


// Create a new YUI instance and populate it with the required modules.
function addMeasureInput(){
YUI().use("autocomplete", "autocomplete-filters", "autocomplete-highlighters", function (Y) {
//skin
Y.one('body').addClass('yui3-skin-sam');
//Array source
var measures=getMeasuresList();
Y.one('#ac-input').plug(Y.Plugin.AutoComplete, {
resultFilters    : 'phraseMatch',
resultHighlighter: 'phraseMatch',
source: measures,
on: {
select : function(){
console.log("Measure Selected!");
}
},
after: {
select: function (o) {
showMeasure(o.result.raw);
}
}
});
});
};



function checkEnter(e){
var key=e.keyCode || e.which;
if (key==13){
console.log('Enter!');
}
}


function getMeasuresList(){
var measures = JSON.parse(localStorage.getItem('measures'));
var measures_list=[];
for (m in measures)
{
measures_list.push(measures[m]["name"]);
}
return measures_list;
}



function showMeasure(name){
var measures = JSON.parse(localStorage.getItem('measures'));

var id="";

if (measures.hasOwnProperty(name))
{
id=name;
} else{
for (m in measures)
{
if (measures[m]["name"]==name){
id=m;
console.log(m);
}
}
}

//update Measure  
for (prop in measures[id])
{
updateText('m_'+prop,measures[id][prop]);

if (prop=="source"){
createSourcesTable(measures[id][prop]);
}

}
readMeasureData(id);

}

function updateText(id,text){
	//console.log(".."+document.getElementsByName(id).length);
	for (var i=0;i<document.getElementsByName(id).length;i++){
		try{
			document.getElementsByName(id)[i].innerHTML = text;
		}catch(err)
		{
			console.log("cannot find the html id tag "+id)
		}
	}

}

function createSourcesTable(sources)
{
var m_id= "m_sources_table";
var table=document.getElementById(m_id);

//clean row
rows=table.rows.length;
for (var i=0;i<rows;i++)
{
	try{
		table.deleteRow(0);
	}catch(err)
	{
		console.log("No Sources table")
	}
}

for (var i=0, item; item=sources[i]; i++) {
var row=table.insertRow(-1);
var cell1=row.insertCell(0);
var cell2=row.insertCell(1);
cell1.innerHTML=i+1+".-";
cell2.innerHTML="<a href='"+item["link"]+"'>"+item["name"]+"<\/a>";
}

}

function readAllData(){
d3.json("measures-def.json", function(json) {
// Put the object into storage
localStorage.setItem('measures', JSON.stringify(json));
// Retrieve the object from storage
var retrievedObject = localStorage.getItem('measures');
console.log('Measures saved in local storage: ', JSON.parse(retrievedObject));
})
}

function readMeasureData(id)
{
d3.csv("resources/indicators/"+id+"/score.csv", function(csv) {
scoreGraph(csv);
})
}

function scoreGraph(csv)
{
var xdata = [1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012];
var ydata={1995:[],1996:[],1997:[],1998:[],1999:[],2000:[],2001:[],2002:[],2003:[],2004:[],2005:[],2006:[],2007:[],2008:[],2009:[],2010:[],2011:[],2012:[]};

for (country in csv){
for (y in xdata){
var val=csv[country][xdata[y]];
if (val != 0.0)
{
ydata[xdata[y]].push(val);
}
}

}
var ydata_50=[];
var ydata_10=[];
var ydata_90=[];

for (i in ydata)
{
var arr=ydata[i];
//console.log(ydata);
ydata_50.push(d3.median(arr));
ydata_10.push(d3.quantile(arr,10));
ydata_90.push(d3.quantile(arr,90));
}

// size and margins for the chart
var margin = {top: 20, right: 15, bottom: 20, left: 30}
, width = 600 - margin.left - margin.right
, height = 200 - margin.top - margin.bottom;

// x and y scales, I've used linear here but there are other options
// the scales translate data values to pixel values for you
var x = d3.scale.linear()
.domain([d3.min(xdata), d3.max(xdata)])  // the range of the values to plot
.range([ 0, width ]);        // the pixel range of the x-axis

var y = d3.scale.linear()
.domain([0,1])
.range([ height, 0 ]);

//clean previous svg if any
//TODO

// the chart object, includes all margins
var chart = d3.select('body')
.append('svg:svg')
.attr('width', width + margin.right + margin.left)
.attr('height', height + margin.top + margin.bottom)
.attr('class', 'chart')

// the main object where the chart and axis will be drawn
var main = chart.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
.attr('width', width)
.attr('height', height)
.attr('class', 'main')   

// draw the x axis
var xAxis = d3.svg.axis()
.scale(x)
.orient('bottom');

main.append('g')
.attr('transform', 'translate(0,' + height + ')')
.attr('class', 'main axis date')
.call(xAxis);

// draw the y axis
var yAxis = d3.svg.axis()
.scale(y)
.orient('left');

main.append('g')
.attr('transform', 'translate(0,0)')
.attr('class', 'main axis date')
.call(yAxis);

// draw the graph object
var g = main.append("svg:g"); 

g.selectAll("scatter-dots")
.data(ydata_50)  // using the values in the ydata array
.enter().append("svg:circle")  // create a new circle for each value
.attr("cy", function (d) { return y(d); } ) // translate y value to a pixel
.attr("cx", function (d,i) { return x(xdata[i]); } ) // translate x value
.attr("r", 2) // radius of circle
.style("opacity", 0.4); // opacity of circle
}


