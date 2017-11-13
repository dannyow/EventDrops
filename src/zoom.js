export default (d3, svg, config, xScale, draw, getEvent) => {
    const zoom = d3.zoom();

    zoom.on('zoom', () => {
        const newScale = getEvent().transform.rescaleX(xScale);
        // @FIXME: remove d3.selectAll to use current selection
        d3.selectAll('svg').call(draw(config, newScale));
    });

    return zoom;
};
