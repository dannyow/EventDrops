import * as d3 from 'd3/build/d3';
import configurable from 'configurable.js';

import './style.css';

import defaultConfig from './config';
import drawer from './drawer';
import zoom from './zoom';

function eventDrops(config = {}) {
    const finalConfiguration = Object.assign({}, defaultConfig, config);

    const yScale = data => {
        return d3
            .scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(data.map((d, i) => i * finalConfiguration.lineHeight));
    };

    const xScale = (width, timeBounds) => {
        return d3.scaleTime().domain(timeBounds).range([0, width]);
    };

    function eventDropGraph(selection) {
        let scales;
        const chart = selection.each(function selector(data) {
            d3.select(this).select('.event-drops-chart').remove();

            const dimensions = {
                width: this.clientWidth,
                height: finalConfiguration.overlayDataLines ? finalConfiguration.lineHeight : data.length * finalConfiguration.lineHeight,

                labelsTotalWidth: finalConfiguration.labelsWidth + finalConfiguration.labelsRightMargin,

                get chartWidth () {
                    const widthWithoutMargins = this.width - finalConfiguration.margin.left - finalConfiguration.margin.right;
                    const chartWidth = finalConfiguration.displayLabels ? widthWithoutMargins - this.labelsTotalWidth : widthWithoutMargins

                    return chartWidth;
                }
            };

            const svg = d3
                .select(this)
                .append('svg')
                .classed('event-drops-chart', true)
                .attr(
                    'width',
                    dimensions.width 
                )
                .attr(
                    'height',
                    dimensions.height +
                        finalConfiguration.margin.top +
                        finalConfiguration.margin.bottom
                );

            scales = getScales(dimensions, finalConfiguration, data);

            const draw = drawer(svg, dimensions, scales, finalConfiguration);
            draw(data);

            if (finalConfiguration.zoomable) {
                zoom(
                    svg,
                    dimensions,
                    scales,
                    finalConfiguration,
                    data,
                    finalConfiguration.zoomStreamCallback
                );
            }
        });

        chart.dateFormat = finalConfiguration.dateFormat;
        chart.scales = scales;
    }

    function getScales(dimensions, configuration, data) {
        const visualOffset = configuration.dataHorizontalMargin;
        const tmpXScale = d3.scaleTime().domain([configuration.start, configuration.end]).range([visualOffset, dimensions.chartWidth-visualOffset]);
        const timeBoundsWithOffset = [tmpXScale.invert(0), tmpXScale.invert(dimensions.chartWidth)]
        return {
            x: xScale(
                dimensions.chartWidth,
                timeBoundsWithOffset
            ),
            y: yScale(data),
        };
    }

    configurable(eventDropGraph, finalConfiguration);

    return eventDropGraph;
}

d3.chart = d3.chart || {};
d3.chart.eventDrops = eventDrops;

export { eventDrops };
