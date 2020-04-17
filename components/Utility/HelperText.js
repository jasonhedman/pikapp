import React from "react";
import { withTheme, HelperText } from "react-native-paper";

class HelperTextComp extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return this.props.visible ? (
      <HelperText
        type="error"
        visible={this.props.visible}
        theme={{ colors: { error: colors.orange } }}
        style={
          this.props.visible ? [{}, this.props.styles] : { display: "none" }
        }
      >
        {this.props.text}
      </HelperText>
    ) : null;
  }
}

export default withTheme(HelperTextComp);
