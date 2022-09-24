import {readFileSync} from "fs";

const ACCOUNT_FILE_NAME = 'accounts.txt';

export default function getAccountCredentials(): AccountCredentials[] {
    const lines = readFileSync(ACCOUNT_FILE_NAME, 'utf-8').split('\n');
    return lines.map(line => ({
            username: line.split(':')[0].trim(), password: line.split(':')[1].trim()
        })
    );
}