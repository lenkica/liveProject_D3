// second chart with circles
// bring in the data
const topRockSongs = [
    { artist: "Fleetwod Mac", title: "Dreams", sales_and_streams: 1882000 },
    { artist: "AJR", title: "Bang!", sales_and_streams: 1627000 },
    { artist: "Imagine Dragons", title: "Believer", sales_and_streams: 1571000 },
    { artist: "Journey", title: "Don't Stop Believin'", sales_and_streams: 1497000 },
    { artist: "Eagles", title: "Hotel California", sales_and_streams: 1393000 }
 ];

const topSongsSection = d3.select("#top-songs");

topSongsSection
 .append('h3')
    .text('Top Rock Songs');

// create svg
const circlesChartWidth = 550;
const circlesChartHeight = 130;
const circlesChart = topSongsSection
      .append('svg')
         .attr('viewbox', [0, 0, circlesChartWidth, circlesChartHeight])
         .attr('width', circlesChartWidth)
         .attr('height', circlesChartHeight);

// create the horizontal line for the chart

circlesChart
            .append('line')
               .attr('x1', 0)
               .attr('y1', circlesChartHeight/2)
               .attr('x2', circlesChartWidth)
               .attr('y2', circlesChartHeight/2)
               .attr('stroke', '#333')
               .attr('stroke-width', 2);

// now create a g element, that will be used to later bind the data
const circlesChartGroup = circlesChart
                                    .selectAll(".label-circles")
                                    .data(topRockSongs)
                                    .join('g')
                                        .attr("class", ".label-circles");

// create the linear x scale
const radiusMax = 40;
const circlesScale = d3.scaleLinear()
                        .domain([0 , d3.max(topRockSongs, d => d.sales_and_streams)])
                        .range([0, Math.PI * Math.pow(radiusMax, 2)])

// We can now append circles
const marginMargin = 15;
circlesChartGroup
                .append('circle')
                .attr("cx", (d, i) => radiusMax + marginMargin + (i * 2 * (radiusMax + marginMargin)))
                .attr("cy", circlesChartHeight/2) //this I have done right
                .attr("r", d => Math.sqrt(circlesScale(d.sales_and_streams) / Math.PI))
                .attr("fill", "purple");

//create labels on top
circlesChartGroup
                .append("text")
                .attr('class', 'label label-circle')
                .attr("x", (d, i) => radiusMax + marginMargin + (i *2 * (radiusMax + marginMargin)))
                .attr("y", marginMargin)
                .attr('text-anchor', 'middle')
                .text(d => d.sales_and_streams/ 1000000 + 'M');

//create labels on the bottom
circlesChartGroup
                .append("text")
                .attr('class', 'label label-circle')
                .attr("x", (d, i) => radiusMax + marginMargin + (i *2 * (radiusMax + marginMargin)))
                .attr("y", circlesChartHeight - marginMargin)
                .attr('text-anchor', 'middle')
                .text(d => d.title);

                
            
