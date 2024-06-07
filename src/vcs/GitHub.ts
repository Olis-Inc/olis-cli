import sodium from "libsodium-wrappers";
import { SyncEnvRequest } from "@src/types/vcs";
import HttpRequest from "@src/utils/HttpRequest";
import Storage from "@src/utils/Storage";
import {
  VCS_ACCESS_TOKEN_KEY,
  VCS_REPOSITORY,
  VCS_REPOSITORY_OWNER,
  VCS_REPOSITORY_URL,
} from "@src/utils/constants";
import { AxiosError } from "axios";
import { Environment } from "@src/types/config";

export interface CreateRepositoryPayload {
  name: string;
  private: boolean;
  owner: string;
}

class GitHub {
  private static secureStorage = new Storage("secrets");

  private static appStorage = new Storage("app");

  // eslint-disable-next-line class-methods-use-this
  private static get api() {
    const accessToken = this.secureStorage.get(VCS_ACCESS_TOKEN_KEY);
    return new HttpRequest({
      baseURL: "https://api.github.com",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
    }).api;
  }

  static async getRepository(owner: string, name: string) {
    return this.api.get(`/repos/${owner}/${name}`);
  }

  private static async callCreateRepository(payload: CreateRepositoryPayload) {
    try {
      const data = await this.api.post<undefined, { html_url: string }>(
        "/user/repos",
        {
          name: payload.name,
          private: payload.private,
        },
      );
      this.appStorage.set(VCS_REPOSITORY, payload.name);
      this.appStorage.set(VCS_REPOSITORY_URL, data.html_url);
      this.appStorage.set(VCS_REPOSITORY_OWNER, payload.owner);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private static async getPublicKey(owner: string, name: string) {
    try {
      const data = await this.api.get<
        undefined,
        { key: string; key_id: string }
      >(`/repos/${owner}/${name}/actions/secrets/public-key`);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async createRepository(payload: CreateRepositoryPayload) {
    const { name, owner } = payload;
    try {
      await this.getRepository(owner, name);
      return Promise.resolve();
    } catch (error) {
      const e = error as AxiosError;
      if (e.status === 404) {
        await this.callCreateRepository(payload);
        return Promise.resolve();
      }
      return Promise.reject(error);
    }
  }

  private static async encryptSecret(secret: string, publicKey: string) {
    await sodium.ready;

    const binaryKey = sodium.from_base64(
      publicKey,
      sodium.base64_variants.ORIGINAL,
    );
    const binarySecret = sodium.from_string(secret);
    const encryptedBinarySecret = sodium.crypto_box_seal(
      binarySecret,
      binaryKey,
    );
    const encryptedSecret = sodium.to_base64(
      encryptedBinarySecret,
      sodium.base64_variants.ORIGINAL,
    );

    return encryptedSecret;
  }

  static async syncEnv(payload: SyncEnvRequest) {
    try {
      const owner = this.appStorage.get(VCS_REPOSITORY_OWNER);
      const repo = this.appStorage.get(VCS_REPOSITORY);
      const publicKey = await this.getPublicKey(owner, repo);

      await Promise.all(
        Object.keys(payload).map(async (env) => {
          const secretName = `${env.toUpperCase()}_ENV`;
          const secret = payload[env as Environment] as string;
          const encryptedSecret = await this.encryptSecret(
            secret,
            publicKey.key,
          );

          return this.api.put(
            `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
            {
              encrypted_value: encryptedSecret,
              key_id: publicKey.key_id,
            },
          );
        }),
      );
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default GitHub;
