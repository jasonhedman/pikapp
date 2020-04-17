import React from "react";
import { withTheme } from "react-native-paper";
import GameScreen from "./GameScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GameLandingScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props._currentUserProfile.calendar.length > 0) {
      return <GameScreen {...this.props}></GameScreen>;
    } else {
      return <LeaderboardScreen {...this.props}></LeaderboardScreen>;
    }
  }
}

export default withTheme(withAuthenticatedUser(GameLandingScreen));
