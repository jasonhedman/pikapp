import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { Text, withTheme, Avatar } from "react-native-paper";

class PendingRequestsPreview extends React.Component {
  constructor() {
    super();
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigate("PendingRequests", {
            group: this.props.group,
          });
        }}
      >
        <Block
          style={{
            borderWidth: 1,
            borderColor: colors.grey,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginHorizontal: 8,
          }}
        >
          <Block row middle style={{ justifyContent: "space-between" }}>
            <Text style={{ color: colors.white }}>Pending Requests</Text>
            <Block row>
              <Avatar.Icon icon="circle" size={20} color={colors.orange} />
              <Text style={{ color: colors.white }}>
                {this.props.requests.length}
              </Text>
            </Block>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(PendingRequestsPreview);
