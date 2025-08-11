import { Logger } from '@nestjs/common';
import { ISignatureVerifier } from './signature-verifier.interface';
import { ethers } from 'ethers';

export class EvmSignatureVerifier implements ISignatureVerifier {
  private static logger = new Logger(EvmSignatureVerifier.name);
  private static instance: EvmSignatureVerifier;
  private constructor() {}

  static getInstance(): ISignatureVerifier {
    if (!EvmSignatureVerifier.instance) {
      EvmSignatureVerifier.instance = new EvmSignatureVerifier();
    }
    return EvmSignatureVerifier.instance;
  }

  /**
   * Verify EVM signature
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
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      EvmSignatureVerifier.logger.error(
        'EVM signature verification failed:',
        error,
      );
      return false;
    }
  }
}
