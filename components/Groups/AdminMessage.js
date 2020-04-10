import React from 'react';
import {StyleSheet,TouchableOpacity} from 'react-native';
import { Block } from 'galio-framework';
import HeaderBlock from '../Utility/HeaderBlock';
import { Subheading, Text, withTheme } from 'react-native-paper';
import ProfilePic from '../Utility/ProfilePic';
import firebase from 'firebase';

class AdminMessage extends React.Component{
    render(){
        let colors = this.props.theme.colors
        return (
            <Block center middle style={{marginBottom:8,marginTop:8}}>
                <Text style={{color:colors.grey,marginLeft:'auto'}}>{`${this.props.message.content}`}</Text>
            </Block>
        )
        
    }
}

export default withTheme(AdminMessage);