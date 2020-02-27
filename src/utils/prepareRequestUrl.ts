import { RepositoryType } from "../types";

export default function prepareRequestUrl(repository: RepositoryType, action: string, token: string) {
  const { vcsType, organisation, name } = repository;

  return `https://circleci.com/api/v1.1/project/${vcsType}/${organisation}/${name}/${action}?circle-token=${token}`;
}
