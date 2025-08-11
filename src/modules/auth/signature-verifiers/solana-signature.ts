import { Logger } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import { ISignatureVerifier } from './signature-verifier.interface';

export class SolanaSignatureVerifier implements ISignatureVerifier {
  private static logger = new Logger(SolanaSignatureVerifier.name);
  private constructor() {}
  private static instance: SolanaSignatureVerifier;

  static getInstance(): ISignatureVerifier {
    if (!SolanaSignatureVerifier.instance) {
      SolanaSignatureVerifier.instance = new SolanaSignatureVerifier();
    }
    return SolanaSignatureVerifier.instance;
  }

  /**
   * Verify Solana signature
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param expectedAddress The expected wallet address
   * @returns boolean indicating if signature is valid
   */
  verifySignature(
    message: string,
    signature: string,
    expectedAddress: string,
  ): boolean {
    try {
      const messageBytes = decodeUTF8(message);
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        bs58.decode(signature),
        new anchor.web3.PublicKey(expectedAddress).toBytes(),
      );
      return isValid;
    } catch (error) {
      SolanaSignatureVerifier.logger.error(
        'Solana signature verification failed:',
        error,
      );
      return false;
    }
  }
}
