import React from "react";
import { Block } from "galio-framework";
import { withTheme, Text, Button } from "react-native-paper";

class GroupMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block
        style={{
          borderWidth: 1,
          borderColor: colors.grey,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 8,
          marginBottom: 8,
        }}
      >
        <Block row middle style={{ justifyContent: "space-between" }}>
          <Block flex>
            <Text>
              <Text style={{ color: colors.white }}>
                @{this.props.user.username}
              </Text>
              <Text style={{ color: colors.grey }}> joined </Text>
              <Text style={{ color: colors.white }}>
                {this.props.group.title}
              </Text>
            </Text>
          </Block>
          <Block row>
            <Block
              style={{
                borderWidth: 0.5,
                borderRadius: 8,
                borderColor: colors.white,
              }}
            >
              <Button
                mode="text"
                dark={true}
                compact={true}
                color={colors.white}
                labelStyle={{ fontSize: 12 }}
                onPress={() =>
                  this.props.navigate("GroupProfile", {
                    groupId: this.props.group.id,
                  })
                }
                uppercase={false}
              >
                See More
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  }
}

export default withTheme(GroupMember);
