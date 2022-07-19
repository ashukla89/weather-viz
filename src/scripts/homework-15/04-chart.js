import * as d3 from 'd3'

const margin = { top: 20, left: 25, right: 0, bottom: 70 }

const height = 600 - margin.top - margin.bottom
const width = 800 - margin.left - margin.right

const svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

Promise.all([
  d3.csv(require('/data/ces.csv')), //
  d3.csv(require('/data/wages.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([ces, wages]) {
  const job = ces[0]

  const customDatapoints = [
    { name: 'Minutes', value: player.MP / maxMinutes },
    { name: 'Points', value: player.PTS / maxPts },
    { name: 'Field Goals', value: player.FG / maxFg },
    { name: '3-Point Field Goals', value: player.threeP / max3p },
    { name: 'Free Throws', value: player.FT / maxFt },
    { name: 'Rebounds', value: player.TRB / maxRb },
    { name: 'Assists', value: player.AST / maxAs },
    { name: 'Steals', value: player.STL / maxStl },
    { name: 'Blocks', value: player.BLK / maxBlk }
  ]
}
