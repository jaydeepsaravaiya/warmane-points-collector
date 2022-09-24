import getAccountCredentials from "./accountCredentials";
import WoWClient from "./wowclient";

const accounts = getAccountCredentials();
accounts.forEach(account => {
    const client = new WoWClient(account);
    client.login();
});
