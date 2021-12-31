'use-strict';

const D3Node = require('d3-node');


function lineChart({
  data,
  selector: _selector = '#chart',
  container: _container = `
	<div id="container">
	  <h2>Line Chart</h2>
	  <div id="chart"></div>
	</div>
  `,
  style: _style = '',
  width: _width = 960,
  height: _height = 500,
  margin: _margin = { top: 20, right: 20, bottom: 60, left: 30 },
  lineWidth: _lineWidth = 1.5,
  lineColor: _lineColor = 'steelblue',
  lineColors: _lineColors = ['steelblue'],
  isCurve: _isCurve = true,
  tickSize: _tickSize = 5,
  tickPadding: _tickPadding = 5,
  rotateX: _rotateX = 0,
  title: title = 0,
  xAxisTitle: _xAxisTitle= '',
  yAxisTitle: _yAxisTitle= '',
  xTickFormat: _xTickFormat = null,
  yTickFormat: _yTickFormat = null
} = {}) {
  const d3n = new D3Node({
	selector: _selector,
	svgStyles: _style,
	container: _container,
  });

  const d3 = d3n.d3;

  const width = _width - _margin.left - _margin.right;
  const height = _height - _margin.top - _margin.bottom;

  const svg = d3n.createSVG(_width, _height)
		.append('g')
		.attr('transform', `translate(${_margin.left}, ${_margin.top})`);

	svg.append('text')
		.attr('x', (width / 2))
		.attr('y', 0 - (_margin.top / 2))
		.attr('text-anchor', 'middle')
		.style('font-size', '14px')
		.style('text-decoration', 'underline')
		.text(title || '');

	svg.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 0 - (_margin.left))
		.attr('x', 0 - (height / 2))
		.attr('dy', '14px')
		.style('text-anchor', 'middle')
		.text(_yAxisTitle);

	svg.append('text')
		.attr('x', width/2 )
		.attr('y',  height + (_margin.bottom-(_margin.bottom/3)) )
		.style('text-anchor', 'middle')
		.text(_xAxisTitle);

	const g = svg.append('g');

	const { allKeys } = data;

	const xScale = d3.scaleLinear()
		.domain(allKeys ? d3.extent(allKeys) : d3.extent(data, d => d.key))
		.rangeRound([0, width]);

	const yScale = d3.scaleLinear()
		.domain(allKeys ? [d3.min(data, d => d3.min(d, v => v.value)), d3.max(data, d => d3.max(d, v => v.value))] : d3.extent(data, d => d.value))
		.rangeRound([height, 0]);


	const xAxis = d3.axisBottom(xScale)
		.tickSize(_tickSize)
		.ticks(24)
		.tickPadding(_tickPadding);

	if (_xTickFormat) {
		xAxis.tickFormat(_xTickFormat);
	}

	const yAxis = d3.axisLeft(yScale)
		.tickSize(_tickSize)
		.ticks(5)
		.tickPadding(_tickPadding);

	if (_yTickFormat) {
		yAxis.tickFormat(_yTickFormat);
	}


  	const lineChart = d3.line()
		.x(d => xScale(d.key))
		.y(d => yScale(d.value));

	if (_isCurve) lineChart.curve(d3.curveBasis);

	g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	if(_rotateX) {
		g.selectAll('text')
		.style('text-anchor', 'end')
		.attr('dx', '-.8em')
		.attr('dy', '.15em')
		.attr('transform', `rotate(${_rotateX})`);
	}

	g.append('g')
		.call(yAxis);

	g.append('g')
		.attr('fill', 'none')
		.attr('stroke-width', _lineWidth)
		.selectAll('path')
		.data(allKeys ? data : [data])
		.enter().append('path')
		.attr('stroke', (d, i) => i < _lineColors.length ? _lineColors[i] : _lineColor)
		.attr('d', lineChart);


	return d3n;
}


module.exports = {
	lineChart
};
