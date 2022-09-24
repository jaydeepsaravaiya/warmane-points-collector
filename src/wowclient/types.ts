import {Buffer} from "node:buffer";

const PROTOCOL_VERSION = 0x8;
const GAME_NAME = 'WoW\x00';
const VERSION: Uint8Array = Uint8Array.from([3, 3, 5]);
const BUILD = 12340;
const PLATFORM = '\x00x86';
const OS = '\x00Win';
const LOCALE = 'enUS';
const WORLD_REGION_BIAS = 330;
const CLIENT_IP = '192.168.100.2';

enum OPCODE {
    CMD_AUTH_LOGON_CHALLENGE,
    CMD_AUTH_LOGON_PROOF,
    CMD_AUTH_RECONNECT_CHALLENGE,
    CMD_AUTH_RECONNECT_PROOF,
    CMD_REALM_LIST
}

export abstract class Packet {
    abstract opcode: number;

    abstract build(): Buffer

    public parsePacket(data: Buffer) {
        const packetId = data.readInt8();
        if (packetId != this.opcode) {
            throw Error('Wrong type of Packet.');
        }
        data.slice(1);
    }
}


export class LogonChallengeClient extends Packet {
    _accountName: string;

    constructor(accountName: string) {
        super();
        this._accountName = accountName;
    }

    build(): Buffer {

        const _buffer = new PacketBuffer();
        _buffer
            .appendStringBE(GAME_NAME)
            .appendByteArray(VERSION)
            .appendShortLE(BUILD)
            .appendStringLE(PLATFORM)
            .appendStringLE(OS)
            .appendStringLE(LOCALE)
            .appendIntLE(WORLD_REGION_BIAS)
            .appendIntBE(ip2int(CLIENT_IP))
            .appendByte(this._accountName.length)
            .appendStringBE(this._accountName.toUpperCase());
        return (new PacketBuffer())
            .appendByte(this.opcode)
            .appendByte(PROTOCOL_VERSION)
            .appendShortLE(_buffer.size())
            .appendPacketBuffer(_buffer)
            ._buffer;
    }

    parsePacket(data: Buffer): Packet {
        return undefined;
    }

    opcode: number = OPCODE.CMD_AUTH_LOGON_CHALLENGE;

}

export class LogonChallengeServer extends Packet {
    build(): Buffer {
        return undefined;
    }

    serverPublicKey: string;
    generatorLength: number;
    generator: number;
    largeSafePrimeLength: number;
    largeSafePrime: string;
    salt: string;
    crcSalt: string;
    twoFactorAuthenticationEnabled: boolean;

    parsePacket(data: Buffer): Packet {
        super.parsePacket(data);
        let offset = 0;
        const opcode = data.readInt8(offset++);
        const protocol_version = data.readInt8(offset++);
        const result = data.readInt8(offset++);
        if (result == 0x00) {
            this.serverPublicKey = data.subarray(offset, offset + 32).toString('hex');
            offset += 32;
            this.generatorLength = data.readInt8(offset++);
            this.generator = data.readInt8(offset++);
            this.largeSafePrimeLength = data.readInt8(offset++);
            this.largeSafePrime = data.subarray(offset, offset + this.largeSafePrimeLength).toString('hex');
            offset += this.largeSafePrimeLength;
            this.salt = data.subarray(offset, offset + 32).toString('hex');
            offset += 32;
            this.crcSalt = data.subarray(offset, offset + 16).toString('hex');
            offset += 16;
            this.twoFactorAuthenticationEnabled = data.readInt8(offset++) !== 0;
            if (this.twoFactorAuthenticationEnabled) {
                console.log('2FA not supported!');
            }
        }
        return this;
    }

    opcode: number = OPCODE.CMD_AUTH_LOGON_CHALLENGE;

}

class PacketBuffer {
    _buffer: Buffer = Buffer.alloc(0);

    appendStringBE(data: string, encoding: BufferEncoding = 'utf-8') {
        this._buffer = Buffer.concat([this._buffer, Buffer.from(data, encoding)]);
        return this;
    }

    appendStringLE(data: string, encoding: BufferEncoding = 'utf-8') {
        this._buffer = Buffer.concat([this._buffer, Buffer.from(data.split('').reverse().join(''), encoding)]);
        return this;
    }

    appendShortBE(short: number) {
        const temp = Buffer.allocUnsafe(2);
        temp.writeUint16BE(short);
        this._buffer = Buffer.concat([this._buffer, temp]);
        return this;
    }

    appendShortLE(short: number) {
        const temp = Buffer.allocUnsafe(2);
        temp.writeUint16LE(short);
        this._buffer = Buffer.concat([this._buffer, temp]);
        return this;
    }

    appendIntBE(integer: number) {
        const temp = Buffer.allocUnsafe(4);
        temp.writeUint32BE(integer);
        this._buffer = Buffer.concat([this._buffer, temp]);
        return this;
    }

    appendIntLE(integer: number) {
        const temp = Buffer.allocUnsafe(4);
        temp.writeUint32LE(integer);
        this._buffer = Buffer.concat([this._buffer, temp]);
        return this;
    }

    appendByte(byte: number) {
        this.appendByteArray(Uint8Array.from([byte % 255]));
        return this;
    }

    appendByteArray(bytes: Uint8Array) {
        this._buffer = Buffer.concat([this._buffer, bytes]);
        return this;
    }

    appendPacketBuffer(buffer: PacketBuffer) {
        this._buffer = Buffer.concat([this._buffer, buffer._buffer]);
        return this;
    }

    size() {
        return this._buffer.length;
    }
}

function ip2int(ip) {
    return ip.split(".").reduce((int, v) => int * 256 + +v)
}

