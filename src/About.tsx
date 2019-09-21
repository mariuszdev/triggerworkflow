import React from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

const styles = (theme: Theme) =>
  createStyles({
    dialogContainer: {
      alignItems: "flex-start"
    },
    dialogScrollPaper: {
      margin: theme.spacing(2)
    },
    heading: {
      fontSize: theme.typography.pxToRem(18),
      flexBasis: "70%",
      flexShrink: 0
    },
    summaryRoot: {
      cursor: "initial !important"
    },
    actions: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      "justify-content": "space-between"
    }
  });

interface Props extends WithStyles<typeof styles> {
  onClose: () => void;
  open: boolean;
}

const About = ({ classes, open, onClose }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
      classes={{ paperScrollPaper: classes.dialogScrollPaper, container: classes.dialogContainer }}
    >
      <DialogContent dividers={true}>
        <Typography variant="h5" component="h2" gutterBottom>
          What does it do?
        </Typography>
        <Typography variant="body1" paragraph>
          It helps to trigger CircleCI workflow.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Who is it for?
        </Typography>
        <Typography variant="body1" paragraph>
          It is created for developers who use CircleCI as their continuous integration platform.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Why is it useful?
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          It offers new way of triggering workflows.
          <br />
          Until now to achieve it developers had to:
          <ul>
            <li>push new commit</li>
            <li>create pull request</li>
            <li>retry one of the previous workflows</li>
            <li>redeliver request from Github/Bitbucket to CircleCI</li>
            <li>manually compose and invoke cURL request to CircleCI API</li>
          </ul>
          Sometimes there is a need to rerun workflow for one of the earlier versions of an application (which can be
          really hard to find in the history), there is a downtime of connection between Github/Bitbucket and CircleCI
          (thus no build hooks after push/pull request) or developer has just pushed new version of{" "}
          <code>config.yml</code> and wants to build specific version of the app using it. <br />
          <b>This app makes it easy.</b>
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          How does it work?
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          The app makes two CircleCI API request
          <ul>
            <li>
              <code>GET https://circleci.com/api/v1.1/projects</code>
            </li>
            <li>
              <code>POST https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/build</code>
            </li>
          </ul>
          Unfortunately, CircleCI API doesn't accept cross-domain POST requests (<i>CORS</i>). That's why to trigger
          workflow such request has to be sent through{" "}
          <Link href="https://cors-anywhere.herokuapp.com/" rel="noopener" target="_blank">
            https://cors-anywhere.herokuapp.com/
          </Link>{" "}
          service.
          <br />
          <br />
          If you are afraid of passing your CircleCI token to a third-party, you can either only use "cURL" download
          button (and paste command in terminal) or launch Trigger workflow locally with your own CORS proxy.
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Community
        </Typography>
        <Typography variant="body1" component="div" paragraph>
          Everyone is welcome to create pull request with new features or fixes. Please let me know if you find this app
          useful by starring it on Github or simply messaging me on Twitter.
        </Typography>
      </DialogContent>
      <DialogActions classes={{ root: classes.actions }}>
        <Box justifySelf="flex-start">
          made by{" "}
          <Link
            href="https://twitter.com/mariuszdev"
            rel="noopener"
            target="_blank"
            aria-label="Visit author's twitter profile"
          >
            mariusz pilarczyk
          </Link>{" "}
          |{" "}
          <Link href="https://github.com/pilaas/triggerworkflow" rel="noopener" target="_blank">
            visit project's Github page
          </Link>
        </Box>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(About);
