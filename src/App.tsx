import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import CloseIcon from "@material-ui/icons/Close";
import Container from "@material-ui/core/Container";

import Repositories from "./Repositories";
import Login from "./Login";
import asyncProcess from "./utils/async-process";
import About from "./About";
import { fetchRepositories, RepositoriesResponseType } from "./api";

const styles = (theme: Theme) =>
  createStyles({
    "@global": {
      body: {
        backgroundColor: "#F3F3F3",
        "-webkit-tap-highlight-color": "transparent"
      }
    },
    spinner: {
      margin: "0 auto",
      display: "block"
    },
    app: {
      marginTop: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch"
    },
    header: {
      marginBottom: theme.spacing(6),
      position: "relative",
      alignSelf: "center",
      [theme.breakpoints.down("xs")]: {
        alignSelf: "flex-start"
      }
    },
    form: {
      width: "100%",
      marginTop: theme.spacing(1)
    },

    errorPopup: {
      backgroundColor: theme.palette.error.dark
    },
    errorPopupIcon: {
      fontSize: 20
    },
    errorPopupIconVariant: {
      opacity: 0.9,
      marginRight: theme.spacing(1)
    },
    errorMessage: {
      display: "flex",
      alignItems: "center"
    },
    options: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.up("sm")]: {
        position: "absolute",
        display: "flex",
        left: "100%",
        top: 0,
        bottom: 0,
        marginLeft: theme.spacing(2),
        marginTop: 0
      },
      "& button": {
        alignSelf: "center"
      }
    },
    logoutButton: {
      marginLeft: theme.spacing(1)
    }
  });

interface Props extends WithStyles<typeof styles> {}

interface State {
  repositories?: {
    id: string;
    name: string;
    organisation: string;
    vcsType: string;
  }[];
  token?: string;
  page: "LOGIN" | "REPOSITORIES";
  error?: string;
  aboutVisible: boolean;
  errorVisible: boolean;
  fetchingRepositories: boolean;
}

class App extends Component<Props, State> {
  cancelRequest?: () => void;

  constructor(props: Props) {
    super(props);

    const token = localStorage.getItem("circleci-token");

    this.state = {
      page: token ? "REPOSITORIES" : "LOGIN",
      repositories: undefined,
      token: token === null ? undefined : token,
      aboutVisible: false,
      fetchingRepositories: false,
      errorVisible: false
    };
  }

  componentDidMount() {
    const { token } = this.state;

    if (token) {
      this.fetchRepositories(token).then(success => {
        if (success) {
          this.setState({
            page: "REPOSITORIES"
          });
        } else {
          this.setState({
            page: "LOGIN"
          });

          localStorage.removeItem("circleci-token");
        }
      });
    }
  }

  fetchRepositories(token: string): Promise<boolean> {
    this.setState({
      fetchingRepositories: true
    });

    const [promise, cancel] = asyncProcess<RepositoriesResponseType>(fetchRepositories.bind(null, token));

    this.cancelRequest = cancel;

    return promise
      .then(
        data => {
          this.setState({
            repositories: data.map(({ vcs_url, vcs_type, reponame, username }) => ({
              id: vcs_url,
              vcsType: vcs_type,
              name: reponame,
              organisation: username
            }))
          });

          return true;
        },
        () => {
          this.setState({
            error: "Incorrect access token",
            errorVisible: true
          });

          return false;
        }
      )
      .finally(() => {
        this.setState({
          fetchingRepositories: false
        });
      });
  }

  toggleAboutVisibility = () => {
    this.setState(({ aboutVisible }) => ({
      aboutVisible: !aboutVisible
    }));
  };

  onSubmit = (token: string, rememberMe: boolean) => {
    this.fetchRepositories(token).then(success => {
      if (success) {
        this.setState({
          token,
          page: "REPOSITORIES"
        });

        if (rememberMe) {
          localStorage.setItem("circleci-token", token);
        }
      }
    });
  };

  onErrorClose = () => {
    this.setState({
      errorVisible: false
    });
  };

  onErrorClosed = () => {
    this.setState({
      error: undefined
    });
  };

  onLogout = () => {
    this.setState({
      repositories: undefined,
      token: undefined,
      page: "LOGIN"
    });

    localStorage.removeItem("circleci-token");
  };

  renderError() {
    const { classes } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        open={this.state.errorVisible}
        autoHideDuration={6000}
        onClose={this.onErrorClose}
        onExited={this.onErrorClosed}
      >
        <SnackbarContent
          className={classes.errorPopup}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.errorMessage}>
              <InfoIcon className={`${classes.errorPopupIcon} ${classes.errorPopupIconVariant}`} />
              {this.state.error}
            </span>
          }
          action={[
            <IconButton key="close" aria-label="close" color="inherit" onClick={this.onErrorClose}>
              <CloseIcon className={classes.errorPopupIcon} />
            </IconButton>
          ]}
        />
      </Snackbar>
    );
  }

  renderLogoutButton() {
    const { classes } = this.props;

    return (
      <Button
        variant="contained"
        color="secondary"
        size="small"
        className={classes.logoutButton}
        onClick={this.onLogout}
      >
        logout
      </Button>
    );
  }

  renderLoader() {
    const { classes } = this.props;

    return <CircularProgress className={classes.spinner} />;
  }

  renderAboutButton() {
    return (
      <Button variant="contained" color="primary" size="small" onClick={this.toggleAboutVisibility}>
        about
      </Button>
    );
  }

  renderAbout() {
    return <About open={this.state.aboutVisible} onClose={this.toggleAboutVisibility} />;
  }

  renderPage() {
    const { page, fetchingRepositories, repositories, token } = this.state;

    if (page === "LOGIN") {
      return <Login onSubmit={this.onSubmit} pending={fetchingRepositories} />;
    }

    if (page === "REPOSITORIES") {
      if (fetchingRepositories) {
        return this.renderLoader();
      }

      if (repositories !== undefined) {
        return <Repositories token={token!} repositories={repositories} />;
      }
    }
  }

  render() {
    const { classes } = this.props;
    const { page } = this.state;

    return (
      <div>
        <Container maxWidth="md">
          <CssBaseline />
          <div className={classes.app}>
            <header className={classes.header}>
              <Typography component="h1" variant="h4">
                Trigger workflow
              </Typography>
              <div className={classes.options}>
                {this.renderAboutButton()}
                {page === "REPOSITORIES" && this.renderLogoutButton()}
              </div>
            </header>
            <main>{this.renderPage()}</main>
          </div>
        </Container>
        {this.renderAbout()}
        {this.renderError()}
      </div>
    );
  }
}

export default withStyles(styles)(App);
