import React from "react";
import {StyleSheet} from 'react-native';
import { withTheme, Avatar } from "react-native-paper";
import {Block} from 'galio-framework';

const defaultUser = require("../assets/images/defaultUser.jpg")

class ProfilePic extends React.Component{
    constructor(){
        super();
    }
    

    render(){
        colors = this.props.theme.colors;
        return (
            <Block center middle style={{borderRadius:'50%',borderWidth:3,borderColor:this.props.theme.colors.orange,padding:0,backgroundColor:colors.orange}}>
                {
                this.props.proPicUrl != null
                ? <Avatar.Image
                    theme={{colors:{primary:colors.dBlue}}}
                    source={{uri:this.props.proPicUrl}}
                    size={this.props.size}
                />
                : <Avatar.Image
                    theme={{colors:{primary:colors.dBlue}}}
                    source={defaultUser}
                    size={this.props.size}
                    />
                }
            </Block>
        );
        
    }
}

export default withTheme(ProfilePic);