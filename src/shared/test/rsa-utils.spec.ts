import { RSAUtils } from '../utils/RSAUtils';
import * as fs from 'fs';
import * as path from 'path';

describe('RSAUtils', () => {
  const publicKeyPath = path.join(__dirname, '../../../publicKey.pem');
  const privateKeyPath = path.join(__dirname, '../../../privateKey.pem');
  
  beforeAll(() => {
    RSAUtils.generateRSAKeys();
  });

  it('should encrypt and decrypt data correctly', () => {
    const originalData = 'This is a secret message';

    // Encrypt 
    const encryptedData = RSAUtils.encryptWithPublicKey(originalData, publicKeyPath);

    console.log('Encrypted Data:', encryptedData);

    // Decrypt 
    const decryptedData = RSAUtils.decryptWithPrivateKey(encryptedData, privateKeyPath);

    console.log('Decrypted Data:', decryptedData);

    expect(decryptedData).toBe(originalData);
  });
});
