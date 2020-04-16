import React from "react";
import { Dimensions } from "react-native";
import { withTheme } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { Block } from "galio-framework";

const { width, height } = Dimensions.get("screen");
import GamePreview from "../../components/Lobby/GamePreview";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GameScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const colors = this.props.theme.colors;
    this.props.navigation.setOptions({
      title: "Games",
    });
    return (
      <Block
        column
        flex
        center
        style={{
          backgroundColor: colors.dBlue,
          width,
          height,
          paddingHorizontal: 16,
        }}
      >
        <ScrollView style={{ width: "100%" }}>
          {this.props._currentUserProfile.calendar.map((game, index) => {
            return (
              <GamePreview
                key={index}
                game={game}
                navigate={this.props.navigation.navigate}
              />
            );
          })}
        </ScrollView>
      </Block>
    );
  }
}

export default withTheme(withAuthenticatedUser(GameScreen));
