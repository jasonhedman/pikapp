import React from "react";
import {TouchableOpacity} from 'react-native';
import { Block } from "galio-framework";
import { withTheme, Text } from "react-native-paper";
import ProfilePic from "../Utility/ProfilePic";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class UserPreview extends React.Component {
  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableOpacity onPress={() => this.props.navToUserProfile(this.props.user.id)}>
        <Block middle center style={{ width: 80, paddingHorizontal:5 }}>
          <ProfilePic proPicUrl={this.props.user.proPicUrl} size={60} />
          <Text
            style={{ color: colors.white, textAlign: "center", fontSize:12 }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {this.props.user.username}
          </Text>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(withAuthenticatedUser(UserPreview));
