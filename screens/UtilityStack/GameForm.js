import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Switch, Text, Button } from "react-native-paper";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import MenuBlock from "../../components/Utility/MenuBlock";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import LoadingOverlay from "../../components/Utility/LoadingOverlay";
import * as firebase from "firebase";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);
import moment from "moment";
import "firebase/firestore";
import trace from "../../services/trace";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GameForm extends React.Component {
  constructor(props) {
    super(props);
    trace(this, "construct component", "constructor");
    this.state = {
      loading: false,
      sport: null,
      intensity: null,
      bringingEquipment: true,
      location: null,
      time: null,
      nearby: new Object(),
      nearbyComplete: false,
      group:
        this.props.route.params != undefined &&
        this.props.route.params.group != undefined
          ? this.props.route.params.group
          : { id: null, title: null },
    };
  }

  componentDidMount() {
    trace(this, "mounted component", "componentDidMount");
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props._currentUserProfile.location, 10, "location");
    query.subscribe((nearby) =>
      this.setState({
        nearby: nearby.filter(
          (user) => user.id != firebase.auth().currentUser.uid
        ),
        nearbyComplete: true,
      })
    );
    if (this.props.route.params != undefined) {
      this.setState({
        location: this.props.route.params.location,
      });
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.route.params != undefined) {
      return {
        location:
          props.route.params.location != undefined
            ? props.route.params.location
            : state.location,
        time:
          props.route.params.time != undefined
            ? {
                time: new Date(props.route.params.time.time),
                timeString: props.route.params.time.timeString,
              }
            : state.time,
      };
    }
    return null;
  }

  onSportMenuClick = (sport) => {
    this.setState({ sport: sport, sportVisible: false });
  };

  onIntensityMenuClick = (intensity) => {
    this.setState({ intensity: intensity, intensityVisible: false });
  };

  onCreate = () => {
    this.setState({ loading: true }, () => {
      firebase
        .firestore()
        .collection("games")
        .add({
          intensity: this.state.intensity,
          location: geo.point(
            this.state.location.coordinates.latitude,
            this.state.location.coordinates.longitude
          ),
          locationName: this.state.location.name,
          sport: this.state.sport,
          ownerId: this.props._currentUserProfile.id,
          owner: this.props._currentUserProfile,
          players: [
            {
              id: firebase.auth().currentUser.uid,
              name: this.props._currentUserProfile.name,
              username: this.props._currentUserProfile.username,
              dob: this.props._currentUserProfile.dob,
            },
          ],
          gameState: "created",
          startTime: this.state.time,
          updated: moment().toDate(),
          time: moment().toDate(),
          equipment: this.state.bringingEquipment
            ? [firebase.auth().currentUser.uid]
            : [],
          group: this.state.group,
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
            firebase.firestore().collection("games").doc(game.id).update({
              id: game.id,
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
                  intensity: this.state.intensity,
                  location: geo.point(
                    this.state.location.coordinates.latitude,
                    this.state.location.coordinates.longitude
                  ),
                  sport: this.state.sport,
                  ownerId: this.props._currentUserProfile.id,
                  owner: this.props._currentUserProfile,
                  gameState: "created",
                },
                action: "created",
                from: this.props._currentUserProfile,
                to: this.props._currentUserProfile.followers,
                time: moment().toDate(),
                expire: moment(this.state.time.time).add(1, "h").toDate(),
              }),
            this.state.group.id != null
              ? firebase
                  .firestore()
                  .collection("groups")
                  .doc(this.state.group.id)
                  .update({
                    calendar: firebase.firestore.FieldValue.arrayUnion(game.id),
                    updated: new Date(),
                  })
              : null,
            this.state.group.id != null
              ? firebase
                  .firestore()
                  .collection("groups")
                  .doc(this.state.group.id)
                  .collection('messages')
                  .add({
                    sender: {username: this.props._currentUserProfile.username, proPicUrl: this.props._currentUserProfile.proPicUrl},
                    senderId: this.props._currentUserProfile.id,
                    type: 'game',
                    gameId: game.id,
                    created: new Date(),
                    content: `@${this.props._currentUserProfile.username} created a game.`
                  })
              : null,
          ]).then(() => {
            this.setState(
              {
                loading: false,
                intensity: null,
                sport: null,
                location: null,
                time: null,
                bringingEquipment: true,
              },
              () => {
                this.props.navigation.goBack();
              }
            );
          });
        });
    });
  };

  render() {
    trace(this, "render component", "render");
    const colors = this.props.theme.colors;
    return (
      <Block flex middle style={{ backgroundColor: colors.dBlue, padding: 16 }}>
        {this.state.loading ? <LoadingOverlay /> : null}
        <Block
          center
          middle
          style={[
            styles.registerContainer,
            { backgroundColor: colors.dBlue, borderColor: colors.orange },
          ]}
        >
          {this.state.group.title != null ? (
            <Text
              style={{
                color: colors.white,
                letterSpacing: 1,
                fontFamily: "ralewayBold",
                marginBottom: 12,
              }}
            >
              Group: {this.props.route.params.group.title}
            </Text>
          ) : null}
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
              onPress={() => this.props.navigation.navigate("ChooseLocation")}
              color='#fff'
              theme={{ dark: true }}
              uppercase={false}
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
              onPress={() => this.props.navigation.navigate("ChooseTime")}
              color='#fff'
              theme={{ dark: true }}
              uppercase={false}
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

export default withTheme(withAuthenticatedUser(GameForm));
