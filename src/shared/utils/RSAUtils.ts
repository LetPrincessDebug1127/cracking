import * as crypto from 'crypto';
import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

export class RSAUtils {
  static generateRSAKeys(): void{
     const keys = forge.pki.rsa.generateKeyPair(2048);
  const publicKey = forge.pki.publicKeyToPem(keys.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keys.privateKey);

  fs.writeFileSync(path.join(__dirname, '../../../publicKey.pem'), publicKey);
  fs.writeFileSync(path.join(__dirname, '../../../privateKey.pem'), privateKey);

  console.log('Keys generated and saved successfully!');

  }

  static encryptWithPublicKey(data: string, publicKeyPath: string): string {
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');  

  return crypto
    .publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(data)
    )
    .toString('base64');
}

  static decryptWithPrivateKey(data: string, privateKeyPath: string): string {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8'); // Read the private key from the file

    return crypto
      .privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data, 'base64')
      )
      .toString();
  }
}

RSAUtils.generateRSAKeys();
