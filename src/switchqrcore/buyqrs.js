import React, {Component} from 'react';
import {Platform, Text, View, BackHandler, FlatList, StatusBar, NativeModules, StatusBarIOS} from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { Button } from 'react-native-material-buttons';
import Spinner from 'react-native-loading-spinner-overlay';
import firebase from 'react-native-firebase';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const { StatusBarManager } = NativeModules;
import { NavigationActions } from 'react-navigation';
import { PermissionsAndroid } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const createQRCodes = firebase.functions().httpsCallable('createQRCodes');

export default class BuyQRScreen extends Component {

    state = {
        purchaseData: [
          {key: "purchase_1",
        name: "5 QR Codes",
        price: '10000',
        description: "5 Normal QR Codes",
        contactCards: false,
        currency: "INR",
        qrCount: 5},
        {key: "purchase_2",
        name: "5 QR Codes",
        price: '40000',
        description: "5 QR Codes + Contact Cards",
        contactCards: true,
        currency: "INR",
        qrCount: 5},
        {key: "purchase_3",
        name: "10 QR Codes",
        price: '20000',
        description: "10 Normal QR Codes",
        contactCards: false,
        currency: "INR",
        qrCount: 10},
        {key: "purchase_4",
        name: "10 QR Codes",
        price: '60000',
        description: "10 QR Codes + Contact Cards",
        contactCards: true,
        currency: "INR",
        qrCount: 10},
        ],
        loading: false
      };

      componentDidMount() {
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

      requestCameraPermission() {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              'title': 'Cool Photo App Camera Permission',
              'message': 'Cool Photo App needs access to your camera ' +
                         'so you can take awesome pictures.'
            }
          ).then((granted)=>{
            this.setState({CAMERA_PERMS: granted})
            this.scan();
          }, (err) => {
            this.setState({CAMERA_PERMS: false})
            this.scan();
          });
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
            centerElement="Buy QR Codes"
            style={{
              container: {
                backgroundColor: "#000000"
              }
            }}
          />
          {Platform.OS === 'android'?<Spinner visible={this.state.loading} ref={(ref)=>{
            this.ref = ref;
          }} textContent={"Loading..."} textStyle={{color: '#FFFFFF'}}></Spinner>:<View/>}
          <View style={{flex: 1, backgroundColor: "#ffffff"}}> 
            <FlatList data={this.state.purchaseData} extraData={this.state} renderItem={(itemData)=>{
              return <View>
              <Button onPress={() => {
                Platform.OS == 'ios'?console.log('yo'):this.setState({loading: true});
                var options = {
                  description: itemData.item.description,
                  currency: itemData.item.currency,
                  key: 'rzp_test_g0hxxcmohxmQFN',
                  amount: itemData.item.price,
                  name: itemData.item.name,
                  theme: {color: '#000000'}
                }
                RazorpayCheckout.open(options).then((data) => 
                  // handle success
                  createQRCodes({payment_id: data.razorpay_payment_id, item_data_name: itemData.item.name,  item_data_price: itemData.item.price, item_data_currency: itemData.item.currency, item_data_description: itemData.item.description, item_data_qr_count: itemData.item.qrCount, item_data_contact_cards: itemData.item.contactCards}).then((val)=>{
                    if(val.data.result){
                      //Success
                      this.setState({loading: false}, ()=>{
                        alert(val.data.message);
                      });
                    } else {
                      this.setState({loading: false}, ()=>{
                        alert(val.data.message);
                      });
                    }
                  }).catch((reason)=>{
                    this.setState({loading: false}, ()=>{
                      alert(`An error occured: ${reason.message}`);
                    });
                  })
                ).catch((error) => {
                  // handle failure
                  alert(`An error occured: ${error.code} | ${error.description}`);
                });
              }} style={{backgroundColor: "#ffffff"}}>
                <View style={{height: 81, flex: 1, flexDirection: "column"}}>
              <View style={{height: 80, flex: 1, flexDirection: "row"}}>
                <MaterialCommunityIcons name="qrcode" size={48} style={{paddingVertical: 16, paddingHorizontal: 16, color: "#000000"}}></MaterialCommunityIcons>
                <View style={{height: 81, flex: 1, flexDirection: "column", paddingVertical: 16, paddingRight: 16}}>
                  <Text style={{fontSize: 24, fontWeight: "700", color: "#000000"}}>{itemData.item.name}</Text>
                  <Text style={{fontSize: 12, fontWeight: "700",  color: "#000000"}}>{itemData.item.description}</Text>
                </View>
                <View style={{position: "absolute", right: 0}}>
                <View style={{flex: 1, borderRadius: 24, padding: 8, marginTop: 24, marginRight: 16, backgroundColor: "#000000"}}>
                  <Text style={{color: "#FFFFFF", fontWeight: "700", fontSize: 16}}>₹ {itemData.item.price.substring(0, itemData.item.price.length - 2)}</Text>
                </View>
                </View>
              </View>
              <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
            </View>
              </Button>
            </View>;
            }
            }/>
          </View>
          </View>;
      }
    
}