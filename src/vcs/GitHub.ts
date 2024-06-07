import HttpRequest from "@src/utils/HttpRequest";
import Storage from "@src/utils/Storage";
import {
  VCS_ACCESS_TOKEN_KEY,
  VCS_REPOSITORY_KEY,
  VCS_REPOSITORY_OWNER,
  VCS_REPOSITORY_URL,
} from "@src/utils/constants";
import { AxiosError } from "axios";

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

  static async callCreateRepository(payload: CreateRepositoryPayload) {
    try {
      const data = await this.api.post<undefined, { html_url: string }>(
        "/user/repos",
        {
          name: payload.name,
          private: payload.private,
        },
      );
      this.appStorage.set(VCS_REPOSITORY_KEY, payload.name);
      this.appStorage.set(VCS_REPOSITORY_URL, data.html_url);
      this.appStorage.set(VCS_REPOSITORY_OWNER, payload.owner);
      return Promise.resolve();
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
}

export default GitHub;
