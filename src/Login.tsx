import React, { Component, FormEvent } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Link from "@material-ui/core/Link";
import Switch from "@material-ui/core/Switch";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Button from "@material-ui/core/Button";

declare let ga: Function;

const styles = (theme: Theme) =>
  createStyles({
    rememberMe: {
      marginLeft: 0,
      marginRight: 0
    },
    rememberMeLabel: theme.typography.body2,
    submitButton: {
      margin: theme.spacing(3, 0, 2)
    }
  });

interface Props extends WithStyles<typeof styles> {
  onSubmit: (token: string, rememberMe: boolean) => void;
  pending: boolean;
}

interface State {
  rememberMe: boolean;
}

class Login extends Component<Props, State> {
  state: State = {
    rememberMe: false
  };

  componentDidMount() {
    if (typeof ga !== "undefined") {
      ga("send", "pageview", "login");
    }
  }

  toggleRememberMe = () => {
    this.setState(({ rememberMe }) => ({
      rememberMe: !rememberMe
    }));
  };

  onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { rememberMe } = this.state;
    const elements = e.currentTarget.elements as (HTMLFormControlsCollection & { token: HTMLInputElement });
    const token = elements.token.value;

    this.props.onSubmit(token, rememberMe);
  };

  render() {
    const { pending, classes } = this.props;
    const { rememberMe } = this.state;

    return (
      <Grid container justify="center">
        <Grid item sm={6} xs={12}>
          <form onSubmit={this.onSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="token"
              label="CircleCI token"
              name="token"
              autoFocus
              disabled={pending}
              autoComplete="off"
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <FormGroup>
                <FormControlLabel
                  className={classes.rememberMe}
                  control={<Switch size="small" checked={rememberMe} onChange={this.toggleRememberMe} />}
                  label="keep token in the browser"
                  classes={{ label: classes.rememberMeLabel }}
                />
              </FormGroup>
              <Link href="https://circleci.com/account/api" rel="noopener" target="_blank">
                get token <OpenInNewIcon fontSize="inherit" />
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={pending}
              className={classes.submitButton}
            >
              Fetch projects
            </Button>
          </form>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Login);
