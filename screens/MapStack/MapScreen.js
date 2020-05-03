import React from "react";
import { Dimensions, StyleSheet, Image, ScrollView } from "react-native";
import SlideModal from "react-native-modal";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as firebase from "firebase";
require("firebase/functions");
const moment = require("moment");
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
} from "react-native-paper";
import * as Location from "expo-location";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);

// const mbxTilequery = require("@mapbox/mapbox-sdk/services/tilequery");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// const tilequeryService = mbxTilequery({
//   accessToken:
//     "pk.eyJ1IjoicGlrYXBwLW1vYmlsZSIsImEiOiJjazlmemVzdXUwaWdqM21vYnI3d29mZXBjIn0.W6mkhh3uLBjbhYMBEgRdyQ",
// });
// const geocodingService = mbxGeocoding({
//   accessToken:
//     "pk.eyJ1IjoicGlrYXBwLW1vYmlsZSIsImEiOiJjazlmemVzdXUwaWdqM21vYnI3d29mZXBjIn0.W6mkhh3uLBjbhYMBEgRdyQ",
// });

import basketballMarker from "../../assets/images/bball_map.png";
import spikeballMarker from "../../assets/images/sball_map.png";
import footballMarker from "../../assets/images/fball_map.png";
import soccerMarker from "../../assets/images/soccer_map.png";
import volleyballMarker from "../../assets/images/vball_map.png";
import frisbeeMarker from "../../assets/images/frisbee_map.png";

import basketballLocation from "../../assets/images/basketball-15.png";

import HeaderBlock from "../../components/Utility/HeaderBlock";
import LobbyModal from "../../components/Map/LobbyModal";

