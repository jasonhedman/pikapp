import React from "react";
import { withTheme, Avatar, IconButton } from "react-native-paper";
import { Block } from "galio-framework";
const fetch = require("node-fetch");
const defaultUser = require("../../assets/images/defaultUser.jpg");
import Chance from "chance";

class ProfilePic extends React.Component {
  constructor() {
    super();
    this.state = {
      pic: null,
    };
  }

  render() {
    colors = this.props.theme.colors;
    let chance = new Chance();
    return (
      <Block
        center
        middle
        style={{
          borderRadius: "50%",
          borderWidth: 1,
          borderColor: this.props.theme.colors.orange,
          padding: 0,
          backgroundColor: colors.orange,
        }}
      >
        {
          this.props.proPicUrl != null ? (
            <Avatar.Image
              theme={{ colors: { primary: colors.dBlue } }}
              source={{ uri: this.props.proPicUrl }}
              size={this.props.size}
            />
          ) : (
            <>
              <Avatar.Image
                theme={{ colors: { primary: colors.dBlue } }}
                source={defaultUser}
                size={this.props.size}
              />
              {this.props.addEnabled ? (
                <IconButton
                  size={20}
                  color={colors.white}
                  icon="plus"
                  style={{
                    position: "absolute",
                    left: -10,
                    top: -10,
                    backgroundColor: colors.orange,
                  }}
                />
              ) : null}
            </>
          )
        }
      </Block>
    );
  }
}

export default withTheme(ProfilePic);
