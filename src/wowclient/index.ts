import {LogonChallengeClient, LogonChallengeServer, Packet} from "./types";
import * as net from "net";

const DEFAULT_REALM_NAME = 'realm.neverendless-wow.com';
const DEFAULT_AUTH_SERVER_PORT = 3724;
export default class WoWClient {
    credentials: AccountCredentials;
    realm: string;
    realmPort: number;
    socket: net.Socket;

    constructor(credentials: AccountCredentials, realm: string = DEFAULT_REALM_NAME, realmPort: number = DEFAULT_AUTH_SERVER_PORT) {
        this.credentials = credentials;
        this.realm = realm;
        this.realmPort = realmPort;
    }

    login() {
        this.socket = new net.Socket();
        this.socket.on('connect', this.initiateLogin.bind(this));
        this.socket.on('data', this.handleData.bind(this));
        this.socket.on('end', this.handleEnd.bind(this));
        this.socket.on('close', this.handleClose.bind(this));
        this.socket.on('error', this.handleError.bind(this));
        this.socket.connect(this.realmPort, this.realm);
    }

    handleClose() {
        console.log('Connection Closed!');
    }

    handleError() {
        console.log('Error occurred!');

    }

    handleEnd() {
        console.log('Connection Ended!');

    }

    initiateLogin() {
        console.log('Connected!');
        const _packet = new LogonChallengeClient(this.credentials.username);
        this.socket.write(_packet.build());
    }

    handleData(data: Buffer) {
        console.log('Data arrived!');
        const packet = (new LogonChallengeServer()).parsePacket(data);
        console.log(packet);
    }
}



