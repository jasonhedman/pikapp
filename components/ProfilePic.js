import React from "react";
import { withTheme, Avatar, IconButton } from "react-native-paper";
import {Block} from 'galio-framework';

const defaultUser = require("../assets/images/defaultUser.jpg")

class ProfilePic extends React.Component{
    constructor(){
        super();
    }
    

    render(){
        colors = this.props.theme.colors;
        return (
            <Block center middle style={{borderRadius:'50%',borderWidth:2,borderColor:this.props.theme.colors.orange,padding:0,backgroundColor:colors.orange}}>
                {
                this.props.proPicUrl != null
                ? <Avatar.Image
                    theme={{colors:{primary:colors.dBlue}}}
                    source={{uri:this.props.proPicUrl}}
                    size={this.props.size}
                />
                : <><Avatar.Image
                        theme={{colors:{primary:colors.dBlue}}}
                        source={defaultUser}
                        size={this.props.size}
                    />
                    {
                        this.props.addEnabled
                        ? <IconButton
                        size={20}
                        color={colors.white}
                        icon='plus'
                        style={{position:'absolute',left:-10,top:-10,backgroundColor:colors.orange}}
                        />
                        : null
                    }
                    </>
                }
            </Block>
        );
        
    }
}

export default withTheme(ProfilePic);