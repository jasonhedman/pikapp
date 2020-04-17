import React from "react";

import { Block } from "galio-framework";

import { StyleSheet, TouchableOpacity } from "react-native";

import { withTheme, Text, Subheading } from "react-native-paper";

class GameResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      home: new Array(),
      away: new Array(),
      userId: null,
      players: new Array(),
    };
  }

  componentDidMount() {
    this.setState({
      players: this.props.game.players,
      userId: this.props.user,
    });
  }

  render() {
    return (
      <Block column style={{}}>
        <Subheading
          style={{ textAlign: "center", color: "white" }}
          theme={{ fonts: { medium: this.props.theme.fonts.regular } }}
        >{`${
          this.props.game.intensity[0].toUpperCase() +
          this.props.game.intensity.substring(1)
        } ${this.props.game.sport[0].toUpperCase()}${this.props.game.sport.substring(
          1
        )}`}</Subheading>
        <Block
          row
          style={{ flexWrap: "wrap", alignItem: "flex-start", marginBottom: 8 }}
        >
          {this.state.players.map((player, index) => {
            return (
              <Block key={index} style={styles.userContainer}>
                <TouchableOpacity
                  onPress={() => this.props.navToUserProfile(player.id)}
                >
                  <Block
                    column
                    middle
                    style={
                      player.id == this.state.userId
                        ? styles.currentUser
                        : styles.otherUser
                    }
                    key={index}
                  >
                    <Text style={{ color: "white" }}>{player.name}</Text>
                    <Text style={{ color: "white" }}>@{player.username}</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            );
          })}
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  currentUser: {
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: "#E68A54",
    padding: 8,
  },
  otherUser: {
    borderWidth: 0.5,
    borderRadius: 8,
    borderColor: "#83838A",
    padding: 8,
  },
  userContainer: {
    flexBasis: "50%",
    padding: 8,
    paddingBottom: 0,
    color: "white",
  },
});

export default withTheme(GameResult);
