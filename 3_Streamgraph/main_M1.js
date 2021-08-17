const margin = {top: 100, right: 20, bottom: 50, left: 50};
const width = 1160;
const height = 600;
//skin colors are from https://www.schemecolor.com/real-skin-tones-color-palette.php
const groups = [
  { key: 'nominees_caucasian', label: 'caucasian or another', color: '#ffdbac' },
  { key: 'nominees_afrodescendant', label: 'afrodescendant', color: '#8d5524' },
  { key: 'nominees_hispanic', label: 'hispanic', color: '#c68642' },
  { key: 'nominees_asian', label: 'asian', color: '#F1C27D' },
];

// Load the data here
d3.csv('./data/academy_awards_nominees.csv').then(data => {
  console.log('orginal data', data);

  //format the data
  const dataFormatted = [];
  data.forEach(datum => {
   // If dataFormatted doesn't already contain the current year
   if (!dataFormatted.find(ceremony => ceremony.year == datum.year)) {
      const ceremony = {
      year: +datum.year, // Convert the year from string to number
      nominees_total: 1, // Initialize the number of nominees to 1
      nominees_caucasian: datum.ethnic_background === "" ? 1 : 0, // If ethnic_background contains an empty string, nominees_caucasian equals 1, otherwise 0
      nominees_afrodescendant: datum.ethnic_background === "black" ? 1 : 0, // If ethnic_background is 'black', nominees_black equals 1, otherwise 0
      nominees_hispanic: datum.ethnic_background === "hispanic" ? 1 : 0, // If ethnic_background is 'hispanic', nominees_hispanic equals 1, otherwise 0
      nominees_asian: datum.ethnic_background === "asian" ? 1 : 0 // If ethnic_background is 'asian', nominees_asian equals 1, otherwise 0
      };
      dataFormatted.push(ceremony); // Add ceremony to dataFormatted
   } else {
      // If dataFormatted already contains the current year, find the related data
      const ceremony = dataFormatted.find(ceremony => ceremony.year == datum.year);
      ceremony.nominees_total += 1;
      switch (datum.ethnic_background) {
        case '':
          ceremony.nominees_caucasian += 1;
          break;
        case 'black':
          ceremony.nominees_afrodescendant += 1;
          break;
        case 'hispanic':
          ceremony.nominees_hispanic += 1;
          break;
        case 'asian':
          ceremony.nominees_asian += 1;
          break;
      }
   }
  });

  console.log('formated data', dataFormatted);
  createViz(dataFormatted);
});


// Create your visualization here
const createViz = (dataFormatted) => {
	// Create scales
	const scaleColor = d3.scaleOrdinal()
	//.domain( ["nominees_caucasian", "nominees_afrodescendant", "nominees_hispanic", "nominees_asian"] ) // Your domain is the different ethnic groups. You can use the keys in the groups variable to generate a new array of identifiers.
	//.range(d3.schemeTableau10); // Your range is an array of colors. You can use the colors in the groups variable to generate a new array of colors.
		.domain(groups.map(group => group.key))
		.range(groups.map(group => group.color));

	const scaleX = d3.scaleLinear()
	//.domain( [d3.min(dataFormatted, d=> d.year), d3.max(dataFormatted, d=> d.year)] ) this is correct but d3.extend can be used to simplify it
		.domain(d3.extent(dataFormatted, d => d.year))
		.range( [margin.left, width - margin.right ]);

	const scaleY = d3.scaleLinear()
		.domain( [0,  d3.max(dataFormatted, d=> d.nominees_total)] ) // How many nominees do we need to cover for each year?
		.range( [height - margin.bottom,  margin.top ]); // The bottom and top limits of the graph on the screen

	// Append svg element
	const svg = d3.select('#viz')
		.append('svg')
			.attr('viewbox', [0, 0, width, height])
			.attr('width', width)
			.attr('height', height);

	// Initialize the stack generator
	const stack = d3.stack()
		.keys(groups.map(group => group.key))
		.order(d3.stackOrderAscending) // The smallest areas at the bottom and the largest ones at the top.
		.offset(d3.stackOffsetNone); // Applies a zero baseline.

	// Call the stack generator to produce a stack for the data
	let series = stack(dataFormatted);
	console.log('series', series);

	// Initialize the area generator
	const area = d3.area()
		.x(d => scaleX(d.data.year))
		.y0(d => scaleY(d[0]))
		.y1(d => scaleY(d[1]))
		.curve(d3.curveCatmullRom);

	const nomineesPaths = svg
		.append('g')
		   .attr('class', 'stream-paths')
		.selectAll( "path" )
		.data( series )
		.join( "path" )
		   .attr('d',  area )
		   .attr('fill', d =>  scaleColor(d.key) );

	// Append X axis
	axisBottom = d3.axisBottom(scaleX)
    .tickFormat(d3.format(''))
    .tickSizeOuter(0);
	xAxis = svg
		.append('g')
		.attr('transform', `translate(0,${height - margin.bottom})`)
		.style('font-family', '"Oxygen", sans-serif')
		.style('font-size', '14px')
		.style('opacity', 0.7)
		.call(axisBottom);
	svg
		.append('text')
		.attr('class', 'axis-label axis-label-x')
		.attr('x', 0)
		.attr('y', 0)
		.attr('text-anchor', 'middle')
		.attr('transform', `translate(${(width - margin.left - margin.right) / 2 + margin.left}, ${height})`)
		.text('Year');

	// Append Y axis
	const axisLeft = d3.axisLeft(scaleY)
		.tickSizeOuter(0);
	const yAxis = svg
		.append('g')
		.attr('transform', `translate(${margin.left},0)`)
		.style('font-size', '14px')
		.style('opacity', 0.7)
		.call(axisLeft);
	svg
		.append('text')
		.attr('class', 'axis-label axis-label-y')
		.attr('x', 0)
		.attr('y', 0)
		.attr('text-anchor', 'middle')
		.attr('transform', `translate(12, ${(height - margin.top - margin.bottom) / 2 + margin.top}) rotate(270)`)
		.text('Number of Nominees');


	// Append a color legend
	const legend = d3.select('.legend')
		.append('ul')
		.selectAll('li')
		.data(groups)
		.join('li');
	legend
		.append('span')
		.attr('class', 'legend-color')
		.style('background-color', d => d.color);
	legend
		.append('span')
		.attr('class', 'legend-label')
		.text(d => d.label);
			

};