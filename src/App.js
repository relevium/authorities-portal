import React, { Component } from 'react';
import './App.css';
import MapContainer from './components/MapContainer';
import Spinner from './components/Spinner';
import UsersDrawer from './components/UsersDrawer';

class App extends Component {


  state = {
    loading: true,
    selectedUser: 'ALL',
    db: {},
    liveTrack: false
  }

  componentDidMount() {
    document.title = "Authorities Portal"
    this.fetchAll();
  }

  liveLocationHandler = (value) => {
    this.setState({ liveTrack: value });
  }

  selectedUserHandler = (userID) => {
    this.setState({ selectedUser: userID });
  }

  fetchAll = () => {
    console.log('start fetching');
    const collections = ['GeoFirePingLocations', 'Ping-Details', 'Users', 'User-Location'];

    Promise.all(collections.map(collection => fetch(`https://${process.env.REACT_APP_DATABASE_URL}/${collection}.json?auth=${process.env.REACT_APP_DATABASE_KEY}`)))
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(data => this.setState(
        {
          db: {
            'GeoFirePingLocations': this.mergeLeft(data[0], data[1]),
            'Users': this.mergeLeft(data[2], data[3])
          },
          loading: false
        }))
  }


  mergeLeft = (collectionLeft, collectionRigth) => {
    const merged = { ...collectionLeft, ...collectionRigth };
    Object.keys(collectionLeft).forEach(k => { merged[k] = Object.assign(collectionLeft[k], collectionRigth[k]) });
    return collectionLeft;
  }

  listPingLocations = () => {
    let res = []
    const allUsers = this.state.db.Users;
    for (var id in this.state.db.GeoFirePingLocations) {
      let obj = this.state.db.GeoFirePingLocations;
      let hazard = { location: { lat: obj[id].l[0], lng: obj[id].l[1] }, userID: allUsers[obj[id].mUserID] };
      res.push(hazard);
    }
    return res;
  }


  listUsers = () => {
    let res = []
    for (var id in this.state.db.Users) {
      let userFirstName = this.state.db.Users[id].mFirstName;
      res.push((<h3 key={userFirstName}>user: {userFirstName}</h3>))
    }
    return res
  }


  render() {
    return (
      <div className="App" >
        <UsersDrawer
          liveLocationHandler={this.liveLocationHandler}
          selectedUserHandler={this.selectedUserHandler}
          refreshHandler={this.fetchAll}
          users={this.state.db.Users} />

        {
          this.state.loading &&
          <Spinner />
        }

        {
          !this.state.loading
          &&
          <MapContainer
            liveTrack={this.state.liveTrack}
            db={this.state.db}
            userID={this.state.selectedUser}
            mapCenter={{ lat: 31.309954, lng: 30.065655 }} />
        }
      </div>
    );
  }
}

export default App;
