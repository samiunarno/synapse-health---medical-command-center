export const FormData = typeof window !== 'undefined' ? window.FormData : globalThis.FormData;
export default FormData;
export function formDataToBlob() { return new Blob(); }
