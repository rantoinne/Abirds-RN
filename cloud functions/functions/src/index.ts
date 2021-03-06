'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import Razorpay = require('razorpay');
admin.initializeApp();

const razorpayKeyId = "rzp_test_g0hxxcmohxmQFN";
const razorpayKeySecret = "oOsL9NLdkCYMbs8npGY9gIzi";

const instance = new Razorpay({key_id: razorpayKeyId, key_secret: razorpayKeySecret});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const createUser = functions.runWith({memory: "2GB"}).auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).create({qrcodes: [], scannedqrs: [], name: ""}).then((value)=>{return {result: true}}).catch((reason)=>{return {result: false, error: reason}});
});

export const deleteUser = functions.runWith({memory: "1GB"}).auth.user().onDelete((user) => {
    return admin.firestore().collection('qrcodes').where('access', "array-contains", user.uid).get().then((res)=>{
        res.docs.forEach((document)=>{
            document.ref.update({"access": admin.firestore.FieldValue.arrayRemove(user.uid)}).then((val)=>{

            }).catch((reason)=>console.error(reason.message));
        });
        return admin.firestore().collection('qrcodes').where('belongsTo', "array-contains", user.uid).get().then((res2)=>{
            res.docs.forEach((document)=>{
                if(document.get('belongsTo').length == 1){
                    document.ref.delete();
                } else {
                    document.ref.update({"belongsTo": admin.firestore.FieldValue.arrayRemove(user.uid)}).then((val)=>{}).catch((reason)=>console.error(reason.message));
                }
            });
            return admin.firestore().collection('users').doc(user.uid).delete().then((value)=>{return {result: true}}).catch((reason)=>{return {result: false, error: reason}});
        }).catch((reason)=>console.error(reason.message));
    }).catch((reason)=>console.error(reason.message));
});

export const promoteUsers = functions.runWith({memory: "2GB"}).https.onCall(async (data, context)=>{
    const userId = data.uid;
    const qrId = data.qrId;
    let name = "";
    try {
        const user = await admin.auth().getUser(userId);
        name = user.displayName;
        await admin.firestore().collection('qrcodes').doc(qrId).set({"access": admin.firestore.FieldValue.arrayRemove(userId)}, {merge: true});
        await admin.firestore().collection('users').doc(userId).set({"scannedqrs": admin.firestore.FieldValue.arrayRemove(qrId)}, {merge: true});
        await admin.firestore().collection('qrcodes').doc(qrId).set({"belongsTo": admin.firestore.FieldValue.arrayUnion(userId)}, {merge: true});
        await admin.firestore().collection('users').doc(userId).set({"qrcodes": admin.firestore.FieldValue.arrayUnion(qrId)}, {merge: true});
    } catch(e){
        console.error(e.message)
    }
});

export const acceptQRRequest = functions.runWith({memory: "2GB"}).https.onCall(async (data, context)=>{
    const userId = data.uid;
    const qrId = data.qrId;
    const priv = data.privileged;
    let name = "";
    try {
        const user = await admin.auth().getUser(userId);
        name = user.displayName;
        await admin.firestore().collection('qrcodes').doc(qrId).set({"access": admin.firestore.FieldValue.arrayUnion(userId)}, {merge: true});
        await admin.firestore().collection('qrcodes').doc(qrId).set({"requests": admin.firestore.FieldValue.arrayRemove({userId: userId, name: name})}, {merge: true});
        if(priv){
            await admin.firestore().collection('qrcodes').doc(qrId).set({"belongsTo": admin.firestore.FieldValue.arrayUnion(userId)}, {merge: true});
            await admin.firestore().collection('users').doc(userId).set({"qrcodes": admin.firestore.FieldValue.arrayUnion(qrId)}, {merge: true});
        } else
        await admin.firestore().collection('users').doc(userId).set({"scannedqrs": admin.firestore.FieldValue.arrayUnion(qrId)}, {merge: true});
    } catch(e){
        console.error(e.message)
    }
});

export const addScannedQRCode = functions.runWith({memory: "2GB"}).https.onCall(async (data, context)=>{
    const userId = context.auth.uid;
    const qrId = data.qrId;
    const permissions = data.permissions;
    try {
        let userObject = await admin.firestore().collection('users').doc(userId).get();
        if(((userObject.data().qrcodes as Array<string>).indexOf(qrId) > -1)){
            return {scanned: false, access: false, message: "You are already a member of this QR Code"};
        }
    } catch(e){
        console.error(e.message);
    }
    if(permissions == "belongsTo"){
        return {scanned: false, access: false, message: "Only users with editing permissions are allowed to view this QR Code. To do this, ask the creator of the QR Code to change the permission to Access and then make you an admin after that."};
    } else if(permissions == "access"){
        return {scanned: false, access: true, message: ""};
    } else if(permissions == "everyone"){
        try {
            await admin.firestore().collection('qrcodes').doc(qrId).set({"access": admin.firestore.FieldValue.arrayUnion(userId)}, {merge: true});
            await admin.firestore().collection('users').doc(userId).set({"scannedqrs": admin.firestore.FieldValue.arrayUnion(qrId)}, {merge: true});
        } catch(e){
            console.error(e.message);
        }
        return {scanned: true, access: false, message: "Successfully added QR Code"};
    } else {
        return {scanned: false, access: false, message: "Invalid permission"};
    }
});

