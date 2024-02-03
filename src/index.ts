import Elysia from 'elysia';
import Keyv from 'keyv';
import { KavenegarClient } from './kavenegar';

interface Options {
  apiKey: string;
  sandbox: boolean;
  codeLength: number;
  cache: Keyv;
  template?: string;
}

export default (
  { apiKey, codeLength, sandbox, cache, template }: Options = { apiKey: '', sandbox: false, codeLength: 5, cache: new Keyv({ ttl: 120 * 1000 }) }
) => {
  const sms = new KavenegarClient(apiKey, sandbox, cache);

  return new Elysia({
    name: 'sms',
  }).decorate('sms', {
    async sendCode(phone: string) {
      return sms.sendCode({
        receptor: phone,
        template: template!,
        token: Math.random().toString().slice(2, codeLength),
      });
    },
    async verifyCode(phone: string, code: string) {
      return sms.verifyCode(phone, code);
    },
  });
};
