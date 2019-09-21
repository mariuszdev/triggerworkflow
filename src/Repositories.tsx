import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import Repository from "./Repository";
import { RepositoryType } from "./types";

declare let ga: Function;

type RepositoriesProps = {
  repositories: RepositoryType[];
  token: string;
};

interface RepositoriesState {
  expandedRepositoryId: string | undefined;
}

class Repositores extends Component<RepositoriesProps, RepositoriesState> {
  state: RepositoriesState = {
    expandedRepositoryId: undefined
  };

  componentDidMount() {
    if (typeof ga !== "undefined") {
      ga("send", "pageview", "repositories");
    }
  }

  togglePanel = (id: string) => {
    this.setState(({ expandedRepositoryId }) => ({
      expandedRepositoryId: expandedRepositoryId === id ? undefined : id
    }));
  };

  render() {
    const { repositories, token } = this.props;
    const { expandedRepositoryId } = this.state;

    return (
      <Grid container justify="center">
        <Grid item xs={12} sm={10}>
          {repositories.map(({ id, name, organisation, vcsType }) => (
            <Repository
              key={id}
              token={token}
              expanded={expandedRepositoryId === id}
              repository={{ id, name, organisation, vcsType }}
              onToggle={this.togglePanel}
            />
          ))}
        </Grid>
      </Grid>
    );
  }
}

export default Repositores;
