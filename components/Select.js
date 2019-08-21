import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import ModalDropdown from 'react-native-modal-dropdown';
import { Block, Text } from 'galio-framework';

import Icon from './Icon';
import { argonTheme } from '../constants';

class DropDown extends React.Component {
  state = {
    value:null,
  }

  handleOnSelect = (index, value) => {
    const { onSelect } = this.props;

    this.setState({ value: value });
    onSelect && onSelect(index, value);
  }

  render() {
    const { onSelect, iconName, iconFamily, placeholderText, iconSize, frontIcon, frontIconFamily, iconColor, color, textStyle, style, ...props } = this.props;
    const modalStyles = [
      styles.qty,
      color && { backgroundColor: color },
      style
    ];

    const textStyles = [
      styles.text,
      textStyle
    ];

    return (
      <ModalDropdown
        style={modalStyles}
        onSelect={this.handleOnSelect}
        dropdownStyle={styles.dropdown}
        dropdownTextStyle={{paddingLeft:16, fontSize:14}}
        {...props}>
        <Block flex row middle space="between" height={24}>
          <Block flex row>
            <Icon
              size={16}
              color={argonTheme.COLORS.ICON}
              name={frontIcon}
              family={frontIconFamily}
              style={styles.inputIcons}
            />
            {
              this.state.value == null ?
              <Text size={14} style={styles.placeholder}>{placeholderText}</Text> :
              <Text size={14} style={textStyles}>{this.state.value}</Text>
            }
          </Block>
          <Icon name={iconName || "nav-down"} family={iconFamily || "ArgonExtra"} size={iconSize || 10} color={iconColor || argonTheme.COLORS.BLACK} />
        </Block>
      </ModalDropdown>
    )
  }
}

DropDown.propTypes = {
  onSelect: PropTypes.func,
  iconName: PropTypes.string,
  iconFamily: PropTypes.string,
  iconSize: PropTypes.number,
  color: PropTypes.string,
  textStyle: PropTypes.any,
};

const styles = StyleSheet.create({
  qty: {
    width: '100%',
    backgroundColor: argonTheme.COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom:9.5,
    borderRadius: 4,
  },
  text: {
    color: argonTheme.COLORS.HEADER,
  },
  placeholder: {
    color: argonTheme.COLORS.MUTED
  },
  inputIcons: {
    marginRight: 12
  },
  dropdown: {
    marginTop: 8,
    marginLeft: -16,
    width: 300,
  },
});

export default DropDown;
