import React, {Component} from 'react';
import {Platform, View, BackHandler, ScrollView, StatusBar, NativeModules, StatusBarIOS, Dimensions, Text, Linking} from 'react-native';
import { Toolbar, Checkbox } from 'react-native-material-ui';
import Spinner from 'react-native-loading-spinner-overlay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { StatusBarManager } = NativeModules;
import { NavigationActions } from 'react-navigation'
import firebase from 'react-native-firebase';
import { TextField } from 'react-native-material-textfield';
import QRCode from 'react-native-qrcode-svg';
import { TextButton, Button } from 'react-native-material-buttons';

export default class ViewQRScreen extends Component {

    state = {
        statusBarHeight: 0,
        qrData: 'lod',
        dbData: {}
      };

      componentWillMount() {
          firebase.firestore().collection('qrcodes').doc(this.props.navigation.getParam('id', 'err')).get().then((value)=>{
            this.setState({dbData: value.data()});
          });
      }
    
      componentDidMount() {
        this.setState({qrData: this.props.navigation.getParam('id', 'err')});
        StatusBar.setBarStyle("light-content")
        if (Platform.OS === 'ios') {
          StatusBarManager.getHeight(response =>
              this.setState({statusBarHeight: response.height})
          )
      
          this.listener = StatusBarIOS.addListener('statusBarFrameWillChange',
            (statusBarData) =>
              this.setState({statusBarHeight: statusBarData.frame.height})
          )
        } else {
          StatusBar.setBackgroundColor("#000000");
        }
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      }
    
      componentWillUnmount() {
        if (Platform.OS === 'ios' && this.listener) {
          this.listener.remove()
        }
        if(Platform.OS == 'android') {
          StatusBar.setBackgroundColor("#000000");
          StatusBar.setBarStyle("light-content");
      }
        else StatusBar.setBarStyle("light-content");
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
      }
    
      handleBackButton() {
        return true;
      }
    
      signOut(){
          firebase.auth().signOut();
          this.props.navigation.navigate("Login");
      }
    
