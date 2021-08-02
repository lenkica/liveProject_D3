const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const padding = 1;
const color = 'steelblue';

//import the data from csv
d3.csv('./data/pay_by_gender_tennis.csv').then(data => {
    console.log('data', data); // I do not understand why here I need data in brackets also!

 const earnings = [];
 // this is wrong   const earnings = ['earnings_USD_2019'];
 //now convert strings to numbers and ?re?populate the array

 data.forEach(datum => {
     //   datum[metric] = replace(',',"")
     //   datum[metric] = parseFloat(datum[metric]); // Convert strings to numbers
     const earning = +datum.earnings_USD_2019.replaceAll(',', '');  //I don't really get this
     earnings.push(earning);
    });
    createHistogram(earnings);

});

// Create Visualization
createHistogram = (data) => {
    // const bins = d3.bin()('earnings'); this is where I made the mistake and binned the data from "earnings"
    const bins = d3.bin()(data);
    console.log(bins);

    ///xScale time
    const histoXscale = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1]) //how are these bind defined? I imagine they get defined only later, or not?
        .range([margin.left, width - margin.right]);

    //yScale time
    const histoYscale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top]);

    
    //time to append the svg for the chart
        const histogramChart = d3.select("#viz")
        .append('svg')
        .attr('viewbox', [0, 0, width, height])
        .attr('width', width)
        .attr('height', height);
     
    // append the x axis
    histogramChart
        .append('g')
        .attr('class', 'x-axis-group')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(histoXscale));

    //add the x axis text 
    histogramChart.append("text")
    .attr("x",width -  margin.right)
    .attr("y",height - margin.bottom +40)
    .style("text-anchor","end")
    .text("Earnings in 2019 (USD)")
    .style("fill","#d96d3cblack")
    .style("font-weight","bold") 

    // append the y axis
    histogramChart
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(histoYscale));

    //create bars for histo
    histogramChart
        .append('g')
            .attr('class', 'bars-group')
            .attr('fill', 'blue')
        .selectAll('rect')
        .data(bins)
        .join('rect')
            .attr('x', d => histoXscale(d.x0) + padding)
            .attr('y', d => histoYscale(d.length))
            .attr('width', d => histoXscale(d.x1) - histoXscale(d.x0) - padding)
            .attr('height', d => histoYscale(0) - histoYscale(d.length))
            .attr('fill', '#a6d854');

    // add the density line
    linedensityChart = d3.line()
                            .x(d => histoXscale(d.x0) + (histoXscale(d.x1) - histoXscale(d.x0) - padding) / 2)  //??????? how exacty does this work with d.x0?
                            //.x((d) => histoXscale(d.((x0+x1)/2)) + padding)
                            .y((d) => histoYscale(d.length))
                            .curve(d3.curveCatmullRom);

    //append the density line
    histogramChart
        .append('g')
            .attr('class', 'curve-group')
        .append('path')
            .attr('d', linedensityChart(bins))
            .attr('fill', 'none')
            .attr('stroke', 'magenta')
            .attr('stroke-width', 2);

    //now create the are path
    areadensityChart = d3.area()
                            .x(d => histoXscale(d.x0) + (histoXscale(d.x1) - histoXscale(d.x0) - padding) / 2)
                            .y0(height - margin.bottom)
                            .y1(d => histoYscale(d.length))
                            .curve(d3.curveCatmullRom);

    //append the area density line
    histogramChart
    .append('g')
        .attr('class', 'curve-group')
    .append('path')
        .attr('d', areadensityChart(bins))
        .attr('fill', 'yellow')
        .attr('stroke', 'none')
        .attr('fill-opacity', 0.5)
        .attr('stroke-width', 2);
                   
};
     
