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

  componentDidMount() {
    fetch(
      "https://api.generated.photos/api/v1/faces?api_key=-o9RUblbajTTUQdPqenc9g&age=young-adult&per_page=1&order_by=random&gender=male"
    )
      .then((res) => res.json())
      .then((json) => this.setState({ pic: json.faces[0].urls[4]["512"] }));
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
          borderWidth: 2,
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
          //    this.state.pic == null
          //     ?null
          //    :<Avatar.Image
          //         theme={{colors:{primary:colors.dBlue}}}
          //         source={{uri:this.state.pic}}
          //         size={this.props.size}
          //     />
        }
      </Block>
    );
  }
}

export default withTheme(ProfilePic);
