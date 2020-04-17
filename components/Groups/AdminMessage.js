import React from "react";
import { Block } from "galio-framework";
import { Text, withTheme } from "react-native-paper";

class AdminMessage extends React.Component {
  render() {
    let colors = this.props.theme.colors;
    return (
      <Block center middle style={{ marginBottom: 8, marginTop: 8 }}>
        <Text
          style={{ color: colors.grey, marginLeft: "auto" }}
        >{`${this.props.message.content}`}</Text>
      </Block>
    );
  }
}

export default withTheme(AdminMessage);
