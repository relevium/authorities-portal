import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

class MapContainer extends Component {
    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {},
    };

    onMarkerClick = (props, marker, e) =>
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });

    onMapClicked = (props) => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            })
        }
    };


    safeGetFirstName = (val) => {

        try {
            return val['mFirstName']
        }
        catch
        {
            return 'Unknown User'
        }
    }


    drawMarks = () => { // optimize more
        let res = [];
        for (var markID in this.props.db.GeoFirePingLocations) {
            let mark = this.props.db.GeoFirePingLocations[markID];
            if (mark.mUserID === this.props.userID || this.props.userID === 'ALL')
                res.push(
                    <Marker
                        key={markID}
                        position={{ lat: mark.l[0], lng: mark.l[1] }}
                        title={'This mark was added by ' + this.safeGetFirstName(this.props.db.Users[mark.mUserID])}
                        onClick={this.onMarkerClick}
                    />)
        }
        return res;
    }

    render() {
        const style = {
            margin: '5%',
            // width: '100%',
            height: '600px',
        }
        return (
            <div id="map" style={{ style }}>
                <Map
                    google={this.props.google}
                    style={style}
                    // center={this.props.mapCenter}
                    initialCenter={this.props.mapCenter}
                    zoom={14}>

                    {
                        this.drawMarks()
                    }

                    <InfoWindow
                        marker={this.state.activeMarker}
                        visible={this.state.showingInfoWindow}>
                        <div>
                            {this.state.selectedPlace.title}
                        </div>
                    </InfoWindow>
                </Map>
            </ div >
        )
    }

}

export default GoogleApiWrapper({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY })(MapContainer);
