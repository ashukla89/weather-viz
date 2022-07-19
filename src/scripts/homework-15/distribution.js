import * as d3 from 'd3'

const margin = {
  top: 30,
  right: 20,
  bottom: 30,
  left: 50
}

const width = 700 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

const svg = d3
  .select('#distribution')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// domain of x-position is determined by range of high temps
const xPositionScale = d3.scaleLinear().domain([0, 85]).range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  //.domain(['a','b','c'])
  .range([
    '#8dd3c7',
    '#ffffb3'
  ])

d3.csv(require('/data/temp-dist.csv')).then(ready)

function ready(datapoints) {

  // And set up the domain of the xPositionScale
  // using the read-in data
  // Find the largest single count
  const oldCounts = datapoints.map(d => d.TmaxOld)
  const newCounts = datapoints.map(d => d.TmaxNew)
  const maxCount = Math.max(...[Math.max(...oldCounts),Math.max(...newCounts)])
  yPositionScale.domain([0,maxCount+5])

  /* Add your rectangles here */

  d3.select('#old-step').on('stepin', () => {
    svg.selectAll('.old')
        .attr('opacity', 0.5)
        .attr('fill', '#3474eb')
    svg.selectAll('.new').attr('opacity', 0)
  })

  d3.select('#old-low-step').on('stepin', () => {
    svg.selectAll('.old').attr('fill','#3474eb')
    svg.selectAll('.below-32').attr('fill', 'darkblue')
    svg.selectAll('.new').attr('opacity', 0)
  })

  d3.select('#old-high-step').on('stepin', () => {
    svg.selectAll('.old').attr('fill','#3474eb')
    svg.selectAll('.above-50').attr('fill', 'darkblue')
    svg.selectAll('.new').attr('opacity', 0)
  })

  d3.select('#new-step').on('stepin', () => {
    svg.selectAll('.old')
        .attr('opacity', 0.5)
        .attr('fill', '#3474eb')
    svg.selectAll('.new')
        .attr('opacity', 0.5)
        .attr('fill', 'orange')
  })

  d3.select('#new-low-step').on('stepin', () => {
    svg.selectAll('.new')
        .attr('fill','orange')
        .attr('opacity', 0.5)
    svg.selectAll('.below-32').attr('fill', 'red')
    svg.selectAll('.old')
        .attr('opacity', 0)
  })

  d3.select('#new-high-step').on('stepin', () => {
    svg.selectAll('.new')
        .attr('fill','orange')
        .attr('opacity', 0.5)
    svg.selectAll('.above-50').attr('fill', 'red')
    svg.selectAll('.old')
        .attr('opacity', 0)
  })

    const boxheight = height / maxCount
    const boxwidth = width / d3.max(xPositionScale.domain())

    // const translate = function(x,y){               
    //     return "translate(" + x + "," + y + ")";
    // }

    // const datapoints1 = [];/*www.  d  e  m  o 2  s .c o  m*/
    //     for (let i=0; i < 100; i++) {
    //     datapoints1.push({
    //         a : ((Math.random() * 30) | 0),
    //         b : ((Math.random() * 30) | 0),
    //         c : ((Math.random() * 30) | 0)
    //     });
    // }

    // datapoints1.forEach(function(d){
    //     const y0 = 0;
    //     d.offsets = colorScale.domain().map(function(type){
    //         return {type: type, y0: y0, y1: y0 += +d[type], value : d[type]}
    // });
    // });

    // console.log(datapoints1)

    // const groups = svg.selectAll(".group")
    //     .data(datapoints1)
    //     .enter().append("g")
    //         .attr("transform", function(d,i){return "translate(" + xPositionScale(i) + ", 0)"})
    //         .attr("class", "group")
    // const types = groups.selectAll(".type")
    //     .data(function(d){return d.offsets})
    //     .enter().append("g")
    //     .attr("transform", function(d){ return translate(0,yPositionScale(d.y1))})
    //     .attr("class", "type")
    //     .attr("fill", function(d){return colorScale(d.type)})

    const horBands = []
    for (let i = 0; i < 130; i++) {
      horBands.push(i)
    }
    console.log(horBands)

    svg.selectAll("lines")
      .data(horBands)
      .enter()
      .append("line")
      .attr('class','white-lines')
      .attr("x1",0)
      .attr("x2",width)
      .attr("y1",d=>yPositionScale(d))
      .attr("y2",d=>yPositionScale(d))
      .attr("stroke","white")
      .attr("stroke-width",2)
      .raise()

    svg.selectAll("blue-rect")
        .data(datapoints)
        .enter()
        .append("rect")
        .attr('class', d => {
            if (d.TMAX <= 32) return "old below-32"
            else if (d.TMAX >= 50) return "old above-50"
            else return "old mid-temps"
          })
        .attr("height", d => height - yPositionScale(d.TmaxOld)) //boxheight-0.5)
        .attr("width", boxwidth-0.5)
        .attr("x", d => xPositionScale(+d.TMAX))
        .attr("y", d => yPositionScale(d.TmaxOld))
        .attr('fill','#3474eb')
        .attr('opacity',0)

    svg.selectAll("orange-rect")
        .data(datapoints)
        .enter()
        .append("rect")
        .attr('class', d => {
            if (d.TMAX <= 32) return "new below-32"
            else if (d.TMAX >= 50) return "new above-50"
            else return "new mid-temps"
          })
        .attr("height", d => height - yPositionScale(d.TmaxNew)) //boxheight-0.5)
        .attr("width", boxwidth-0.5)
        .attr("x", d => xPositionScale(+d.TMAX))
        .attr("y", d => yPositionScale(d.TmaxNew))
        .attr('fill','orange')
        .attr('opacity',0)

    svg.selectAll(".white-lines").raise()

  const xAxis = d3
    .axisBottom(xPositionScale)

  const yAxis = d3
    .axisLeft(yPositionScale)
    // .tickSize(-width)
    //.ticks(5)
    //.tickFormat(d => (d === 80 ? '80 years' : d))

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .lower()

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()

//   d3.select('.y-axis .domain').remove()

  function render() {
    console.log('Rendering')

    // This section will always be the same (except the last line, maybe)
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    // const svgHeight = window.innerHeight
    // If you don't want the height to change, use this
    const svgHeight = height + margin.top + margin.bottom

    // always be the same
    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    // always be the same
    const newWidth = svgWidth - margin.left - margin.right
    const newHeight = svgHeight - margin.top - margin.bottom

    // Update your scales - almost always be the same
    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    // Update things you draw
    svg
      .selectAll('rect')
      .attr('width', xPositionScale.bandwidth())
    //   .attr('x', d => {
    //     return xPositionScale(d.country)
    //   })

    yAxis.tickSize(-newWidth)

    // Update your axes - almost always the same
    svg
      .select('.y-axis')
      .transition()
      .call(yAxis)

    d3.select('.y-axis .domain').remove()
  }

//   // When the window resizes, run the function
//   // that redraws everything
//   window.addEventListener('resize', render)

  // And now that the page has loaded, let's just try
  // to do it once before the page has resized
  render()
}
