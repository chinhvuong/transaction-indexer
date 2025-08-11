import { ISignatureVerifier } from './signature-verifier.interface';
import { SolanaSignatureVerifier } from './solana-signature';
import { EvmSignatureVerifier } from './evm-signature';
import { CHAIN_TYPE } from '@/modules/users/entities/user.entity';

export class SignatureVerifierFactory {
  /**
   * Get the appropriate signature verifier for the given wallet type
   * @param walletType The type of wallet (solana, evm, polkadot, etc.)
   * @returns ISignatureVerifier instance
   */
  static getVerifier(walletType: CHAIN_TYPE): ISignatureVerifier {
    switch (walletType) {
      case CHAIN_TYPE.SOLANA:
        return SolanaSignatureVerifier.getInstance();
      case CHAIN_TYPE.EVM:
        return EvmSignatureVerifier.getInstance();
      default:
        // This ensures exhaustive checking - if new CHAIN_TYPE values are added, TypeScript will error here
        throw new Error(`Unsupported wallet type: ${walletType as string}`);
    }
  }

  /**
   * Get list of supported wallet types
   * @returns Array of supported wallet types
   */
  static getSupportedTypes(): string[] {
    return [CHAIN_TYPE.SOLANA, CHAIN_TYPE.EVM];
  }
}
