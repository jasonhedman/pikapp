import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, Avatar } from "react-native-paper";

import firebase from "firebase";
import moment from "moment";

import basketball from "../../../assets/images/Basketball.png";
import soccer from "../../../assets/images/Soccer.png";
import spikeball from "../../../assets/images/Spikeball.png";
import volleyball from "../../../assets/images/Volleyball.png";
import football from "../../../assets/images/Football.png";

const sports = {
  basketball: basketball,
  soccer: soccer,
  spikeball: spikeball,
  volleyball: volleyball,
  football: football,
};

class GroupResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mostRecent: {},
      complete: false,
      sports: Object.keys(this.props.group.sports).filter(sport => this.props.group.sports[sport] > 0)
    };
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigate("GroupInfo", {
            groupId: this.props.group.id,
            groupTitle: this.props.group.title,
          });
        }}
      >
        <Block
          row
          middle
          style={{
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors.orange,
            paddingVertical: 10,
            paddingHorizontal: 6,
            marginBottom: 8,
          }}
        >
          <Block center middle row style={{ marginRight: 6 }}>
              {this.state.sports.map((sport, index) => {
                console.log(this.props.group.sports[sport]);
                if (this.props.group.sports[sport] > 0) {
                  return (
                    <Block
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderRadius: "50%",
                        borderColor: colors.orange,
                        padding: 6,
                        backgroundColor: colors.dBlue,
                        marginLeft: index == 0 ? 0 : -18,
                      }}
                    >
                      <Avatar.Image size={24} source={sports[sport]} />
                    </Block>
                  );
                }
              })}
            </Block>
          <Block flex>
            <Text style={{ }}>
              <Text
                style={{ color: colors.white, flex: -1 }}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {this.props.group.title}
              </Text>
              <Text style={{ color: colors.grey, fontSize: 16 }}>{`  •  ${
                this.props.group.users
              } ${this.props.group.users == 1 ? "User" : "Users"}`}</Text>
            </Text>
            <Text style={{ color:colors.grey }}>
              {this.props.group.private ? "Private Group" : "Open Group"}
            </Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(GroupResult);
