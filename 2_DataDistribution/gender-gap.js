const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const colorMen = '#F2C53D';
const colorWomen = '#A6BF4B';
const colorMenCircles = '#BF9B30';
const colorWomenCircles = '#718233';

// Load data here
d3.csv('./data/pay_by_gender_all.csv').then(data => {
    
    data.forEach(datum => {
  
      datum.earnings_USD_2019 = +datum.earnings_USD_2019.replaceAll(',', ''); //first change string to float
    
  });
  console.log('data', data);
  createViz(data);
});


const createViz = (data) => { 
	const sports = [ 'basketball', 'golf', 'tennis'];
  	const genders = ['men', 'women'];
 	 const bins = [];

  	sports.forEach(sport => {
    	genders.forEach(gender => {
      		const binsSet = {
        	sport: sport,
        	gender: gender,
        	bins: d3.bin()(data.filter(datum => datum.sport === sport && datum.gender === gender).map(datum => datum.earnings_USD_2019)) // so this should bin by sport and gender, and make a new array with earnings in this subgroups
     		 };
      	bins.push(binsSet); // how does it know to make 5 of them if this was not specified anywhere???
      
    	});
  	});
  	console.log(bins);
 
  	const maxEarning = d3.max(data, d => d.earnings_USD_2019);
  	console.log('maxEarning', maxEarning);

  	// this is wrong const binsMaxLength = d3.max([bins], d => d.length);
	const binsMaxLength = d3.max(bins.map(bin => bin.bins), d => d.length);
	const xMaxLength = 60;

  	//xScale 
  	const violinXscale = d3	.scaleLinear()
	  						// this is wrong .domain([0, sport.length-1])
							.domain([0, binsMaxLength])  //seems as if this is not for the whole graph but for each bin separately?
							.range([0, xMaxLength]);
	  						// this is wrong .range([margin.left, width - margin.right]);

  	//yScale 
  	const violinYscale = d3	.scaleLinear()
	  						// this is wrong .domain([bins[0].x0, bins[bins.length - 1].x1]) //how are these bins defined? I imagine they get defined only later, or not?
							.domain([0, maxEarning + 5000000])
							.range([height - margin.bottom, margin.top]);
							  
  	//time to append the svg for the chart
	const svg = d3	.select("#viz")
	  						.append('svg')
	  						.attr('viewbox', [0, 0, width, height])
	  						.attr('width', width)
	  						.attr('height', height);
						  
   
  // append the x axis
  /* 	violinChart
	  	.append('g')
	  	.attr('class', 'x-axis-group')
	  	.attr('transform', `translate(0, ${height - margin.bottom})`)
	  	.call(d3.axisBottom(violinXscale)); */
	const spaceBetweenSports = (width - margin.left - margin.right) / (sports.length + 1);
  	const xAxisGroup = svg
    	.append('g')
      	.attr('class', 'x-axis-group');
  	xAxisGroup 							//why oh why this cannot be done as a regular axis?
    	.append('line')
      		.attr('class', 'x-axis')
      		.attr('x1', margin.left)
      		.attr('x2', width - margin.right)
      		.attr('y1', height - margin.bottom + 1)
      		.attr('y2', height - margin.bottom + 1)
      		.attr('stroke', 'black');
 	 xAxisGroup
    	.selectAll('.sport-label')
    	.data(sports)
    	.join('text')
      		.attr('x', (d, i) => margin.left + ((i + 1) * spaceBetweenSports))
      		.attr('y', height - 20)
      		.attr('text-anchor', 'middle')
      		.text(d => d.charAt(0).toUpperCase() + d.slice(1));

	// append the y axis
	const yAxis = d3.axisLeft(violinYscale.nice());
	const yAxisGroup = svg
  	.append('g')
  	.attr('transform', `translate(${margin.left}, 0)`)
  	.call(d3.axisLeft(violinYscale));						

  //add the y axis text 
  	xAxisGroup.append("text")
		.attr("x",margin.left)
  		.attr("y",margin.top-10)
  		.style("text-anchor","start")
		.text("Earnings in 2019 (USD)")
		.style("fill","#d96d3cblack")
		.style("font-weight","bold") 


  // Append area  this was too much for me so it was copied and studied ;(
  const areaGeneratorMen = d3.area()
    .x0(margin.left)
    .x1(d => margin.left + violinXscale(d.length))
    .y(d => violinYscale(d.x1) + ((violinYscale(d.x0) - violinYscale(d.x1)) / 2))
    .curve(d3.curveCatmullRom);
  const areaGeneratorWomen = d3.area()
    .x0(d => margin.left - violinXscale(d.length))
    .x1(margin.left)
    .y(d => violinYscale(d.x1) + ((violinYscale(d.x0) - violinYscale(d.x1)) / 2))
    .curve(d3.curveCatmullRom);

  svg
    .append('g')
      .attr('class', 'violins')
    .selectAll('.violin')
    .data(bins)
    .join('path')
      .attr('class', d => `violin violin-${d.sport} violin-${d.gender}`)
      .attr('d', d => d.gender === 'women' ? areaGeneratorWomen(d.bins) : areaGeneratorMen(d.bins))
      .attr('transform', d => {
        const index = sports.indexOf(d.sport) + 1;
        const translationX = index * spaceBetweenSports;
        return `translate(${translationX}, 0)`; // The margin.left part of the translation is applied in the areaGenerator functions to avoid negative x values for women
      })
      .attr('fill', d => d.gender === 'women' ? colorWomen : colorMen)
      .attr('fill-opacity', 0.8)
      .attr('stroke', 'none');		
};


// Create Visualization
/* createViz = (data) => {

  // Create bins for each sport, men and women
  


}; */