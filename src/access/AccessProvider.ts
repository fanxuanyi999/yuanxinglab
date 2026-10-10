export interface AccessProvider {
  verify(code: string): Promise<boolean>;
}
// Demo only: public front-end comparison is not secure authorization.
// Replace this provider with a server-backed verification + entitlement flow.
export class DemoAccessProvider implements AccessProvider {
  async verify(code: string) {
    return code.trim() === (import.meta.env.VITE_DEMO_ACCESS_CODE || '1024');
  }
}
export const accessProvider: AccessProvider = new DemoAccessProvider();
export const accessRequired = import.meta.env.VITE_ACCESS_REQUIRED === 'true';
