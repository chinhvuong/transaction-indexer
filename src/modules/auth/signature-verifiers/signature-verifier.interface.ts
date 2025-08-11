/**
 * Interface for signature verification across different blockchain networks
 */
export interface ISignatureVerifier {
  /**
   * Verify signature for a given message and expected address
   * @param message The message that was signed
   * @param signature The signature to verify
   * @param expectedAddress The expected wallet address
   * @returns boolean indicating if signature is valid
   */
  verifySignature(
    message: string,
    signature: string,
    expectedAddress: string,
  ): boolean;
}
