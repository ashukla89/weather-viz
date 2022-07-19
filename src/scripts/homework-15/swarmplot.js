import * as d3 from 'd3'

const margin = {
  top: 0,
  right: 0,
  bottom: 70,
  left: 70
}

const width = 900 //- margin.left - margin.right
const height = 500 //- margin.top - margin.bottom

const svg = d3
  .select('#swarmplot')
  .append('svg')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  // .attr('width', width + margin.left + margin.right)
  // .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3.scaleBand().range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([0, 110])
  .range([height, 0])

const colorScale = d3
  .scaleSequential(d3.interpolateRdYlBu)
  .domain([100, 20])

// const radiusScale = d3.scaleSqrt().range([1,3])

d3.csv(require('/data/phl_1991_2020.csv')).then(ready)

function ready(datapoints) {

  // And set up the domain of the xPositionScale
  // using the read-in data
  const months = Array.from(new Set(datapoints.map((d) => d.Month)))
  xPositionScale.domain(months)
  console.log(xPositionScale(3))

  // add swarm

  // d3.select('#months-step').on('stepin', () => {
  //   svg.selectAll('circle')
  //       .attr('opacity', 0.5)
  //       .attr('fill', '#3474eb')
  //   svg.selectAll('.new').attr('opacity', 0)
  // })

  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', d => {
      return `month-circles month month--${d.Month}`
    })
    .attr('r', 1.5)
    .attr('cx', d => {
      return xPositionScale(d.Month) + 37.5
    })
    .attr('cy', d => {
      return yPositionScale(d.TMAX)
    })
    .attr('fill', d => colorScale(d.TMAX))

  // svg
  //   .selectAll('rect')
  //   .data(datapoints)
  //   .enter()
  //   .append('rect')
  //   .attr('class','swarm-rects')
  //   .attr('width', 2)
  //   .attr('height',2)
  //   .attr('x', d => {
  //     return xPositionScale(d.Month) + 35
  //   })
  //   .attr('y', d => {
  //     return yPositionScale(d.TMAX)
  //   })
  //   .attr('fill', d => colorScale(d.TMAX))

  // svg
  //   .append('text')
  //   .text('higher GDP ⟶')
  //   .attr('class', 'gdp-note-high')
  //   .attr('text-anchor', 'middle')
  //   .attr('font-size', 12)
  //   .attr('x', width * 0.75)
  //   .attr('y', height + 15)

  // svg
  //   .append('text')
  //   .text('⟵ lower GDP')
  //   .attr('class', 'gdp-note-low')
  //   .attr('text-anchor', 'middle')
  //   .attr('font-size', 12)
  //   .attr('x', d => )
  //   .attr('y', 0)

  function tick() {
    d3.selectAll(".month-circles")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
  }

  let simulation = d3.forceSimulation(datapoints)
    .force("x", d3.forceX((d) => {
        return xPositionScale(d.Month)+37.5;
        }).strength(1))
    
    .force("y", d3.forceY((d) => {
        return yPositionScale(d.TMAX);
        }).strength(1))
    
    .force("collide", d3.forceCollide(1.5))
    // .stop()
    
    .alphaDecay(0)
    .alpha(0.3)
    .on("tick", tick);

  let init_decay = setTimeout(function () {
    console.log("start alpha decay");
    simulation.alphaDecay(0.1);
    }, 3000); // start decay after 3 seconds

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    //.ticks(5)
    //.tickFormat(d => (d === 80 ? '80 years' : d))

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .lower()

  const monthLabels = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const xAxis = d3
    .axisBottom(xPositionScale)
    // .tickSize(-width)
    //.ticks(5)
    .tickFormat((d,i) => monthLabels[i])

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()
}
