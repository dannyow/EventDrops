export default (d3, svg, config, xScale, draw, getEvent) => {
    const {
        zoom: {
            onZoomStart,
            onZoom,
            onZoomEnd,
        },
    } = config;

    const zoom = d3.zoom();

    zoom.on('zoom.start', onZoomStart).on('zoom.end', onZoomEnd);

    zoom.on('zoom', (...args) => {
        const newScale = getEvent().transform.rescaleX(xScale);
        // @FIXME: remove d3.selectAll to use current selection
        d3.selectAll('svg').call(draw(config, newScale));

        if (onZoom) {
            onZoom(args);
        }
    });

    return zoom;
};
