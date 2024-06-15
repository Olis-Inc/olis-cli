import { exec } from "child_process";

class Cmd {
  static run(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout) => {
        if (error) {
          reject(error);
        }

        resolve(stdout.trim());
      });
    });
  }
}

export default Cmd;