      render() {
        return <View style={{flex: 1, backgroundColor: Platform.OS == 'android' ? "#FFFFFF" : "#000000", paddingTop: Platform.OS === 'ios' ? this.state.statusBarHeight : 0}}>
          <Toolbar
            leftElement="arrow-back"
            onLeftElementPress={()=>{    
                const backAction = NavigationActions.back({
                    key: null
                });
                
                this.props.navigation.dispatch(backAction);
            }}
            centerElement="View QR Code"
            style={{
              container: {
                backgroundColor: "#000000"
              }
            }}
          />
          <Spinner visible={this.state.qrData == 'lod'} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}} />
          <View style={{flex: 1, backgroundColor: "#ffffff"}}> 
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                {this.state.qrData == "lod"?<View/>:this.state.qrData == "err"?<View>
                    <Text>Error</Text>
                </View>:<View>
                    <View style={{paddingHorizontal: 40,paddingBottom: 0}}>
                    <Text style={{fontWeight: "700", color: "#000000", fontSize: 24, marginVertical: 16, marginBottom: 0}}>{this.state.dbData.name}</Text>
                    <Text style={{fontSize: 16, marginVertical: 16, marginTop: 0}}>{this.state.dbData.description}</Text>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                    <Button style={{backgroundColor: "#FFFFFF"}} onPress={()=>{
                        if(this.state.dbData.twitterLink == ""){ alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid"); return; }
                        Linking.canOpenURL(this.state.dbData.fbLink).then((canOpen)=>{
                            canOpen?Linking.openURL(this.state.dbData.fbLink):alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        }).catch((e)=>{
                            alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        });
                    }}>
            <View style={{height: 73, flex: 1, flexDirection: "column"}}>
              <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                <View style={{height: 32, width: 32, margin: 20}}>
                  <MaterialCommunityIcons name="facebook-box" size={32} color="#000000"></MaterialCommunityIcons>
                </View>
                <View style={{paddingTop: 26, paddingBottom: 26, flex: 1}}>
                  <Text style={{fontSize: 16, fontWeight: "700", color: "#000000"}}>{"Facebook Link"}</Text>
                </View>
                <View style={{height: 32, width: 32, margin: 20, paddingBottom: 4, paddingTop: 4, paddingLeft: 4, paddingRight: 4}}>
                  <MaterialIcons name="link" size={24} color="#000000"></MaterialIcons>
                </View>
              </View>
              <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
            </View>
          </Button>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                    <Button style={{backgroundColor: "#FFFFFF"}} onPress={()=>{
                        if(this.state.dbData.twitterLink == ""){ alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid"); return; }
                        Linking.canOpenURL(this.state.dbData.linkedInLink).then((canOpen)=>{
                            canOpen?Linking.openURL(this.state.dbData.linkedInLink):alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        }).catch((e)=>{
                            alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        });
                    }}>
                        <View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialCommunityIcons name="linkedin-box" size={32} color="#000000"></MaterialCommunityIcons>
                            </View>
                            <View style={{paddingTop: 26, paddingBottom: 26, flex: 1}}>
                            <Text style={{fontSize: 16, fontWeight: "700", color: "#000000"}}>{"LinkedIn Link"}</Text>
                            </View>
                            <View style={{height: 32, width: 32, margin: 20, paddingBottom: 4, paddingTop: 4, paddingLeft: 4, paddingRight: 4}}>
                            <MaterialIcons name="link" size={24} color="#000000"></MaterialIcons>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </Button>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}>
                    <Button style={{backgroundColor: "#FFFFFF"}} onPress={()=>{
                        if(this.state.dbData.twitterLink == ""){ alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid"); return; }
                        Linking.canOpenURL(this.state.dbData.twitterLink).then((canOpen)=>{
                            canOpen?Linking.openURL(this.state.dbData.twitterLink):alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        }).catch((e)=>{
                            alert("Cannot open this link. Ask the creator of this QR Code to change the link and make it valid");
                        });
                    }}>
                        <View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialCommunityIcons name="twitter-box" size={32} color="#000000"></MaterialCommunityIcons>
                            </View>
                            <View style={{paddingTop: 26, paddingBottom: 26, flex: 1}}>
                            <Text style={{fontSize: 16, fontWeight: "700", color: "#000000"}}>{"Twitter Link"}</Text>
                            </View>
                            <View style={{height: 32, width: 32, margin: 20, paddingBottom: 4, paddingTop: 4, paddingLeft: 4, paddingRight: 4}}>
                            <MaterialIcons name="link" size={24} color="#000000"></MaterialIcons>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </Button>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialIcons name="person" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Name"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.personalName}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialIcons name="phone" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Phone Number"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.phoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialIcons name="phone" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Home Phone Number"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.homePhoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialIcons name="phone" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Email Address"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.emailAddress}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{flex: 1, flexDirection: "column"}}>
                        <View style={{flex: 1, flexDirection: "row"}}>
                            <View style={{width: 32, margin: 20}}>
                            <MaterialIcons name="phone" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Personal Address"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.personalAddress}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 40, paddingBottom: 0}}><View style={{height: 73, flex: 1, flexDirection: "column"}}>
                        <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                            <View style={{height: 32, width: 32, margin: 20}}>
                            <MaterialIcons name="phone" size={32} color="#000000"></MaterialIcons>
                            </View>
                            <View style={{paddingTop: 12, paddingBottom: 16, flex: 1}}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: "#000000"}}>{"Website"}</Text>
                            <Text style={{fontSize: 16}}>{this.state.dbData.website}</Text>
                            </View>
                        </View>
                        <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
                        </View>
                    </View>
                </View>}
            </ScrollView>
          </View>
          </View>;
      }
    
}