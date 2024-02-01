import { caching } from 'cache-manager';
import Elysia from 'elysia';
import { KavenegarClient } from './kavenegar';

interface Options {
  apiKey: string;
  sandbox: boolean;
  codeLength: number;
}

export default async ({ apiKey, codeLength, sandbox }: Options = { apiKey: '', sandbox: false, codeLength: 5 }) => {
  const cache = await caching('memory', { ttl: 120 });
  const sms = new KavenegarClient(apiKey, sandbox, cache);

  return new Elysia({
    name: 'sms',
  }).decorate('sms', {
    async sendCode(phone: string, { template }: { template: string }) {
      return sms.sendCode({
        receptor: phone,
        template,
        token: Math.random().toString().slice(2, codeLength),
      });
    },
    async verifyCode(phone: string, code: string) {
      return sms.verifyCode(phone, code);
    },
  });
};
