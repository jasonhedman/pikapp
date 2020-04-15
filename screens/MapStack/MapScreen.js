import React from "react";
import { Dimensions, StyleSheet, Image, ScrollView } from "react-native";
import SlideModal from "react-native-modal";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as firebase from "firebase";
import firestore from "firebase/firestore";
require("firebase/functions");
const moment = require("moment");
const fetch = require("node-fetch");
import MapViewDirections from "react-native-maps-directions";
import { Block } from "galio-framework";
import {
  withTheme,
  Modal,
  Portal,
  FAB,
  Headline,
  IconButton,
  Menu,
  Text,
  Subheading,
} from "react-native-paper";
import * as Location from "expo-location";

import basketballMarker from "../../assets/images/bball_map.png";
import spikeballMarker from "../../assets/images/sball_map.png";
import footballMarker from "../../assets/images/fball_map.png";
import soccerMarker from "../../assets/images/soccer_map.png";
import volleyballMarker from "../../assets/images/vball_map.png";
import frisbeeMarker from "../../assets/images/frisbee_map.png";

import HeaderBlock from "../../components/Utility/HeaderBlock";
import ChooseLocation from "../../components/Map/ChooseLocation";
import ChooseTime from "../../components/Map/ChooseTime";
import LoadingOverlay from "../../components/Utility/LoadingOverlay";
import GameForm from "../../components/Map/GameForm";
import LobbyModal from "../../components/Map/LobbyModal";

import NewGameNearby from "../../components/Notifications/NewGameNearby";
import NewGame from "../../components/Notifications/NewGame";
import Invite from "../../components/Notifications/Invite";
import Follower from "../../components/Notifications/Follower";
import NewPlayer from "../../components/Notifications/NewPlayer";

const sportMarkers = {
  basketball: basketballMarker,
  spikeball: spikeballMarker,
  football: footballMarker,
  soccer: soccerMarker,
  volleyball: volleyballMarker,
  frisbee: frisbeeMarker,
};

const { width, height } = Dimensions.get("screen");

class MapScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: new Array(),
      gameModalVisible: false,
      lobbyModalVisible: false,
      timeModalVisible: false,
      complete: false,
      user: {},
      userLoc: {},
      modalGameId: "",
      locationEnabled: false,
      menuVisible: false,
      userNotifications: new Array(),
      sport: null,
      intensity: null,
      bringingEquipment: true,
      location: null,
      time: null,
      joinGameLoading: false,
      locationComplete: false,
    };
  }

  setGameModalVisible = visible => {
    this.setState({ gameModalVisible: visible });
  };

  setCreateGameState = (sport, intensity, bringingEquipment) => {
    this.setState({ sport, intensity, bringingEquipment });
  };

  setLobbyModalVisible = (visible, gameId) => {
    if (gameId != undefined) {
      this.setState({ lobbyModalVisible: visible, modalGameId: gameId });
    } else {
      this.setState({ lobbyModalVisible: visible });
    }
  };

  componentDidMount() {
    // firebase.firestore().collection('users').get()
    // .then(users => {
    //   users.forEach(user => {
    //   })
    // })
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot(user => {
          this.setState({ user: user.data() }, () => {
            let notifications = [];
            if (user.data().notifications != undefined) {
              for (let i = user.data().notifications.length - 1; i > -1; i--) {
                notifications.push(
                  firebase
                    .firestore()
                    .collection("notifications")
                    .doc(user.data().notifications[i])
                    .get()
                    .then(doc => {
                      let docData = doc.data();
                      docData.id = doc.id;
                      if (docData.expire !== undefined) {
                        if (
                          moment
                            .unix(parseInt(docData.expire.seconds))
                            .isBefore(moment())
                        ) {
                          this.removeNotification(doc);
                          return null;
                        } else {
                          return docData;
                        }
                      } else {
                        return docData;
                      }
                    })
                );
              }
              Promise.all(notifications).then(nots => {
                nots = nots.filter(val => {
                  return val !== null;
                });
                this.setState({ userNotifications: nots });
              });
            }
          });
        }),
      Location.hasServicesEnabledAsync().then(locationEnabled => {
        this.setState({ locationEnabled });
        if (locationEnabled == true) {
          Location.getCurrentPositionAsync().then(pos => {
            let region = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            };
            this.setState(
              { region, userLoc: pos.coords, locationComplete: true },
              () => {
                Location.watchPositionAsync({}, pos => {
                  this.setState({ userLoc: pos.coords });
                });
                firebase
                  .firestore()
                  .collection("users")
                  .doc(firebase.auth().currentUser.uid)
                  .update({
                    location: pos.coords,
                  });
              }
            );
          });
        } else {
          Location.requestPermissionsAsync().then(permission => {
            if (permission.status == "granted") {
              this.setState({ locationEnabled: true });
            }
          });
        }
      }),
      firebase
        .firestore()
        .collection("games")
        .onSnapshot(docs => {
          let markers = {};
          docs.forEach(doc => {
            if (doc.data().gameState == "created") {
              markers[doc.id] = doc.data();
              markers[doc.id].id = doc.id;
            }
          });
          this.setState({ markers });
        }),
    ]).then(() => {
      this.setState({ complete: true });
    });
  }

  navToGame = () => {
    this.setGameModalVisible(false);
    this.props.navigation.navigate("GameStack");
  };

  addToTeam = gameId => {
    this.setState({ joinGameLoading: true, lobbyModalVisible: false });
    firebase
      .firestore()
      .collection("games")
      .doc(gameId)
      .get()
      .then(game => {
        Promise.all([
          firebase
            .firestore()
            .collection("notifications")
            .add({
              type: "newGame",
              game: game.data(),
              from: this.state.user,
              to: this.state.user.followers,
              action: "joined",
              time: moment().toDate(),
              expire: moment
                .unix(parseInt(game.data().startTime.time.seconds))
                .add(1, "h")
                .toDate(),
            }),
          firebase
            .firestore()
            .collection("notifications")
            .add({
              type: "newPlayer",
              game: game.data(),
              from: this.state.user,
              to: game.data().players,
              action: "joined",
              time: moment().toDate(),
              expire: moment
                .unix(parseInt(game.data().startTime.time.seconds))
                .add(1, "h")
                .toDate(),
            }),
          firebase
            .firestore()
            .collection("games")
            .doc(gameId)
            .update({
              players: firebase.firestore.FieldValue.arrayUnion({
                id: firebase.auth().currentUser.uid,
                name: this.state.user.name,
                username: this.state.user.username,
                dob: this.state.user.dob,
              }),
            }),
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
              calendar: firebase.firestore.FieldValue.arrayUnion(gameId),
            }),
          firebase
            .firestore()
            .collection("games")
            .doc(gameId)
            .collection("messages")
            .add({
              content: `@${this.state.user.username} joined the game`,
              created: new Date(),
              senderId: null,
              senderName: null,
            }),
        ]).then(() => {
          this.setState({ joinGameLoading: false });
          this.props.navigation.navigate("GameStack");
        });
      });
  };

  navToUserProfile = id => {
    if (id != firebase.auth().currentUser.uid) {
      this.props.navigation.navigate("UserProfile", { userId: id });
    } else {
      this.props.navigation.navigate("ProfileStack");
    }
  };

  onMenuDismiss = () => {
    this.setState({ menuVisible: false });
  };

  onFilterDismiss = () => {
    this.setState({ filterVisible: false });
  };

  setMenuVisible = () => {
    this.setState({ menuVisible: true });
  };

  closeMenu = () => {
    this.setState({ menuVisible: false });
  };

  onNewGamePress = notification => {
    this.closeMenu();
    this.mapView.animateToRegion({
      longitude: notification.game.location.longitude,
      latitude: notification.game.location.latitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    this.removeNotification(notification);
  };

  onInvitePress = notification => {
    this.closeMenu();
    this.mapView.animateToRegion({
      longitude: notification.game.location.longitude,
      latitude: notification.game.location.latitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    this.removeNotification(notification);
  };

  onFollowerPress = notification => {
    this.closeMenu();
    this.props.navigation.navigate("UserProfile", {
      userId: notification.from.id,
    });
    this.removeNotification(notification);
  };

  onNewPlayerPress = notification => {
    this.closeMenu();
    this.props.navigation.navigate("GameStack");
    this.removeNotification(notification);
  };

  removeNotification = notification => {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        notifications: firebase.firestore.FieldValue.arrayRemove(
          notification.id
        ),
      });
  };

  switchDirectionsVisible = () => {
    this.setState({ directionsVisible: !this.state.directionsVisible });
  };

  showLocationModal = () => {
    this.setState({ locationModalVisible: true, gameModalVisible: false });
  };

  closeLocationModal = () => {
    this.setState({ locationModalVisible: false, gameModalVisible: true });
  };

  setTimeModalVisible = (timeModalVisible, gameModalVisible) => {
    this.setState({ timeModalVisible, gameModalVisible });
  };

  selectLocation = (name, location) => {
    this.setState(
      {
        locationModalVisible: false,
        location: {
          name: name,
          coordinates: {
            longitude: location.longitude,
            latitude: location.latitude,
          },
        },
      },
      () => {
        this.setGameModalVisible(true);
      }
    );
  };

  selectTime = (time, timeString) => {
    this.setState({ time: { time, timeString } });
    this.setTimeModalVisible(false, true);
  };

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete == true) {
      if (this.state.locationEnabled) {
        return (
          <>
            {this.state.joinGameLoading ? <LoadingOverlay /> : null}
            <Portal>
              <Modal
                contentContainerStyle={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "100%",
                  padding: 32,
                }}
                visible={this.state.gameModalVisible}
                onDismiss={() => {
                  this.setGameModalVisible(false);
                }}
              >
                <GameForm
                  navToGame={this.navToGame}
                  closeModal={() => this.setGameModalVisible(false)}
                  navigate={this.props.navigation.navigate}
                  sport={this.state.sport}
                  intensity={this.state.intensity}
                  bringingEquipment={this.state.bringingEquipment}
                  setCreateGameState={this.setCreateGameState}
                  navToLocationScreen={this.showLocationModal}
                  location={this.state.location}
                  time={this.state.time}
                  setTimeModalVisible={this.setTimeModalVisible}
                />
              </Modal>
            </Portal>
            <SlideModal
              animationType='slide'
              isVisible={this.state.lobbyModalVisible}
              onBackdropPress={() => {
                this.setState({ lobbyModalVisible: false });
              }}
              backdropOpacity={0}
              coverScreen={false}
              style={{ width: width, margin: 0, justifyContent: "flex-end" }}
            >
              <LobbyModal
                closeModal={() => {
                  this.setState({ lobbyModalVisible: false });
                }}
                navToUserProfile={this.navToUserProfile}
                userLoc={this.state.userLoc}
                user={this.state.user}
                addToTeam={this.addToTeam}
                marker={this.state.markers[this.state.modalGameId]}
              />
            </SlideModal>
            <SlideModal
              animationType='slide'
              isVisible={this.state.locationModalVisible}
              onBackdropPress={() => {
                this.closeLocationModal();
              }}
              backdropOpacity={0}
              coverScreen={false}
              style={{ margin: 0, justifyContent: "flex-end", flex: 1 }}
            >
              <ChooseLocation
                selectLocation={this.selectLocation}
                closeModal={this.closeLocationModal}
              />
            </SlideModal>
            <SlideModal
              animationType='slide'
              isVisible={this.state.timeModalVisible}
              onBackdropPress={() => {
                this.setTimeModalVisible(false, true);
              }}
              backdropOpacity={0}
              coverScreen={false}
              style={{ width, margin: 0, justifyContent: "flex-end" }}
            >
              <ChooseTime onPress={this.selectTime} />
            </SlideModal>
            {this.state.locationComplete ? (
              <MapView
                onRegionChangeComplete={region => {
                  this.setState({ region });
                }}
                ref={mapView => (this.mapView = mapView)}
                customMapStyle={mapStyles}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={this.state.region}
                showsUserLocation
              >
                {Object.keys(this.state.markers).map((markerId, index) => {
                  let marker = this.state.markers[markerId];
                  return (
                    <Marker
                      key={index}
                      coordinate={{
                        longitude: marker.location.longitude,
                        latitude: marker.location.latitude,
                      }}
                      onPress={() => {
                        this.mapView.animateToRegion(
                          {
                            longitude: marker.location.longitude,
                            latitude: marker.location.latitude,
                            latitudeDelta: 0.0622,
                            longitudeDelta: 0.0221,
                          },
                          500
                        );
                        this.setLobbyModalVisible(true, marker.id);
                      }}
                    >
                      <Image
                        source={sportMarkers[marker.sport]}
                        style={{ height: 50, width: 50 }}
                      />
                    </Marker>
                  );
                })}
                {this.state.directionsVisible ? (
                  <MapViewDirections
                    origin={this.state.userLoc}
                    destination={this.state.currentGame.location}
                    apikey={"AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE"}
                    strokeWidth={5}
                    strokeColor={colors.orange}
                  />
                ) : null}
              </MapView>
            ) : <Block style={{backgroundColor:colors.dBlue}} flex></Block>}
            {this.state.lobbyModalVisible ? null : (
              <Block style={{ position: "absolute", bottom: 8, right: 8 }}>
                {/* <Block style={{ marginLeft: 'auto', marginBottom: 8 }}>
                    <IconButton
                      icon='directions-fork'
                      color={colors.dBlue}
                      size={28}
                      style={{ backgroundColor: colors.white, margin: 0 }}
                      onPress={this.switchDirectionsVisible}
                    />
                  </Block> */}
                <Block style={{ marginLeft: "auto" }}>
                  <Menu
                    visible={this.state.menuVisible}
                    anchor={
                      <>
                        <IconButton
                          icon='bell'
                          color={colors.dBlue}
                          size={28}
                          style={{ backgroundColor: colors.white, margin: 0 }}
                          onPress={this.setMenuVisible}
                        />
                        {this.state.userNotifications.length > 0 ? (
                          <Block
                            style={{
                              height: 0.29 * (3 / 2) * 28,
                              width: 0.29 * (3 / 2) * 28,
                              borderRadius: "50%",
                              position: "absolute",
                              left: 0,
                              top: 0,
                              backgroundColor: colors.orange,
                            }}
                          ></Block>
                        ) : null}
                      </>
                    }
                    onDismiss={this.onMenuDismiss}
                    contentStyle={{
                      marginBottom: 28 * 1.5 + 8,
                      backgroundColor: colors.dBlue,
                      padding: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: colors.orange,
                      width: width - 16,
                    }}
                  >
                    <HeaderBlock
                      text='Notifications'
                      backButton={true}
                      backPress={this.onMenuDismiss}
                    />
                    <ScrollView style={{ maxHeight: height * 0.5 }}>
                      {this.state.userNotifications.length > 0 ? (
                        this.state.userNotifications.map(
                          (notification, index) => {
                            if (notification.type == "newGame") {
                              return (
                                <NewGame
                                  notification={notification}
                                  action={() =>
                                    this.onNewGamePress(notification)
                                  }
                                  key={index}
                                  navToUserProfile={this.navToUserProfile}
                                  closeMenu={this.closeMenu}
                                />
                              );
                            } else if (notification.type == "invite") {
                              return (
                                <Invite
                                  notification={notification}
                                  action={() =>
                                    this.onInvitePress(notification)
                                  }
                                  key={index}
                                  navToUserProfile={this.navToUserProfile}
                                  closeMenu={this.closeMenu}
                                />
                              );
                            } else if (notification.type == "follower") {
                              return (
                                <Follower
                                  notification={notification}
                                  action={() =>
                                    this.onFollowerPress(notification)
                                  }
                                  key={index}
                                  navToUserProfile={this.navToUserProfile}
                                  closeMenu={this.closeMenu}
                                />
                              );
                            } else if (notification.type == "newPlayer") {
                              return (
                                <NewPlayer
                                  notification={notification}
                                  action={() =>
                                    this.onNewPlayerPress(notification)
                                  }
                                  key={index}
                                  navToUserProfile={this.navToUserProfile}
                                  closeMenu={this.closeMenu}
                                />
                              );
                            } else if (notification.type == "newGameNearby") {
                              return (
                                <NewGameNearby
                                  notification={notification}
                                  action={() =>
                                    this.onNewGamePress(notification)
                                  }
                                  key={index}
                                  navToUserProfile={this.navToUserProfile}
                                  closeMenu={this.closeMenu}
                                />
                              );
                            }
                          }
                        )
                      ) : (
                        <Block
                          row
                          style={{
                            borderWidth: 1,
                            borderColor: colors.orange,
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 12,
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: 50,
                          }}
                        >
                          <Block center middle flex>
                            <Text style={{ color: colors.white }}>
                              No New Notifications
                            </Text>
                          </Block>
                        </Block>
                      )}
                    </ScrollView>
                  </Menu>
                </Block>
                <FAB
                  icon='plus'
                  label='Create Game'
                  onPress={() => {
                    this.setGameModalVisible(true);
                  }}
                  style={[
                    styles.fab,
                    { backgroundColor: colors.orange, color: colors.white },
                  ]}
                />
              </Block>
            )}
          </>
        );
      } else {
        return (
          <Block
            flex
            center
            middle
            style={{ width, backgroundColor: colors.dBlue, padding: 16 }}
          >
            <Block
              center
              middle
              style={{
                borderColor: colors.orange,
                borderWidth: 1,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <Headline
                style={{
                  color: colors.white,
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                You must have your location enabled to use the map.
              </Headline>
            </Block>
          </Block>
        );
      }
    } else {
      return <Block style={{ flex: 1, backgroundColor: colors.dBlue }}></Block>;
    }
  }
}


const styles = StyleSheet.create({
  disabled: {
    opacity: 0.3,
    backgroundColor: "#E68A54",
  },
  fab: {
    marginTop: 8,
    zIndex: 2,
  },
});

const mapStyles = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#0b1c26",
      },
      {
        weight: 1,
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ee8141",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#0ab197",
      },
      {
        weight: 1,
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ee8141",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#03070a",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#7e7e86",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1b1b1b",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#7e7f86",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ee8141",
      },
      {
        weight: 1,
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#535359",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#7e7e86",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#aa5d30",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#1b2e3c",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3d3d3d",
      },
    ],
  },
];

export default withTheme(MapScreen);
