import React from 'react';
import {TouchableHighlight,Dimensions,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework'
import {withTheme,Text, Button} from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

const {height, width} = Dimensions.get('window');

class NewGame extends React.Component{

    constructor(props){
        super(props);
    }

    onNamePress = () => {
        this.props.closeMenu();
        this.props.navToUserProfile(this.props.notification.from.id)
    }

    render(){
        const colors = this.props.theme.colors
        return (
            <TouchableHighlight onPress={this.props.onPress}>
                <Block row style={{borderWidth:1, borderColor:colors.orange, borderRadius: 8, padding:10,marginBottom:12,alignItems:'center',justifyContent:"space-between"}}>
                    <Block flex>
                        <Text onPress={this.onNamePress}>
                            <Text style={{color:colors.white}}>
                            {`${this.props.notification.from.name} (@${this.props.notification.from.username}) `}
                            </Text>
                            <Text style={{color:colors.white}}>{`${this.props.notification.action} a game  `}</Text>
                            <Text style={{color:colors.grey}}>{`${moment.unix(parseInt(this.props.notification.time.seconds)).fromNow()}`}</Text>
                        </Text>
                    </Block>
                    <Button 
                        mode="contained"
                        compact={true}
                        onPress={this.props.action} 
                        theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                        disabled={this.props.disabled}
                        style={{marginLeft:8}}
                    >
                        View
                    </Button>
                </Block>
            </TouchableHighlight>
            
        )
    }
}

export default withTheme(NewGame)