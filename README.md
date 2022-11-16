# layertree2json plugin example site

Example web site for layertree2json QGIS plugin, see https://github.com/geraldo/layertree2json

This project right now uses:
- [QGS project example file](https://github.com/geraldo/layertree2jsonExample/blob/main/layertree2jsonExample.qgs).
- [JSON file](https://mapa.psig.es/layertree2jsonExample/js/data/layertree2jsonExample.qgs.json) generated using [layertree2json](https://github.com/geraldo/layertree2json) QGIS plugin.
- [2 layers](https://github.com/geraldo/layertree2jsonExample/tree/main/geodata) saved as static files.
- [QGSI Server](https://docs.qgis.org/3.22/en/docs/server_manual/) to render layers as WMS.
- [Openlayers](https://openlayers.org/) as web map library.
- [ol-layerswitcher](https://github.com/walkermatt/ol-layerswitcher/) to manage layers.

You can have a look at the rendered version [here](https://mapa.psig.es/layertree2jsonExample/).

## Install and run

To install dependencies:

    npm install

Start a development server (available at http://localhost:3000):

    npm start

To generate a build ready for production:

    npm run build

Then deploy the contents of the `dist` directory to your server.  You can also run `npm run serve` to serve the results of the `dist` directory for preview.
