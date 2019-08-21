import React from 'react';
import {TouchableHighlight,Platform} from 'react-native';
import {Block} from 'galio-framework'
import {withTheme,Text} from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

class Notification extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        const colors = this.props.theme.colors
        return (
            <TouchableHighlight onPress={() => this.props.navToMap(this.props.notification.game.location)}>
                <Block row style={{borderWidth:1, borderColor:colors.orange, borderRadius: 8, padding:10,marginBottom:10,alignItems:'center',justifyContent:"space-between"}}>
                    <Block>
                        <Text style={{color:colors.white}}>{`@${this.props.notification.user.username} ${this.props.notification.action} a game`}</Text>
                        <Text style={{color:colors.grey}}>{`${moment.unix(parseInt(this.props.notification.time.seconds)).fromNow()}`}</Text>
                    </Block>
                    <Ionicons name={Platform.OS === 'ios' ? 'ios-arrow-dropright' : 'md-arrow-dropright'} color={colors.orange} size={20} />
                </Block>
            </TouchableHighlight>
            
        )
    }
}

export default withTheme(Notification)