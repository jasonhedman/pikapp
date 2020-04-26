import React from "react";
import {
  SafeAreaView,
  Animated,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import { withTheme, TextInput, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { connectSearchBox } from "react-instantsearch-native";

class SocialHeader extends React.Component {
  constructor() {
    super();
    this.state = {
      iconWidth: new Animated.Value(80),
      cancelWidth: new Animated.Value(0),
    };
  }

  onFocus = () => {
    Animated.timing(this.state.iconWidth, {
      toValue: 0,
      duration: 200,
    }).start();
    Animated.timing(this.state.cancelWidth, {
      toValue: 60,
      duration: 200,
    }).start();
  };

  onBlur = () => {
    Animated.timing(this.state.iconWidth, {
      toValue: 80,
      duration: 200,
    }).start();
    Animated.timing(this.state.cancelWidth, {
      toValue: 0,
      duration: 200,
    }).start();
  };

  onSearch = (search) => {
    this.props.onSearch(search);
    this.props.refine(search);
  };

  clearSearch = () => {
    this.props.onSearch("");
  };

  render() {
    let colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ backgroundColor: colors.dBlue }}>
        <Block row middle style={{}}>
          <Block row middle flex>
            <TextInput
              mode={"outlined"}
              theme={{
                colors: {
                  text: colors.white,
                  placeholder: colors.white,
                  underlineColor: colors.orange,
                  selectionColor: colors.orange,
                  primary: colors.orange,
                },
                roundness: "50%",
              }}
              placeholder={"Search"}
              onChangeText={this.onSearch}
              value={this.props.search}
              dense={true}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              style={{ marginBottom: 6, flex: 1 }}
            />
            {this.props.search.length > 0 ? (
              <TouchableOpacity
                style={{ position: "absolute", right: 12 }}
                onPress={this.clearSearch}
              >
                <Icon name='times-circle' size={20} color={colors.white} />
              </TouchableOpacity>
            ) : null}
          </Block>
          <Animated.View
            style={{
              width: this.state.iconWidth,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => {
                this.props.navigate("SocialNotifications");
              }}
            >
              <Icon name='bell' size={20} color={colors.orange} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => {
                this.props.navigate("GroupInvitations");
              }}
            >
              <Icon name='envelope' size={20} color={colors.orange} />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              width: this.state.cancelWidth,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <TouchableOpacity
              onPress={Keyboard.dismiss}
              style={{ padding: 10 }}
            >
              <Text style={{ color: colors.orange, fontFamily: 'ralewayBold' }} numberOfLines={1}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Block>
      </SafeAreaView>
    );
  }
}

export default withTheme(connectSearchBox(SocialHeader));
