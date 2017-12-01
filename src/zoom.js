import * as d3 from 'd3/build/d3';
import xAxis from './xAxis';
import labels from './drawer/labels';
import { delimiters } from './drawer/delimiters';
import { boolOrReturnValue } from './drawer/xAxis';
import debounce from 'debounce';

export default (
    container,
    dimensions,
    scales,
    configuration,
    data,
    callback
) => {
    const onZoom = (data, index, element) => {
        const scalingFunction = d3.event.transform.rescaleX(scales.x);

        let result = {};
        if (boolOrReturnValue(configuration.hasTopAxis, data)) {
            container
                .selectAll('.x-axis.top')
                .call(d3.axisTop().scale(scalingFunction));
        }

        if (boolOrReturnValue(configuration.hasBottomAxis, data)) {
            container
                .selectAll('.x-axis.bottom')
                .call(d3.axisBottom().scale(scalingFunction));
        }

        const sumDataCount = debounce(
            (data, callback) => {
                const domain = scalingFunction.domain();

                const result = {
                    counts: labels(
                        container.select('.labels'),
                        { x: scalingFunction },
                        configuration
                    )(data),
                    dates: {
                        from: domain[0],
                        to: domain[1]
                    }
                };

                delimiters(
                    container,
                    { x: scalingFunction },
                    configuration.dateFormat
                );
                if (callback) {
                    callback(result);
                }
            },
            100
        );

        requestAnimationFrame(() => {
            const drops = container
                .selectAll('.drop-line')
                .selectAll('.drop')
                .attr('cx', d => scalingFunction(configuration.date(d)));

            sumDataCount(data, result => {
                if (callback) {
                    callback(result);
                }
            });
        });
    };

    const zoomEnd = (data, index, element) => {
        const scalingFunction = d3.event.transform.rescaleX(scales.x);
        const domain = scalingFunction.domain();
        configuration.zoomend({dates: {from: domain[0], to: domain[1]}});
    };


    let maxScale = configuration.maxScale
    if (Array.isArray(configuration.maxScaleBounds) && configuration.maxScaleBounds.length==2){
        const visualOffset = configuration.dataHorizontalMargin;
        const [d0, d1] = configuration.maxScaleBounds;
        const chartWidth = dimensions.chartWidth;
        maxScale = (chartWidth - 2*visualOffset) / Math.abs( scales.x(d1) - scales.x(d0))
    }

    const zoom = d3
        .zoom()
        .scaleExtent([configuration.minScale, maxScale])
        .on('zoom', onZoom)
        .on('end', zoomEnd);

    container.call(zoom);
    return zoom;
};
