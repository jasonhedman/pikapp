import React from "react";
import { StyleSheet } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, Avatar } from "react-native-paper";

import basketball from "../../assets/images/Basketball.png";
import soccer from "../../assets/images/Soccer.png";
import spikeball from "../../assets/images/Spikeball.png";
import volleyball from "../../assets/images/Volleyball.png";
import football from "../../assets/images/Football.png";
import frisbee from "../../assets/images/Frisbee.png";

const sports = {
  basketball: basketball,
  soccer: soccer,
  spikeball: spikeball,
  volleyball: volleyball,
  football: football,
  frisbee: frisbee,
};

class SportInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <Block row middle style={styles.container}>
        <Block flex row middle>
          <Avatar.Image size={24} source={sports[this.props.sport]} />
          <Block
            flex
            row
            style={{ marginLeft: 12, justifyContent: "space-between" }}
          >
            <Text style={{ color: "#FFF" }}>
              {this.props.sport[0].toUpperCase() +
                this.props.sport.substring(1)}
            </Text>
            <Text style={{ color: "#FFF" }}>{this.props.gamesPlayed}</Text>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#E68A54",
    padding: 8,
    marginBottom: 8,
    width: "100%",
  },
  containerAvailable: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#FFF",
    padding: 16,
    marginBottom: 8,
    width: "100%",
  },
});

export default withTheme(SportInfo);
