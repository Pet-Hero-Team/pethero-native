import "expo-router/entry";
import { setFirebaseListeners } from "./utils/setFirebaseListeners";
import { setNotifeeListeners } from "./utils/setNotifeeListeners";
import { setPushConfig } from "./utils/setPushConfig";
import { setPushMessageListeners } from "./utils/setPushMessageHandlers";


setPushConfig();
setFirebaseListeners();
setNotifeeListeners();
setPushMessageListeners();