import LoadingOverlay from "../../components/Utility/LoadingOverlay";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import trace from "../../services/trace";
import { upsertUserLocation } from "../../repository/activeUserLocations";
import createUser from "../../services/createUser";

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
        trace(this, "constructed component", "constructor");
        this.state = {
            markers: new Array(),
            lobbyModalVisible: false,
            complete: false,
            userLoc: {},
            focusMarker: null,
            locationEnabled: false,
            menuVisible: false,
            userNotifications: new Array(),
            loading: false,
        };
    }

    setLobbyModalVisible = (visible, focusMarker) => {
        this.setState({ lobbyModalVisible: visible, focusMarker });
    };

    componentDidUpdate() {
        if (
            this.props.route.params &&
            this.props.route.params.markerId != this.state.focusMarker
        ) {
            this.mapView &&
                this.mapView.animateToRegion({
                    longitude: this.props.route.params.longitude,
                    latitude: this.props.route.params.latitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            this.setState({
                focusMarker: this.props.route.params.markerId,
                lobbyModalVisible: true,
            });
        }
        return null;
    }

    componentDidMount() {
        trace(this, "mounted component", "componentDidMount");
        // firebase
        //   .firestore()
        //   .collection("users")
        //   .get()
        //   .then((users) => {
        //     users.forEach((user) => {
        //       if(user.data().followers === undefined){
        //         console.log(user.data().username)
        //       }
        //     });
        //   });
        Location.hasServicesEnabledAsync().then((locationEnabled) => {
            if (locationEnabled == true) {
                Location.watchPositionAsync({}, (pos) => {
                    let region = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    };
                    this.setState({
                        region,
                        userLoc: pos.coords,
                        locationEnabled,
                        complete: true,
                    });
                    firebase
                        .firestore()
                        .collection("users")
                        .doc(firebase.auth().currentUser.uid)
                        .update({
                            location: geo.point(
                                pos.coords.latitude,
                                pos.coords.longitude
                            ),
                        });
                    if (this.subscription) {
                        this.subscription.unsubscribe();
                    }
                    const query = geo
                        .query(
                            firebase
                                .firestore()
                                .collection("games")
                                .where("gameState", "==", "created")
                        )
                        .within(
                            geo.point(
                                pos.coords.latitude,
                                pos.coords.longitude
                            ),
                            10,
                            "location"
                        );
                    this.subscription = query.subscribe((markersArray) => {
                        let markers = {};
                        markersArray.forEach((marker) => {
                            markers[marker.id] = marker;
                        });
                        this.setState({ markers });
                    });
                    // tilequeryService
                    //   .listFeatures({
                    //     mapIds: ["mapbox.mapbox-streets-v8"],
                    //     coordinates: [pos.coords.longitude, pos.coords.latitude],
                    //     radius: 100000,
                    //     layers: ['landuse', 'poi_label'],
                    //     limit: 50,
                    //     dedupe: false,
                    //   })
                    //   .send()
                    //   .then((response) => {
                    //     return response.body;
                    //   })
                    //   .then((features) => {
                    //     features.features.forEach((feature, index) => {
                    //       console.log(feature.properties.type, feature.properties.maki, feature.properties.name)
                    //     })
                    //   });
                }).catch((error) => {
                    trace(
                        this,
                        `ERRROR: getting location: ${error}`,
                        "componentDidMount"
                    );
                });
                if (this.props._currentUserProfile.location) {
                    const query = geo
                        .query(
                            firebase
                                .firestore()
                                .collection("games")
                                .where("gameState", "==", "created")
                        )
                        .within(
                            this.props._currentUserProfile.location,
                            10,
                            "location"
                        );
                    this.subscription = query.subscribe((markersArray) => {
                        let markers = {};
                        markersArray.forEach((marker) => {
                            markers[marker.id] = marker;
                        });
                        this.setState({ markers });
                    });
                }
            }
        });
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    addToTeam = (gameId) => {
        this.setState({ loading: true, lobbyModalVisible: false });
        firebase
            .firestore()
            .collection("games")
            .doc(gameId)
            .get()
            .then((game) => {
                Promise.all([
                    firebase
                        .firestore()
                        .collection("notifications")
                        .add({
                            type: "newGame",
                            game: game.data(),
                            from: this.props._currentUserProfile,
                            to: this.props._currentUserProfile.followers,
                            action: "joined",
                            time: moment().toDate(),
                            expire: moment
                                .unix(
                                    parseInt(game.data().startTime.time.seconds)
                                )
                                .add(1, "h")
                                .toDate(),
                        }),
                    firebase
                        .firestore()
                        .collection("notifications")
                        .add({
                            type: "newPlayer",
                            game: game.data(),
                            from: this.props._currentUserProfile,
                            to: game.data().players,
                            action: "joined",
                            time: moment().toDate(),
                            expire: moment
                                .unix(
                                    parseInt(game.data().startTime.time.seconds)
                                )
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
                                name: this.props._currentUserProfile.name,
                                username: this.props._currentUserProfile
                                    .username,
                                dob: this.props._currentUserProfile.dob,
                            }),
                        }),
                    firebase
                        .firestore()
                        .collection("users")
                        .doc(firebase.auth().currentUser.uid)
                        .update({
                            calendar: firebase.firestore.FieldValue.arrayUnion(
                                gameId
                            ),
                        }),
                    firebase
                        .firestore()
                        .collection("games")
                        .doc(gameId)
                        .collection("messages")
                        .add({
                            content: `@${this.props._currentUserProfile.username} joined the game`,
                            created: new Date(),
                            senderId: null,
                            senderName: null,
                        }),
                ]).then(() => {
                    this.setState({ loading: false }, () => {
                        this.props.navigation.navigate("GameStack");
                    });
                });
            });
    };

    navToUserProfile = (id) => {
        if (id != firebase.auth().currentUser.uid) {
            this.props.navigation.navigate("UserProfile", { userId: id });
        }
    };

    onMenuDismiss = () => {
        this.setState({ menuVisible: false });
    };

    setMenuVisible = () => {
        this.setState({ menuVisible: true });
    };

    closeMenu = () => {
        this.setState({ menuVisible: false });
    };

    onNewGamePress = (notification) => {
        this.closeMenu();
        this.mapView.animateToRegion({
            longitude: notification.game.location.geopoint._long,
            latitude: notification.game.location.geopoint._lat,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
        this.removeNotification(notification);
    };

    onInvitePress = (notification) => {
        this.closeMenu();
        this.mapView.animateToRegion({
            longitude: notification.game.location.geopoint._long,
            latitude: notification.game.location.geopoint._lat,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
        this.removeNotification(notification);
    };

    onFollowerPress = (notification) => {
        this.closeMenu();
        this.props.navigation.navigate("UserProfile", {
            userId: notification.from.id,
        });
        this.removeNotification(notification);
    };

    onNewPlayerPress = (notification) => {
        this.closeMenu();
        this.props.navigation.navigate("GameStack");
        this.removeNotification(notification);
    };

    removeNotification = (notification) => {
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

    render() {
        trace(this, "render", "render");
        const colors = this.props.theme.colors;
        if (this.state.complete) {
            if (this.state.locationEnabled) {
                return (
                    <>
                        {this.state.loading ? <LoadingOverlay /> : null}
                        <SlideModal
                            animationType="slide"
                            isVisible={this.state.lobbyModalVisible}
                            onBackdropPress={() => {
                                this.setState({ lobbyModalVisible: false });
                            }}
                            backdropOpacity={0}
                            coverScreen={false}
                            style={{
                                width: width,
                                margin: 0,
                                justifyContent: "flex-end",
                            }}
                        >
                            <LobbyModal
                                closeModal={() => {
                                    this.setState({ lobbyModalVisible: false });
                                }}
                                navToUserProfile={this.navToUserProfile}
                                userLoc={this.state.userLoc}
                                user={this.props._currentUserProfile}
                                addToTeam={this.addToTeam}
                                marker={
                                    this.state.markers[this.state.focusMarker]
                                }
                            />
                        </SlideModal>
                        <MapView
                            onRegionChangeComplete={(region) => {
                                this.setState({ region });
                            }}
                            ref={(mapView) => (this.mapView = mapView)}
                            customMapStyle={mapStyles}
                            provider={PROVIDER_GOOGLE}
                            style={{ flex: 1 }}
                            initialRegion={this.state.region}
                            showsUserLocation
                        >
                            {Object.keys(this.state.markers).map(
                                (markerId, index) => {
                                    let marker = this.state.markers[markerId];
                                    if (
                                        marker.group.id == null ||
                                        this.props._currentUserProfile.groups.includes(
                                            marker.group.id
                                        )
                                    ) {
                                        return (
                                            <Marker
                                                key={index}
                                                coordinate={{
                                                    longitude:
                                                        marker.location.geopoint
                                                            ._long,
                                                    latitude:
                                                        marker.location.geopoint
                                                            ._lat,
                                                }}
                                                onPress={() => {
                                                    this.mapView.animateToRegion(
                                                        {
                                                            longitude:
                                                                marker.location
                                                                    .geopoint
                                                                    ._long,
                                                            latitude:
                                                                marker.location
                                                                    .geopoint
                                                                    ._lat,
                                                            latitudeDelta: 0.0622,
                                                            longitudeDelta: 0.0221,
                                                        },
                                                        500
                                                    );
                                                    this.setLobbyModalVisible(
                                                        true,
                                                        markerId
                                                    );
                                                }}
                                            >
                                                <Image
                                                    source={
                                                        sportMarkers[
                                                            marker.sport
                                                        ]
                                                    }
                                                    style={{
                                                        height: 50,
                                                        width: 50,
                                                    }}
                                                />
                                            </Marker>
                                        );
                                    } else {
                                        return null;
                                    }
                                }
                            )}
                        </MapView>

                        {this.state.lobbyModalVisible ? null : (
                            <Block
                                style={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                }}
                            >
                                {/* <Block style={{ marginLeft: 'auto', marginBottom: 8 }}>
                    <IconButton
                      icon='directions-fork'
                      color={colors.dBlue}
                      size={28}
                      style={{ backgroundColor: colors.white, margin: 0 }}
                      onPress={this.switchDirectionsVisible}
                    />
                  </Block> */}
                                {/* <Block style={{ marginLeft: "auto" }}>
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
                              borderRadius: (0.29 * (3 / 2) * 28) / 2,
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
                </Block> */}
                                <FAB
                                    icon="plus"
                                    label="Create Game"
                                    onPress={() => {
                                        this.props.navigation.navigate(
                                            "GameForm"
                                        );
                                    }}
                                    style={[
                                        styles.fab,
                                        {
                                            backgroundColor: colors.orange,
                                            color: colors.white,
                                        },
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
                        style={{
                            width,
                            backgroundColor: colors.dBlue,
                            padding: 16,
                        }}
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
                                You must have your location enabled to use the
                                map.
                            </Headline>
                        </Block>
                    </Block>
                );
            }
        } else {
            return <Block flex style={{ backgroundColor: colors.dBlue }} />;
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

export default withTheme(withAuthenticatedUser(MapScreen));
