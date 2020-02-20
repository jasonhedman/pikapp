import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Image
} from 'react-native';
import SlideModal from 'react-native-modal';
import {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapView from 'react-native-map-clustering'
import GameForm from '../components/GameForm';
import LobbyModal from '../components/LobbyModal';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'
import {Notifications} from 'expo';

import {Block} from 'galio-framework';

import {withTheme,Modal,Portal,FAB,Headline,IconButton} from 'react-native-paper';

import * as Location from 'expo-location';

import basketballMarker from '../assets/images/bball_map.png';
import spikeballMarker from '../assets/images/sball_map.png';
import footballMarker from '../assets/images/fball_map.png';
import soccerMarker from '../assets/images/soccer_map.png';
import volleyballMarker from '../assets/images/vball_map.png';

const sportMarkers = {
  basketball: basketballMarker,
  spikeball: spikeballMarker,
  football: footballMarker,
  soccer: soccerMarker,
  volleyball: volleyballMarker
}

const { width, height } = Dimensions.get("screen");

class MapScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        markers:new Array(),
        gameModalVisible:false,
        lobbyModalVisible: false,
        complete:false,
        user: {
          currentGame: null
        },
        userLoc: {},
        modalGameId: "",
        userLoc: null,
        locationEnabled: false,
        focusMarker:null,
    }
  }

  setGameModalVisible = (Visible) => {
    this.setState({gameModalVisible: Visible});
  }

  setLobbyModalVisible = (visible, gameId) => {
    if(gameId != undefined){
      this.setState({lobbyModalVisible: visible, modalGameId:gameId});
    } else {
      this.setState({lobbyModalVisible:visible});
    }
  }

   componentDidMount(){
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).onSnapshot((user) => {
      let userData = user.data();
      userData.id = user.id;
      this.setState({user:userData});
    })
    Location.hasServicesEnabledAsync()
    .then((locationEnabled) => {
      if(locationEnabled == true){
        Location.getCurrentPositionAsync()
          .then((pos) => {
            let region = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }
            this.setState({region, userLoc:pos.coords,locationEnabled:true}, () => {
              Location.watchPositionAsync({},(pos) => {
                this.setState({userPos: pos.coords, complete:true});
              })
              firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
                location:pos.coords
              })
            });
          })
      } else {
        this.setState({locationEnabled:false,complete:true}, () => {
          Location.requestPermissionsAsync()
            .then((permission) => {
              if(permission.status == "granted"){
                this.setState({locationEnabled:true})
              }
            })
        })
      }
    })
    firebase.firestore().collection('games').onSnapshot((docs) => {
      let markers = {};
      docs.forEach((doc) => {
        if(doc.data().gameState == "created" || doc.data().gameState == "inProgress"){
          markers[doc.id] = doc.data();
          markers[doc.id].id = doc.id;
        }
      })
      this.setState({markers:markers,complete:true});
    })
    Notifications.addListener((notification) => {
      if(notification.origin == 'selected'){
        this.props.navigation.navigate('MapScreen');
        this.mapView.animateToRegion({
          longitude: notification.data.game.location.longitude,
          latitude: notification.data.game.location.latitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        })
      } else if (notification.origin == 'received') {
        //show an invite modal
      }

    })
   }

   navToGame = () => {
     this.setGameModalVisible(false);
     this.props.navigation.navigate("Lobby",{new:true});
   }

   addToTeam = (gameId, team) => {
    this.setLobbyModalVisible(false);
    firebase.firestore().collection('games').doc(gameId).get()
      .then(game => {
        firebase.firestore().collection("notifications").add({
          type:'newGame',
          game:game.data(),
          from: this.state.user,
          to: this.state.user.followers,
          action:"joined",
          time: new Date(),
          date: new Date().toDateString(),
        })
          .then(() => {
            if(team == "home") {
              firebase.firestore().collection("games").doc(gameId).update({
                "teams.home": firebase.firestore.FieldValue.arrayUnion({
                  id: firebase.auth().currentUser.uid,
                  name: this.state.user.name,
                  username: this.state.user.username,
                  record: `${this.state.user.wins}-${this.state.user.losses}`,
                  dob:this.state.user.dob
                }),
                updated: new Date()
              })
                .then(() => {
                  firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                    currentGame: gameId
                  })
                  this.props.navigation.navigate("Lobby");
                })
            } else if (team == 'away') {
              firebase.firestore().collection("games").doc(gameId).update({
                "teams.away": firebase.firestore.FieldValue.arrayUnion({
                  id: firebase.auth().currentUser.uid,
                  name: this.state.user.name,
                  username: this.state.user.username,
                  record: `${this.state.user.wins}-${this.state.user.losses}`,
                  dob:this.state.user.dob
                }),
                updated: new Date()
              })
                .then(() => {
                  firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
                    currentGame: gameId
                  })
                    .then(() => {
                      this.props.navigation.navigate("Lobby");                 
                    })
        
                })
            }
          })
      })
   }

   onClusterPress = (cluster) => {
     this.mapView.animateToRegion({
       longitude:cluster.longitude,
       latitude: cluster.latitude,
       longitudeDelta: this.state.region.longitudeDelta / 3,
       latitudeDelta: this.state.region.latitudeDelta / 3,
     },500)
   }

   navToUserProfile = (id) => {
     if(id != firebase.auth().currentUser.uid){
      this.props.navigation.navigate("UserProfile", {userId:id});
     } else {
      this.props.navigation.navigate('Profile')
     }
    }

  render() {
    if(this.props.navigation.getParam("marker",null) != null){
      this.setState({focusMarker:this.props.navigation.getParam("marker",null)}, () => {
        this.props.navigation.navigate('MapScreen',{marker:null});
        this.mapView.animateToRegion({longitude:this.state.focusMarker.longitude,latitude:this.state.focusMarker.latitude, latitudeDelta:this.state.region.latitudeDelta,longitudeDelta:this.state.region.longitudeDelta},500);
      })
    }
    const colors = this.props.theme.colors
    if(this.state.complete == true){
      if(this.state.locationEnabled){
        return (
          <>
            <Portal>
              <Modal contentContainerStyle={{ marginLeft:"auto", marginRight:"auto",width:'100%', padding:32}} visible={this.state.gameModalVisible} onDismiss={() => {this.setGameModalVisible(false)}}>
                <GameForm navToGame={this.navToGame} closeModal={() => this.setGameModalVisible(false)}/>
              </Modal>
            </Portal>
            <SlideModal
              animationType="slide"
              isVisible={this.state.lobbyModalVisible}
              onBackdropPress={() => {this.setState({lobbyModalVisible:false})}}
              backdropOpacity={0}
              coverScreen={false}
              style={{width:width, margin:0,justifyContent:'flex-end'}}
            >
              <LobbyModal closeModal={() => {this.setState({lobbyModalVisible:false})}} navToUserProfile={this.navToUserProfile} userLoc={this.state.userLoc} user={this.state.user} addToTeam={this.addToTeam} marker={this.state.markers[this.state.modalGameId]} />
            </SlideModal>
                <MapView
                  onRegionChangeComplete={(region) => {
                    this.setState({region});
                  }}
                  mapRef={mapView => this.mapView = mapView}
                  customMapStyle={mapStyles}
                  provider={PROVIDER_GOOGLE}
                  style={{flex: 1}}
                  clusterColor = {colors.dBlue}
                  clusterTextColor = {colors.orange}
                  clusterBorderColor = {colors.orange}
                  clusterBorderWidth = {1}
                  initialRegion={this.state.region}
                  showsUserLocation
                  onClusterPress={this.onClusterPress}
              >
              {
                Object.keys(this.state.markers).map((markerId,index) => {
                  let marker = this.state.markers[markerId];
                  return (
                    <Marker
                      key={index}
                      coordinate={{longitude:marker.location.longitude,latitude:marker.location.latitude}}
                      onPress={()=>{this.mapView.animateToRegion({longitude:marker.location.longitude,latitude:marker.location.latitude, latitudeDelta: 0.0922,longitudeDelta: 0.0421},500); this.setLobbyModalVisible(true,marker.id)}}
                    >
                      <Image source={sportMarkers[marker.sport]} style={{height:50, width:50}}/>
                    </Marker>
                  );
                })
              }
            </MapView>
            {
              this.state.lobbyModalVisible
              ? null
              : <Block style={{position:'absolute',bottom:8, right:8}}> 
                  <Block style={{marginLeft:'auto'}}>
                    <IconButton
                      icon='bell'
                      color={colors.dBlue}
                      size={28}
                      style={{backgroundColor:colors.white,margin:0}}
                    />
                    <Block style={{height:.29*(3/2)*28,width:.29*(3/2)*28,borderRadius:'50%',position:'absolute',left:0,top:0,backgroundColor:colors.orange}}></Block>
                  </Block>
                  <FAB
                    icon="plus"
                    label="Create Game"
                    onPress={() => {this.setGameModalVisible(true)}}
                    style={[styles.fab,{backgroundColor:colors.orange,color:colors.white},this.state.user.currentGame != null ? styles.disabled:null]}
                    disabled={this.state.user.currentGame != null}
                  />
                </Block>
              
            }
          </>
        );
      } else {
        return (
          <Block flex center middle style={{width,backgroundColor:colors.dBlue, padding:16}}>
            <Block center middle style={{borderColor:colors.orange, borderWidth:1, borderRadius:8, padding:16}}>
              <Headline style={{color:colors.white,fontSize:20,textAlign:'center'}}>You must have your location enabled to use the map.</Headline>
            </Block>
          </Block>
        )
      }
    } else {
      return (
        <Block style={{height,width,backgroundColor:colors.dBlue}}>

        </Block>
      )
    }
  }
}

const styles = StyleSheet.create({
  disabled: {
    opacity: .3, 
    backgroundColor:'#E68A54'
  },
  fab: {
    marginTop:8,
    zIndex:2
  }
});

const mapStyles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#0b1c26"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ee8141"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#0ab197"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ee8141"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#03070a"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7e7e86"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#7e7f86"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ee8141"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#535359"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#7e7e86"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#aa5d30"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#1b2e3c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default withTheme(MapScreen);