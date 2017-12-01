import { metaballs } from '../metaballs';
import { delimiters } from './delimiters';
import dropsFactory from './drops';
import labelsFactory from './labels';
import lineSeparatorFactory from './lineSeparator';
import { drawTopAxis, drawBottomAxis, boolOrReturnValue } from './xAxis';

export default (svg, dimensions, scales, configuration) => {
    const defs = svg.append('defs');
    const { margin, labelsWidth, displayLabels, lineHeight} = configuration;

    const chartWidth = dimensions.chartWidth;
    const chartXOffset = displayLabels ? margin.left + dimensions.labelsTotalWidth : margin.left;

    defs
        .append('clipPath')
        .attr('id', 'drops-container-clipper')
        .append('rect')
        .attr('id', 'drops-container-rect')
        .attr('width', chartWidth)
        .attr(
            'height',
            dimensions.height +
                configuration.margin.top +
                configuration.margin.bottom
        );

    
    const labelsContainer = svg
        .append('g')
        .classed('labels', true)
        .attr('width', labelsWidth)
        .attr('transform', `translate(${margin.left}, ${lineHeight})`);
    
    const chartWrapper = svg
        .append('g')
        .attr('class', 'chart-wrapper')
        .attr('width', chartWidth)
        .attr('transform', `translate(${chartXOffset}, ${configuration.margin.top})` );

    const dropsContainer = chartWrapper
        .append('g')
        .classed('drops-container', true)
        .attr('clip-path', 'url(#drops-container-clipper)');

    if (configuration.metaballs) {
        dropsContainer.style('filter', 'url(#metaballs)');
    }

    chartWrapper
        .append('g')
        .classed('extremum', true)
        .attr('width', chartWidth)
        .attr('height', 30)
        .attr('transform', `translate(0, -35)`);

    if (configuration.metaballs) {
        metaballs(defs);
    }

    const axesContainer = chartWrapper.append('g').classed('axes', true);
    const lineSeparator = lineSeparatorFactory(
        scales,
        configuration,
        dimensions
    );
    
    const labels = labelsFactory(labelsContainer, scales, configuration);
    
    const drops = dropsFactory(dropsContainer, scales, configuration);

    return data => {
        lineSeparator(axesContainer, data);
        delimiters(
            svg,
            scales,
            configuration.dateFormat
        );
        drops(data);
        labels(data);
        if (boolOrReturnValue(configuration.hasTopAxis, data)) {
            drawTopAxis(axesContainer, scales.x, configuration, dimensions);
        }
        if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
            drawBottomAxis(axesContainer, scales.x, configuration, dimensions);
        }
    };
};
