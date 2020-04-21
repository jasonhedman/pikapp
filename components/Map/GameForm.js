import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Switch, Text, Button } from "react-native-paper";
import HeaderBlock from "../Utility/HeaderBlock";
import MenuBlock from "../Utility/MenuBlock";
import ButtonBlock from "../Utility/ButtonBlock";
import LoadingOverlay from "../Utility/LoadingOverlay";
import * as firebase from "firebase";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);
import moment from "moment";
import "firebase/firestore";

class GameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:false,
      sport: this.props.sport,
      intensity: this.props.intensity,
      bringingEquipment: this.props.bringingEquipment,
      locationModalVisible: false,
      location: this.props.location,
      time: this.props.time,
      nearby: new Object(),
      nearbyComplete: false,
    };
  }

  componentDidMount() {
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props.currentUserProfile.location, 10, "location");
    query.subscribe((nearby) =>
      this.setState({
        nearby: nearby.filter(
          (user) => user.id != firebase.auth().currentUser.uid
        ),
        nearbyComplete: true,
      })
    );
  }

  onSportMenuClick = (sport) => {
    this.props.setCreateGameState(
      sport,
      this.state.intensity,
      this.state.bringingEquipment
    );
    this.setState({ sport: sport, sportVisible: false });
  };

  onIntensityMenuClick = (intensity) => {
    this.props.setCreateGameState(
      this.state.sport,
      intensity,
      this.state.bringingEquipment
    );
    this.setState({ intensity: intensity, intensityVisible: false });
  };

  onCreate = () => {
    this.props.setLoading(true, () => {
      let equipment = this.state.bringingEquipment
      ? [firebase.auth().currentUser.uid]
      : [];
    firebase
      .firestore()
      .collection("games")
      .add({
        intensity: this.props.intensity,
        location: geo.point(
          this.props.location.coordinates.latitude,
          this.props.location.coordinates.longitude
        ),
        locationName: this.props.location.name,
        sport: this.props.sport,
        ownerId: this.props.currentUserProfile.id,
        owner: this.props.currentUserProfile,
        players: [
          {
            id: firebase.auth().currentUser.uid,
            name: this.props.currentUserProfile.name,
            username: this.props.currentUserProfile.username,
            dob: this.props.currentUserProfile.dob,
          },
        ],
        gameState: "created",
        startTime: this.props.time,
        updated: moment().toDate(),
        time: moment().toDate(),
        equipment: equipment,
      })
      .then((game) => {
        Promise.all([
          firebase
            .firestore()
            .collection("games")
            .doc(game.id)
            .collection("messages")
            .doc()
            .set({
              content: "Game Created",
              type: "admin",
              created: new Date(),
              senderId: null,
              senderName: null,
            }),
          firebase
            .firestore()
            .collection("games")
            .doc(game.id)
            .update({
              id:game.id
            }),
          firebase
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
              calendar: firebase.firestore.FieldValue.arrayUnion(game.id),
            }),
          firebase
            .firestore()
            .collection("notifications")
            .add({
              type: "newGame",
              game: {
                intensity: this.props.intensity,
                location: geo.point(
                  this.props.location.coordinates.latitude,
                  this.props.location.coordinates.longitude
                ),
                sport: this.props.sport,
                ownerId: this.props.currentUserProfile.id,
                owner: this.props.currentUserProfile,
                gameState: "created",
              },
              action: "created",
              from: this.props.currentUserProfile,
              to: this.props.currentUserProfile.followers,
              time: moment().toDate(),
              expire: moment(this.props.time.time).add(1, "h").toDate(),
            }),
          // firebase.firestore().collection('notifications').add({
          //   type: 'newGameNearby',
          //   game: {
          //     intensity: this.props.intensity,
          //location: geo.point(this.props.location.coordinates.latitude, this.props.location.coordinates.longitude),          //     sport:this.props.sport,
          //     ownerId: this.props.currentUserProfile.id,
          //     owner: this.props.currentUserProfile,
          //     gameState: "created"
          //   },
          //   action:"created",
          //   from:this.props.currentUserProfile,
          //   to: Object.keys(this.state.nearby),
          //   time: moment().toDate(),
          //   expire: moment(this.props.time.time).add(1, 'h').toDate()
          // })
        ]).then(() => {
          this.props.setLoading(false, () => {
            this.props.navToGame();
          })
        });
      });
    })
  };

  render() {
    const colors = this.props.theme.colors;
    return (
        <Block
          center
          middle
          style={[
            styles.registerContainer,
            { backgroundColor: colors.dBlue, borderColor: colors.orange },
          ]}
        >
          <HeaderBlock
            text='Create Game'
            backButton={true}
            backPress={this.props.closeModal}
          />
          <MenuBlock
            visible={this.state.sportVisible}
            onDismiss={() => this.setState({ sportVisible: false })}
            value={this.state.sport}
            title='Sport'
            items={[
              "Basketball",
              "Soccer",
              "Spikeball",
              "Football",
              "Volleyball",
              "Frisbee",
            ]}
            onAnchorPress={() => this.setState({ sportVisible: true })}
            onMenuItemPress={this.onSportMenuClick}
          />
          <MenuBlock
            visible={this.state.intensityVisible}
            onDismiss={() => this.setState({ intensityVisible: false })}
            value={this.state.intensity}
            title='Intensity'
            items={["Casual", "Competitive"]}
            onAnchorPress={() => this.setState({ intensityVisible: true })}
            onMenuItemPress={this.onIntensityMenuClick}
          />
          <Block
            style={{
              borderWidth: 0.5,
              borderColor: "white",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Button
              icon='map-search-outline'
              mode='text'
              onPress={() => this.props.navToLocationScreen()}
              color='#fff'
              theme={{ dark: true }}
            >
              {this.state.location != null
                ? this.state.location.name
                : "Choose Location"}
            </Button>
          </Block>
          <Block
            style={{
              borderWidth: 0.5,
              borderColor: "white",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Button
              icon='clock-outline'
              mode='text'
              onPress={() => this.props.setTimeModalVisible(true)}
              color='#fff'
              theme={{ dark: true }}
            >
              {this.state.time != null
                ? this.state.time.timeString
                : "Choose Time"}
            </Button>
          </Block>
          <Block center middle>
            <Switch
              value={this.state.bringingEquipment}
              onValueChange={() => {
                this.props.setCreateGameState(
                  this.state.sport,
                  this.state.intensity,
                  !this.state.bringingEquipment
                );
                this.setState({
                  bringingEquipment: !this.state.bringingEquipment,
                });
              }}
              color={colors.orange}
              style={{ marginBottom: 8 }}
            />
            <Text style={{ color: "#fff", marginBottom: 8 }}>
              {this.state.bringingEquipment
                ? "I am providing equipment"
                : "I am not providing equipment"}
            </Text>
          </Block>

          <ButtonBlock
            text='Create Game'
            onPress={this.onCreate}
            disabled={
              this.state.sport == null ||
              this.state.intensity == null ||
              this.state.location == null ||
              this.state.time == null
            }
            disabledStyles={{ opacity: 0.3, backgroundColor: colors.orange }}
          />
        </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 2,
    padding: 16,
  },
});

export default withTheme(GameForm);
