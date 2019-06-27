import React from 'react';
import mapboxgl from 'mapbox-gl';

import MapChild from '../MapChild';

const propTypes = {};

const defaultProps = {};

@MapChild
export default class MapMarkerLayer extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        if (props.setDestroyer) {
            props.setDestroyer(props.layerKey, this.destroy);
        }

        this.markers = [];
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        const {
            map: oldMap,
            mapStyle: oldMapStyle,
            geoJson: oldGeoJson,
        } = this.props;
        const {
            map: newMap,
            mapStyle: newMapStyle,
            geoJson: newGeoJson,
        } = nextProps;
        if (oldMap !== newMap || oldMapStyle !== newMapStyle || oldGeoJson !== newGeoJson) {
            this.destroy();
            this.create(nextProps);
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    destroy = () => {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    create = ({
        geoJson,
        map,
    }) => {
        geoJson.features.forEach((feature) => {
            const {
                properties: {
                    popupHTML,
                    markerHTML,
                    containerClassName,
                },
            } = feature;

            const el = document.createElement('div');
            el.className = containerClassName;

            const marker = new mapboxgl.Marker(el);
            el.innerHTML = markerHTML;

            if (popupHTML) {
                const popup = new mapboxgl.Popup({ offset: 10 })
                    .setHTML(popupHTML);
                marker.setPopup(popup);
            }

            marker.setLngLat(feature.geometry.coordinates)
                .addTo(map);

            this.markers.push(marker);
        });
    }

    render() {
        return null;
    }
}
