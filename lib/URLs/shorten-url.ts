import Hashids from "hashids";
import { characters, HASH_LENGTH } from "@/utils/rules/short_urls";
import { urlTest } from "../zod-schemas/url-zod-schema-simple";
import { NumberLike } from "hashids/util";

export function testURL(urlPayload: string): boolean {
  const result = urlTest.safeParse({ long_url: urlPayload });
  if (!result.success) {
    return false;
  }
  return true;
}

export function EncodeShortURL(urlID: number): string {
  const hashids = new Hashids(
    process.env.SHORT_URL_SALT!,
    HASH_LENGTH,
    characters
  );
  const hash = hashids.encode(urlID);

  return hash;
}

export function DecodeShortURL(hash: string): NumberLike {
  const hashids = new Hashids(
    process.env.SHORT_URL_SALT!,
    HASH_LENGTH,
    characters
  );
  const id = hashids.decode(hash);

  return id[0];
}
