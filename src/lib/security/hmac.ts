import "server-only";

import crypto from "node:crypto";

export function verifyHmacSha256Base64({
  rawBody,
  signature,
  secret
}: {
  rawBody: string;
  signature: string | null;
  secret: string;
}) {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(rawBody, "utf8"))
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}
