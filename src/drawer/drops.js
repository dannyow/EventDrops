import * as d3 from 'd3/build/d3';

export default (container, scales, configuration) =>
    data => {
        const leftOffset = configuration.labelsWidth +
            configuration.labelsRightMargin;

        const dropLines = container
            .selectAll('.drop-line')
            .data(data)
            .enter()
            .append('g')
            .classed('drop-line', true)
            .attr('width', scales.x.range()[1])
            .attr('transform', (d, idx) => `translate(0, ${scales.y(idx)})`)
            .attr('fill', configuration.eventLineColor)
            

        if (configuration.overlayDataLines ){
            dropLines.attr('transform', (d,idx)=>'translate(0,0)')
            
            if (configuration.metaballs) {
                dropLines.style('filter', 'url(#metaballs)')
            }
        }   

        const drops = dropLines.selectAll('.drop');

        drops
            .data(d => d.data)
            .enter()
            .append('circle')
            .classed('drop', true)
            .attr('r', configuration.dropSize)
            .attr('cx', d => scales.x(configuration.date(d)))
            .attr('cy', configuration.lineHeight / 2)
            .attr('fill', configuration.eventColor)
            .attr("data-id", d => d.id)
            .on('mousedown', configuration.click)
            .on('dblclick',configuration.dblclick)
            .on('mouseover', configuration.mouseover)
            .on('mouseout', configuration.mouseout);

        // unregister previous event handlers to prevent from memory leaks
        drops
            .exit()
            .on('mousedown', null)
            .on('dblclick',null)
            .on('mouseout', null)
            .on('mouseover', null)
            .remove();

        dropLines.exit().remove();
    };
