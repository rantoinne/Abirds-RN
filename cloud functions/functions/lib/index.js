'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
admin.initializeApp();
const razorpayKeyId = "rzp_test_g0hxxcmohxmQFN";
const razorpayKeySecret = "oOsL9NLdkCYMbs8npGY9gIzi";
const instance = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.createUser = functions.runWith({ memory: "2GB" }).auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).create({ qrcodes: [], scannedqrs: [], name: "" }).then((value) => { return { result: true }; }).catch((reason) => { return { result: false, error: reason }; });
});
exports.deleteUser = functions.runWith({ memory: "1GB" }).auth.user().onDelete((user) => {
    return admin.firestore().collection('qrcodes').where('access', "array-contains", user.uid).get().then((res) => {
        res.docs.forEach((document) => {
            document.ref.update({ "access": admin.firestore.FieldValue.arrayRemove(user.uid) }).then((val) => {
            }).catch((reason) => console.error(reason.message));
        });
        return admin.firestore().collection('qrcodes').where('belongsTo', "array-contains", user.uid).get().then((res2) => {
            res.docs.forEach((document) => {
                if (document.get('belongsTo').length == 1) {
                    document.ref.delete();
                }
                else {
                    document.ref.update({ "belongsTo": admin.firestore.FieldValue.arrayRemove(user.uid) }).then((val) => { }).catch((reason) => console.error(reason.message));
                }
            });
            return admin.firestore().collection('users').doc(user.uid).delete().then((value) => { return { result: true }; }).catch((reason) => { return { result: false, error: reason }; });
        }).catch((reason) => console.error(reason.message));
    }).catch((reason) => console.error(reason.message));
});
exports.promoteUsers = functions.runWith({ memory: "2GB" }).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    const userId = data.uid;
    const qrId = data.qrId;
    let name = "";
    try {
        const user = yield admin.auth().getUser(userId);
        name = user.displayName;
        yield admin.firestore().collection('qrcodes').doc(qrId).set({ "access": admin.firestore.FieldValue.arrayRemove(userId) }, { merge: true });
        yield admin.firestore().collection('users').doc(userId).set({ "scannedqrs": admin.firestore.FieldValue.arrayRemove(qrId) }, { merge: true });
        yield admin.firestore().collection('qrcodes').doc(qrId).set({ "belongsTo": admin.firestore.FieldValue.arrayUnion(userId) }, { merge: true });
        yield admin.firestore().collection('users').doc(userId).set({ "qrcodes": admin.firestore.FieldValue.arrayUnion(qrId) }, { merge: true });
    }
    catch (e) {
        console.error(e.message);
    }
}));
exports.acceptQRRequest = functions.runWith({ memory: "2GB" }).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    const userId = data.uid;
    const qrId = data.qrId;
    const priv = data.privileged;
    let name = "";
    try {
        const user = yield admin.auth().getUser(userId);
        name = user.displayName;
        yield admin.firestore().collection('qrcodes').doc(qrId).set({ "access": admin.firestore.FieldValue.arrayUnion(userId) }, { merge: true });
        yield admin.firestore().collection('qrcodes').doc(qrId).set({ "requests": admin.firestore.FieldValue.arrayRemove({ userId: userId, name: name }) }, { merge: true });
        if (priv) {
            yield admin.firestore().collection('qrcodes').doc(qrId).set({ "belongsTo": admin.firestore.FieldValue.arrayUnion(userId) }, { merge: true });
            yield admin.firestore().collection('users').doc(userId).set({ "qrcodes": admin.firestore.FieldValue.arrayUnion(qrId) }, { merge: true });
        }
        else
            yield admin.firestore().collection('users').doc(userId).set({ "scannedqrs": admin.firestore.FieldValue.arrayUnion(qrId) }, { merge: true });
    }
    catch (e) {
        console.error(e.message);
    }
}));
exports.addScannedQRCode = functions.runWith({ memory: "2GB" }).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    const userId = context.auth.uid;
    const qrId = data.qrId;
    const permissions = data.permissions;
    try {
        let userObject = yield admin.firestore().collection('users').doc(userId).get();
        if ((userObject.data().qrcodes.indexOf(qrId) > -1)) {
            return { scanned: false, access: false, message: "You are already a member of this QR Code" };
        }
    }
    catch (e) {
        console.error(e.message);
    }
    if (permissions == "belongsTo") {
        return { scanned: false, access: false, message: "Only users with editing permissions are allowed to view this QR Code. To do this, ask the creator of the QR Code to change the permission to Access and then make you an admin after that." };
    }
    else if (permissions == "access") {
        return { scanned: false, access: true, message: "" };
    }
    else if (permissions == "everyone") {
        try {
            yield admin.firestore().collection('qrcodes').doc(qrId).set({ "access": admin.firestore.FieldValue.arrayUnion(userId) }, { merge: true });
            yield admin.firestore().collection('users').doc(userId).set({ "scannedqrs": admin.firestore.FieldValue.arrayUnion(qrId) }, { merge: true });
        }
        catch (e) {
            console.error(e.message);
        }
        return { scanned: true, access: false, message: "Successfully added QR Code" };
    }
    else {
        return { scanned: false, access: false, message: "Invalid permission" };
    }
}));
exports.sendQRRequest = functions.runWith({ memory: "2GB" }).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    const userId = context.auth.uid;
    const qrId = data.qrId;
    let name = "";
    try {
        const user = yield admin.auth().getUser(userId);
        name = user.displayName;
        console.log(name);
        console.log(qrId);
        var result1 = yield admin.firestore().collection('qrcodes').doc(qrId).set({ "requests": admin.firestore.FieldValue.arrayUnion({ userId: userId, name: name }) }, { merge: true });
        console.log(result1);
        return { err: false, errM: "" };
    }
    catch (e) {
        console.error(e.message);
        return { err: true, errM: e.message };
    }
}));
function sendQRsToEmail() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass // generated ethereal password
            }
        });
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"The Switch QR Team" <test@example.com>',
            to: 'liammendes6@gmail.com',
            subject: 'Test Email',
            text: 'Hello world?',
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
exports.createQRCodes = functions.runWith({ memory: "2GB" }).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    const userId = context.auth.uid;
    const purchasedContactCards = data.item_data_contact_cards;
    let errorOccurred = false;
    let newQRs = [];
    try {
        const capture = yield instance.payments.capture(data.payment_id, data.item_data_price);
        console.log("DEBUGCAPTURE: " + capture);
        let iterate = 0;
        yield loop(data.item_data_qr_count, () => __awaiter(this, void 0, void 0, function* () {
            try {
                iterate++;
                const newQR = admin.firestore().collection('qrcodes').doc();
                newQR.set({ access: [userId], belongsTo: [userId], requests: [], fbLink: "", linkedInLink: "", twitterLink: "", personalName: "", phoneNumber: "", homePhoneNumber: "", emailAddress: "", personalAddress: "", website: "", description: "", name: "QR Code " + iterate, permissions: "belongsTo" });
                var docId = (yield newQR.get()).ref.id;
                newQRs.push(docId);
                yield admin.firestore().collection('users').doc(userId).set({ "qrcodes": admin.firestore.FieldValue.arrayUnion(docId) }, { merge: true });
            }
            catch (reason) {
                console.error(reason.message);
                errorOccurred = true;
            }
        }));
        if (errorOccurred) {
            const refundAttempt = yield instance.payments.refund(data.payment_id, { amount: data.item_data_price });
            for (let str in newQRs) {
                admin.firestore().collection('users').doc(userId).set({ "qrcodes": admin.firestore.FieldValue.arrayRemove(str) }, { merge: true });
                admin.firestore().collection('qrcodes').doc(str).delete();
            }
            console.error(refundAttempt);
        }
        sendQRsToEmail();
        return { result: errorOccurred ? false : true, message: errorOccurred ? "Failed to buy QR Codes. An attempt was made to issue a refund. If you have not received a refund yet, contact subhashkatta07@gmail.com" : ("Successfully bought " + data.item_data_qr_count + " QR Codes. " + purchasedContactCards ? "Your contact cards will be shipped to the address provided when you purchased them. " : " " + "If you have made a mistake or need a refund, please contact subhashkatta07@gmail.com") };
    }
    catch (reason) {
        console.error("DEBUGCAPTURE: " + reason.message);
        const refundAttempt = yield instance.payments.refund(data.payment_id, { amount: data.item_data_price });
        console.error(refundAttempt);
        for (let str in newQRs) {
            admin.firestore().collection('users').doc(userId).set({ "qrcodes": admin.firestore.FieldValue.arrayRemove(str) }, { merge: true });
            admin.firestore().collection('qrcodes').doc(str).delete();
        }
        return { result: false, message: "Failed to buy QR Codes. An attempt was made to issue a refund. If you have not received a refund yet, contact subhashkatta07@gmail.com" };
    }
}));
function loop(n, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let numb = n;
            const func = function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield fn();
                        yield loop(--numb, fn);
                    }
                    catch (e) {
                        console.error(e.message);
                    }
                    return 0;
                });
            };
            if (numb != 0) {
                (yield func());
            }
            else {
                return;
            }
        }
        catch (e) {
            console.error(e.message);
        }
    });
}
//# sourceMappingURL=index.js.map