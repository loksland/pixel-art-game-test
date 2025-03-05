/*
async function myFn() {
    await delay(3000);
    ...
}
*/
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
