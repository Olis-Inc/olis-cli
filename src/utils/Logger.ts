/* eslint-disable class-methods-use-this */
class Logger {
  log(payload: unknown) {
    // eslint-disable-next-line no-console
    console.log(payload);
  }

  success(payload: unknown) {
    // eslint-disable-next-line no-console
    console.log(payload);
  }

  error(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

export default Logger;
