import * as d3 from 'd3'
//import * as d3s

const margin = {
  top: 0,
  right: 0,
  bottom: 70,
  left: 70
}

const width = 900 //- margin.left - margin.right
const height = 500 //- margin.top - margin.bottom

const svg = d3
  .select('#swarmplot-epoch')
  .append('svg')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  // .attr('width', width + margin.left + margin.right)
  // .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const xPositionScale = d3.scaleBand()
    .paddingOuter(0.5)
    .paddingInner(0.5)
    .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([0, 80])
  .range([height, 0])

const colorScale = d3
  .scaleSequential(d3.interpolateRdYlBu)
  .domain([100, 20])

// const radiusScale = d3.scaleSqrt().range([1,3])

d3.csv(require('/data/phl_century_epochs.csv')).then(ready)

function ready(datapoints) {

  // And set up the domain of the xPositionScale
  // using the read-in data

  // filter to winter months
  datapoints = datapoints.filter(d=> d.Month <= 2 | d.Month == 12)

  const epochs = Array.from(new Set(datapoints.map((d) => d.Epoch)))
  console.log(epochs)
  xPositionScale.domain(epochs)
  console.log(xPositionScale('1891-1920'))
  console.log(xPositionScale('1991-2020'))

  // specify step logic

  d3.select('#old-epoch-step').on('stepin', () => {
    svg.selectAll('.old')
        .attr('opacity', 1)
    svg.selectAll('.new').attr('opacity', 0)
  })

  d3.select('#new-epoch-step').on('stepin', () => {
    svg.selectAll('.new').attr('opacity', 1)
  })

  d3.select('#extremes-step').on('stepin', () => {
    svg.selectAll('.epoch-circles')
      .attr('opacity', 1)
  })

  d3.select('#freezing-step').on('stepin', () => {
    svg.selectAll('.epoch-circles')
      .attr('opacity', 0.1)
    svg.selectAll('.below-32')
      .attr('opacity', 1)
  })

  d3.select('#above-50-step').on('stepin', () => {
    svg.selectAll('.epoch-circles')
      .attr('opacity', 0.1)
    svg.selectAll('.above-50')
      .attr('opacity', 1)
  })

  // add swarm

  svg
    .selectAll('epoch-circles')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', function(d) {
      let classes = 'epoch-circles '
      if (d.TMAX <= 32) classes += 'below-32'
        else if (d.TMAX >= 50) classes += 'above-50'
        else classes += 'middle'
      if (d.Epoch == '1891-1920') classes += ' old'
        else classes += ' new'
      return classes
    })
    .attr('r', 1.5)
    .attr('cx', d => {
      return xPositionScale(d.Epoch) + 90
    })
    .attr('cy', d => {
      return yPositionScale(d.TMAX)
    })
    .attr('fill', d => colorScale(d.TMAX))
    .attr('opacity', 0)

  function tick() {
    d3.selectAll(".epoch-circles")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
  }

  let simulation = d3.forceSimulation(datapoints)
    .force("x", d3.forceX((d) => {
        return xPositionScale(d.Epoch)+90;
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

  const xAxis = d3
    .axisBottom(xPositionScale)
    // .tickSize(-width)
    //.ticks(5)
    //.tickFormat((d,i) => monthLabels[i])

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()
}
