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


    safeGetAttribute = (object, attrib) => {

        try {
            return object[attrib];
        }
        catch
        {
            // return 'Unknown User'
            return 'Authoritaties (SHELTER)';
        }
    }

    safeGetDateTime = (object) => {

        try {
            return object['userState']['date'] + ' ' + object['userState']['time'];
        }
        catch
        {
            return 'Unknown Time'
        }
    }


    drawALLMarkers = () => { // optimize more
        let res = [];
        for (var markID in this.props.db.GeoFirePingLocations) {
            let mark = this.props.db.GeoFirePingLocations[markID];
            if (mark.mUserID === this.props.userID || this.props.userID === 'ALL')
                res.push(
                    <Marker
                        key={markID}
                        position={{ lat: mark.l[0], lng: mark.l[1] }}
                        title={'This mark was added by ' + this.safeGetAttribute(this.props.db.Users[mark.mUserID], 'mFirstName')}
                        onClick={this.onMarkerClick}
                    />)
        }
        return res;
    }

    drawLiveMarkers = () => {
        let res = [];
        for (var currentUserID in this.props.db.Users) {
            let mark = this.props.db.Users[currentUserID];
            if (currentUserID === this.props.userID || this.props.userID === 'ALL')
                res.push(
                    <Marker
                        key={currentUserID}
                        position={{ lat: mark.l[0], lng: mark.l[1] }}
                        title={'Last recorded Location of ' + this.safeGetAttribute(mark, 'mFirstName') + ' ' + this.safeGetDateTime(mark)}
                        onClick={this.onMarkerClick}
                    />)
        }
        return res;
    }


    mapClicked = async (mapProps, map, clickEvent) => {

        const lat = clickEvent.latLng.lat();
        const lng = clickEvent.latLng.lng();

        const dataPos = { l: [lat, lng] };
        const dataDesc = { mDescription: 'Shelter', mImageId: 2, mUserID: 'authority' };


        const r1 = await fetch(`https://${process.env.REACT_APP_DATABASE_URL}/GeoFirePingLocations.json?auth=${process.env.REACT_APP_DATABASE_KEY}`,
            {
                method: 'POST',
                body: JSON.stringify(dataPos)
            })

        const entryID = await r1.json();

        await fetch(`https://${process.env.REACT_APP_DATABASE_URL}/Ping-Details/${entryID.name}.json?auth=${process.env.REACT_APP_DATABASE_KEY}`,
            {
                method: 'PUT',
                body: JSON.stringify(dataDesc)
            })

        this.props.refreshHandler();

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
                    onRightclick={this.mapClicked}

                    style={style}
                    // center={this.props.mapCenter}
                    initialCenter={this.props.mapCenter}
                    zoom={14}>

                    {
                        !this.props.liveTrack
                        && this.drawALLMarkers()
                    }

                    {
                        this.props.liveTrack
                        && this.drawLiveMarkers()
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
