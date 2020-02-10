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
            <Block center middle style={{width:this.props.size,height:this.props.size,borderRadius:'50%',borderWidth:2,borderColor:this.props.theme.colors.orange}}>
                {
                this.props.proPicUrl != null
                ? <Avatar.Image
                    theme={{colors:{primary:colors.dBlue}}}
                    source={{uri:this.props.proPicUrl}}
                    size={this.props.size-4}
                />
                : <Avatar.Image
                    theme={{colors:{primary:colors.dBlue}}}
                    source={defaultUser}
                    size={this.props.size-4}
                    />
                }
            </Block>
        );
        
    }
}
const styles = StyleSheet.creae

export default withTheme(ProfilePic);