export const sendQRRequest = functions.runWith({memory: "2GB"}).https.onCall(async (data, context)=>{
    const userId = context.auth.uid;
    const qrId = data.qrId;
    let name = "";
    try {
        const user = await admin.auth().getUser(userId);
        name = user.displayName;
        console.log(name);
        console.log(qrId);
        var result1 = await admin.firestore().collection('qrcodes').doc(qrId).set({"requests": admin.firestore.FieldValue.arrayUnion({userId: userId, name: name})}, {merge: true});
        console.log(result1);
        return {err: false, errM: ""};
    } catch(e){
        console.error(e.message);
        return {err: true, errM: e.message};
    }
});

function sendQRsToEmail(){
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"The Switch QR Team" <test@example.com>', // sender address
        to: 'liammendes6@gmail.com', // list of receivers
        subject: 'Test Email', // Subject line
        text: 'Hello world?', // plain text body
        html: '<h1>Hello world?</h1>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
}

export const createQRCodes = functions.runWith({memory: "2GB"}).https.onCall(async (data, context)=>{
    const userId = context.auth.uid;
    const purchasedContactCards = data.item_data_contact_cards;
    let errorOccurred = false;
    let newQRs = [];
    try {
        const capture = await instance.payments.capture(data.payment_id, data.item_data_price);
        console.log("DEBUGCAPTURE: " + capture);
        let iterate = 0;
        await loop(data.item_data_qr_count, async ()=>{
            try {
                iterate++;
                const newQR = admin.firestore().collection('qrcodes').doc();
                newQR.set({access: [userId], belongsTo: [userId], requests: [], fbLink: "", linkedInLink: "", twitterLink: "", personalName: "", phoneNumber: "", homePhoneNumber: "", emailAddress: "", personalAddress: "", website: "", description: "", name: "QR Code " + iterate, permissions: "belongsTo"});
                var docId = (await newQR.get()).ref.id;
                newQRs.push(docId);
                await admin.firestore().collection('users').doc(userId).set({"qrcodes": admin.firestore.FieldValue.arrayUnion(docId)}, {merge: true});
            } catch(reason) {
                console.error(reason.message);
                errorOccurred = true;
            }
        });
        if(errorOccurred){
            const refundAttempt = await instance.payments.refund(data.payment_id, {amount: data.item_data_price});
            for(let str in newQRs){
                admin.firestore().collection('users').doc(userId).set({"qrcodes": admin.firestore.FieldValue.arrayRemove(str)}, {merge: true});
                admin.firestore().collection('qrcodes').doc(str).delete();
            }
            console.error(refundAttempt);
        }
        sendQRsToEmail();
        return {result: errorOccurred? false : true, message: errorOccurred?"Failed to buy QR Codes. An attempt was made to issue a refund. If you have not received a refund yet, contact subhashkatta07@gmail.com":("Successfully bought " + data.item_data_qr_count + " QR Codes. " + purchasedContactCards?"Your contact cards will be shipped to the address provided when you purchased them. ":" " + "If you have made a mistake or need a refund, please contact subhashkatta07@gmail.com")};
    } catch(reason){
        console.error("DEBUGCAPTURE: " + reason.message);
        const refundAttempt = await instance.payments.refund(data.payment_id, {amount: data.item_data_price});
        console.error(refundAttempt);
        for(let str in newQRs){
            admin.firestore().collection('users').doc(userId).set({"qrcodes": admin.firestore.FieldValue.arrayRemove(str)}, {merge: true});
            admin.firestore().collection('qrcodes').doc(str).delete();
        }
        return {result: false, message: "Failed to buy QR Codes. An attempt was made to issue a refund. If you have not received a refund yet, contact subhashkatta07@gmail.com"};
    }
});

async function loop(n, fn) {
    try {
        let numb = n;
        const func = async function(){
            try {
                await fn();
                await loop(--numb, fn);
            } catch(e){
                console.error(e.message);
            }
            return 0;
        };
        if(numb != 0){
            (await func());
        } else {
            return;
        }
    } catch(e){
        console.error(e.message);
    }
}