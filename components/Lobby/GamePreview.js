import React from 'react';
import {TouchableOpacity} from 'react-native'
import { Block } from 'galio-framework';
import {withTheme,Text, Subheading, Title} from 'react-native-paper'
import firebase from 'firebase';
import 'firebase/firestore';

class GamePreview extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            game: {},
            complete: false
        }
    }

    componentDidMount(){
        firebase.firestore().collection('games').doc(this.props.game).onSnapshot((game) => {
            this.setState({game:game.data(),complete:true});
        })
    }

    render(){
        const colors = this.props.theme.colors;
        if(this.state.complete){
            return (
                <TouchableOpacity onPress={() => {this.props.navigate("GameLobby",{gameId:this.props.game})}}>
                    <Block column style={{width:'100%',borderWidth:1, borderRadius:8, borderColor:colors.orange,padding: 16, marginBottom:16}}>
                        <Block column middle>
                            <Title style={{color:'white'}}>{`${this.state.game.intensity[0].toUpperCase() + this.state.game.intensity.substring(1)} ${this.state.game.sport[0].toUpperCase() + this.state.game.sport.substring(1)}`}</Title>
                            <Text style={{ color: colors.grey, marginBottom:2}} theme={{fonts:{medium:this.props.theme.fonts.regular}}}>{`Owner: @${this.state.game.owner.username}`}</Text>
                            <Text style={{ color: colors.grey, marginBottom:2}} theme={{fonts:{medium:this.props.theme.fonts.regular}}}>{`Time: ${this.state.game.startTime.timeString}`}</Text>
                            <Text style={{ color: colors.grey, marginBottom:8}} theme={{fonts:{medium:this.props.theme.fonts.regular}}}>{`Location: ${this.state.game.locationName}`}</Text>
                        </Block>
                        <Block row style={{width:"100%", flexWrap:"wrap"}}>
                            {
                                this.state.game.players.map((player, index) => {
                                    return (
                                        <Block style={{flexBasis:'50%',padding:2}} key={index}>
                                            <Block row center middle style={{borderColor:firebase.auth().currentUser.uid == player.id ? colors.orange: colors.white,borderRadius:8,borderWidth:1,padding:8}}>
                                                <Block flex column>
                                                    <Text style={{color:colors.white}}>{player.name}</Text>
                                                    <Text style={{color:colors.white}}>@{player.username}</Text>
                                                </Block>
                                            </Block>
                                        </Block>
                                    )
                                })
                            }
                        </Block>
                    </Block>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    }
}

export default withTheme(GamePreview);