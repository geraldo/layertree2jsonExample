import './style.css';

import {Map, View, Feature} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer, Group as GroupLayer} from 'ol/layer';
import {OSM, TileWMS, TileArcGISRest, Vector as VectorSource, XYZ} from 'ol/source';
import {ScaleLine, defaults as defaultControls, Attribution} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import {Select, Draw} from 'ol/interaction';
import {Overlay as OverlayOL} from 'ol';
import {Style, Stroke, Fill, Circle, Icon, Text} from 'ol/style';
import {LineString, Polygon, Point} from 'ol/geom';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from 'ol/Observable';
import {get as getProjection, transform, fromLonLat, toLonLat} from 'ol/proj';
import {register} from 'ol/proj/proj4';

import LayerSwitcher from 'ol-layerswitcher';
import layersData from "/js/data/poum.qgs.json";

import proj4 from 'proj4';
import $ from 'jquery';

// https://epsg.io/25831
proj4.defs("EPSG:25831","+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

/*
 * Base Layers
 *****************************************/
let ninguLayer = new TileLayer({
  title: 'Ningú',
  type: 'base',
  source: null,
  visible: true,
});

let osmLayer = new TileLayer({
  title: 'OpenStreetMap',
  type: 'base',
  visible: false,
  source: new OSM()
});

let ortoLayer = new TileLayer({
  title: 'Ortofoto històrica de 2020 (AMB)',
  type: 'base',
  visible: false,
  source: new TileArcGISRest({
    url: 'https://geoportal.amb.cat/geoserveis/rest/services/ortofoto_territorial_10cm_2020_25831/MapServer',
    projection: 'EPSG:25831',
    params: {
      'LAYERS': 'Orto2020_10cm'
    },
    attributions: ['© <a target="_blank" href="https://www.amb.cat/">AMB</a>'],
  })
});

let topoBaseLayer = new TileLayer({
  title: 'Topográfic (ICGC)',
  type: 'base',
  visible: false,
  maxZoom: 18,
  source: new TileWMS({
    url: 'https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wms/service?',
    params: {
      'LAYERS': 'topogris', 
      'VERSION': '1.1.1'
    },
    attributions: ['Cartografia topogràfica 1:1.000 de l’<a target="_blank" href="https://www.icgc.cat/">Institut Cartogràfic i Geològic de Catalunya (ICGC)</a>, sota una llicència <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/deed.ca">CC BY 4.0</a>'],
   })
});

let baseLayers = new GroupLayer({
  title: 'Mapa base',
  //fold: 'close',
  layers: [
    ninguLayer,
    osmLayer,
    ortoLayer,
    topoBaseLayer,
  ]
});

/*
 * Overlay Layers
 *****************************************/
let catastroLayer = new TileLayer({
  title: 'Catastro',
  visible: false,
  source: new TileWMS({
    url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
    params: {
      'LAYERS': 'catastro', 
      'TILED': true,
      'SRS': 'EPSG:3857'
    }
  })
});

/*
 * Map
 *****************************************/
const map = new Map({
  target: 'map',
  controls: defaultControls().extend([new ScaleLine()]),
  layers: new GroupLayer({
    fold: 'close',
    layers: [
      baseLayers,
      //catastroLayer,
    ]
  }),
  view: new View({
    center: [199042, 5077018],
    zoom: 14,
    minZoom: 13,
    maxZoom: 18
  })
});

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  startActive: true,
  activationMode: 'click'
});
map.addControl(layerSwitcher);

function loadJSONLayers() {
  let layers = [];

  layersData.forEach(function(layer, i) {

    let name = null, 
      url = null;

    if (layer.mapproxy) {
      name = layer.mapproxy;  // mapproxy
      url = 'https://mapa.psig.es/mapproxy/service?';
    }
    else {
      name = layer.name;  // qgis
      url = 'https://mapa.psig.es/qgisserver/cgi-bin/qgis_mapserv.fcgi';
    }

    var layerSource = new TileWMS({
      url: url,
      projection: 'EPSG:3857',
      params: {
            'LAYERS': name,
            'TRANSPARENT': true,
            'VERSION': '1.3.0',
      },
      serverType: 'qgis',                 
      //gutter:   256
    });

    let newLayer = 
      new TileLayer({
        qgisname: layer.qgisname,
        mapproxy: layer.mapproxy,
        type: layer.type,
        source: layerSource,
        showlegend: layer.showlegend,
        visible: layer.visible,
        hidden: layer.hidden,
        children: layer.children,
        fields: layer.fields,
        indentifiable: layer.indentifiable,
      });

    if (!layer.name.startsWith("@"))
      newLayer.set("title", layer.name);
    layers.push(newLayer);
  });

  return layers;
}

let layersJSON = loadJSONLayers();
layersJSON.forEach(function(layer, i) {
  map.addLayer(layer);
});
layerSwitcher.renderPanel();