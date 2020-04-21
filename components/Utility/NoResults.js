import React from "react";
import { Block } from "galio-framework";

import onShare from "../../services/onShare";

import { withTheme, Text, Button } from "react-native-paper";

class NoResults extends React.Component {
  render() {
    let colors = this.props.theme.colors;
    return (
      <Block
        column
        center
        middle
        style={[{
          padding: 10,
          width: "100%",
        }, this.props.border ? {borderWidth:1, borderRadius: 8, borderColor: colors.grey } : null]}
      >
        <Text style={{ color: "#fff" }}>No Results</Text>
        {this.props.users ? (
          <Button
            mode='contained'
            dark={true}
            onPress={onShare}
            theme={{
              colors: { primary: colors.orange },
              fonts: { medium: this.props.theme.fonts.regular },
            }}
            compact={true}
            style={{ marginTop: 10 }}
          >
            Invite Friends
          </Button>
        ) : null}
      </Block>
    );
  }
}

export default withTheme(NoResults);
