import * as d3 from 'd3'

const margin = { top: 10, left: 10, right: 10, bottom: 10 }

const height = 480 - margin.top - margin.bottom

const width = 480 - margin.left - margin.right

const svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const radius = 220

const radiusScale = d3
  .scaleLinear()
  .domain([10, 100])
  .range([60, radius])

const angleScale = d3
  .scalePoint()
  .domain([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
    'Blah'
  ])
  .range([0, Math.PI * 2])

const colorScale = d3
  .scaleOrdinal()
  .domain(['NYC', 'Beijing', 'Stockholm', 'Lima', 'Tucson'])
  .range(['lightgreen', 'yellowgreen', 'purple', 'orangered', 'magenta'])

const textColorScale = d3
  .scaleOrdinal()
  .domain(['NYC', 'Beijing', 'Stockholm', 'Lima', 'Tucson'])
  .range(['black', 'black', 'white', 'white', 'white'])

const line = d3
  .radialArea()
  .outerRadius(function(d) {
    return radiusScale(d.high_temp)
  })
  .innerRadius(function(d) {
    return radiusScale(d.low_temp)
  })
  .angle(function(d) {
    return angleScale(d.month_name)
  })

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  const container = svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

  datapoints.forEach(d => {
    d.high_temp = +d.high_temp
    d.low_temp = +d.low_temp
  })

  // Filter it so I'm only looking at NYC datapoints
  const nycDatapoints = datapoints.filter(d => d.city === 'NYC')
  nycDatapoints.push(nycDatapoints[0])

  container
    .append('path')
    .attr('class', 'temp')
    .datum(nycDatapoints)
    .attr('d', line)
    .attr('fill', 'lightgreen')
    .attr('opacity', 0.75)

  const circleBands = [20, 30, 40, 50, 60, 70, 80, 90]
  const textBands = [30, 50, 70, 90]

  container
    .selectAll('.bands')
    .data(circleBands)
    .enter()
    .append('circle')
    .attr('class', 'bands')
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', function(d) {
      return radiusScale(d)
    })
    .lower()

  container
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('class', 'city-name nyc')
    .text('NYC')
    .attr('font-size', 30)
    .attr('font-weight', 700)
    .attr('alignment-baseline', 'middle')

  container
    .selectAll('.temp-notes')
    .data(textBands)
    .enter()
    .append('text')
    .attr('class', 'temp-notes')
    .attr('x', 0)
    .attr('y', d => -radiusScale(d))
    .attr('dy', -2)
    .text(d => d + '°')
    .attr('text-anchor', 'middle')
    .attr('font-size', 8)

  function cityDraw(cityDatapoints) {
    cityDatapoints.push(cityDatapoints[0])
    const cityName = cityDatapoints[0].city

    container.selectAll('.city-name').remove()

    container
      .selectAll('.temp')
      .datum(cityDatapoints)
      .transition()
      .attr('d', line)
      .attr('fill', colorScale(cityName))
      .attr('opacity', 0.75)

    container
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'city-name')
      .text(cityName)
      .attr('font-size', 30)
      .attr('font-weight', 700)
      .attr('alignment-baseline', 'middle')

    d3.selectAll(`.label-${cityName}`)
      .style('background-color', colorScale(cityName))
      .style('color', textColorScale(cityName))
  }

  d3.select('#nyc-step').on('stepin', () => {
    const nycDatapoints = datapoints.filter(d => d.city === 'NYC')
    cityDraw(nycDatapoints)
  })

  d3.select('#bei-step').on('stepin', () => {
    const beiDatapoints = datapoints.filter(d => d.city === 'Beijing')
    cityDraw(beiDatapoints)
  })

  d3.select('#stock-step').on('stepin', () => {
    const stkDatapoints = datapoints.filter(d => d.city === 'Stockholm')
    cityDraw(stkDatapoints)
  })

  d3.select('#lima-step').on('stepin', () => {
    const limaDatapoints = datapoints.filter(d => d.city === 'Lima')
    cityDraw(limaDatapoints)
  })

  d3.select('#tu-step').on('stepin', () => {
    const tuDatapoints = datapoints.filter(d => d.city === 'Tucson')
    cityDraw(tuDatapoints)
  })

  function render() {
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    // Do you want it to be full height? Pick one of the two below
    // const svgHeight = height + margin.top + margin.bottom
    const svgHeight = window.innerHeight

    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    const newWidth = svgWidth - margin.left - margin.right
    const newHeight = svgHeight - margin.top - margin.bottom

    console.log('newWidth and newHeight', newWidth, newHeight)

    container.attr(
      'transform',
      'translate(' + newWidth / 2 + ',' + newHeight / 2 + ')'
    )

    // Update our scale
    const newRadius = Math.min(newWidth, newHeight) / 2 - 20
    radiusScale.range([60, newRadius])

    console.log(newRadius)

    // Update things you draw

    container.selectAll('.temp').attr('d', line)

    container.selectAll('.bands').attr('r', function(d) {
      return radiusScale(d)
    })

    container.selectAll('.temp-notes').attr('y', d => -radiusScale(d))
  }

  // When the window resizes, run the function
  // that redraws everything
  window.addEventListener('resize', render)

  // And now that the page has loaded, let's just try
  // to do it once before the page has resized
  render()
}
