import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, Avatar } from "react-native-paper";

import firebase from "firebase";
import moment from "moment";

import basketball from "../../assets/images/Basketball.png";
import soccer from "../../assets/images/Soccer.png";
import spikeball from "../../assets/images/Spikeball.png";
import volleyball from "../../assets/images/Volleyball.png";
import football from "../../assets/images/Football.png";

const sports = {
  basketball: basketball,
  soccer: soccer,
  spikeball: spikeball,
  volleyball: volleyball,
  football: football,
};

class GroupPreview extends React.Component {
  constructor() {
    super();
    this.state = {
      mostRecent: {},
      complete: false,
    };
  }

  componentDidMount() {
    const unsubscribe = firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .collection("messages")
      .orderBy("created", "desc")
      .limit(1)
      .onSnapshot((messages) => {
        messages.forEach((message) => {
          this.setState({ mostRecent: message.data(), complete: true });
        });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    moment.updateLocale("en", {
      relativeTime: {
        past: "%s",
        s: "%ds",
        ss: "%ds",
        m: "%dm",
        mm: "%dm",
        h: "%dh",
        hh: "%dh",
        d: "%dd",
        dd: "%dd",
        M: "dM",
        MM: "%dM",
        y: "dY",
        yy: "%dY",
      },
    });
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.navigate("GroupProfile", {
              groupId: this.props.group.id,
              groupTitle: this.props.group.title,
            });
          }}
        >
          <Block
            row
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
              {Object.keys(this.props.group.sports).map((sport, index) => {
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
              <Text style={{ fontSize: 20, marginBottom: 4 }}>
                <Text
                  style={{ color: colors.white, flex: -1 }}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  {this.props.group.title}
                </Text>
                <Text style={{ color: colors.grey, fontSize: 16 }}>{`  •  ${
                  this.props.group.users.length
                } ${
                  this.props.group.users.length == 1 ? "User" : "Users"
                }`}</Text>
              </Text>
              <Block row style={{}}>
                <Text
                  style={{ color: colors.grey, flex: -1 }}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >{`${
                  this.state.mostRecent.senderName != null
                    ? this.state.mostRecent.senderName + ": "
                    : ""
                }${this.state.mostRecent.content}`}</Text>
                <Text style={{ color: colors.grey }}>
                  {" "}
                  •{" "}
                  {moment
                    .unix(parseInt(this.state.mostRecent.created.seconds))
                    .fromNow()}
                </Text>
              </Block>
            </Block>
          </Block>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

export default withTheme(GroupPreview);
