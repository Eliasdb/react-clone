import { VNode } from './index';

declare module 'virtual-dom' {
    export function template(
        strings: TemplateStringsArray,
        ...values: any[]
    ): VNode;
}
