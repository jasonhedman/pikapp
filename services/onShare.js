import { Share } from "react-native";
import * as firebase from "firebase";

const onShare = async () => {
  try {
    const result = await Share.share({
      message:
        "Join me on PikApp Mobile, the newest way to organize and join pickup sports games.",
      url: "https://apps.apple.com/us/app/pikapp-mobile/id1475855291",
    });

    if (result.action === Share.sharedAction) {
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          points: firebase.firestore.FieldValue.increment(1),
        });
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    alert(error.message);
  }
};

export default onShare;
