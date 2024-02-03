import { KavenegarApi, kavenegar } from 'kavenegar';
import Keyv from 'keyv';

interface VerifyLookUpMessage {
  template: string;
  token: string;
  token2?: string;
  token3?: string;
  token4?: string;
  receptor: string;
}

export class KavenegarClient {
  client: kavenegar.KavenegarInstance;

  constructor(private apikey: string, private sandbox: boolean, private cache: Keyv) {
    this.client = KavenegarApi({ apikey: this.apikey });
  }

  private verifyLookup = async (data: VerifyLookUpMessage) => {
    return new Promise((resolve, reject) => {
      this.client.VerifyLookup(data, (result, code, error) => {
        if (code != 200) {
          console.log(`[sms] verifyLookup error: [${code}] ${error}, data: ${JSON.stringify(data)} ,result: ${JSON.stringify(result)}`);
          return reject(error);
        }
        return resolve(result);
      });
    });
  };

  async sendCode(data: VerifyLookUpMessage) {
    const code = await this.cache.get(data.receptor);
    if (code) {
      throw new Error('phone code already sent');
    }

    await this.cache.set(data.receptor, data.token);

    if (this.sandbox) {
      console.log(`[sms] send code: ${data.token} to ${data.receptor}`);
      return;
    }

    return this.verifyLookup(data);
  }

  async verifyCode(phone: string, token: string) {
    if (this.sandbox) {
      console.log(`[sms] verify code ${phone} -> ${token}`);
    }

    const validToken = await this.cache.get(phone);

    if (token === validToken) {
      await this.cache.delete(phone);
    }

    return token === validToken;
  }
}
