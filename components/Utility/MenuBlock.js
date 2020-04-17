import React from "react";
import { Block } from "galio-framework";
import { withTheme, Menu, Button } from "react-native-paper";

class MenuBlock extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let colors = this.props.theme.colors;
    return (
      <Menu
        visible={this.props.visible}
        onDismiss={this.props.onDismiss}
        anchor={
          <Block style={{ marginBottom: 12 }}>
            <Button
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              dark={false}
              icon="menu-down"
              mode="text"
              onPress={this.props.onAnchorPress}
              theme={{
                colors: { primary: colors.white },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
            >
              {this.props.value != null ? this.props.value : this.props.title}
            </Button>
          </Block>
        }
      >
        {this.props.items.map((item, index) => {
          return (
            <Menu.Item
              onPress={() => this.props.onMenuItemPress(item.toLowerCase())}
              title={item}
              theme={{ colors: { text: colors.dBlue } }}
              key={index}
            />
          );
        })}
      </Menu>
    );
  }
}

export default withTheme(MenuBlock);
