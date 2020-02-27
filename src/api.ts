import { RepositoryType } from "./types";
import prepareRequestUrl from "./utils/prepareRequestUrl";

export type RepositoriesResponseType = {
  vcs_url: string;
  vcs_type: string;
  reponame: string;
  username: string;
}[];

export function* fetchRepositories(token: string) {
  const response = yield fetch(`https://circleci.com/api/v1.1/projects?circle-token=${token}`);

  if (!response.ok) {
    throw new Error("Invalid access token");
  }

  const data = yield response.json();

  return data as RepositoriesResponseType;
}

export function* triggerWorkflow(repository: RepositoryType, token: string, data: object) {
  const response = yield fetch(process.env.REACT_APP_PROXY_URL + prepareRequestUrl(repository, "build", token), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    return true;
  }

  const body = yield response.json();

  throw new Error(body.message);
}

export function* clearCache(repository: RepositoryType, token: string) {
  const response = yield fetch(process.env.REACT_APP_PROXY_URL + prepareRequestUrl(repository, "build-cache", token), {
    method: "DELETE"
  });

  if (response.ok) {
    return true;
  }

  const body = yield response.json();

  throw new Error(body.message);
}
