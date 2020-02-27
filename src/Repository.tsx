import React, { Component, FormEvent, ChangeEvent, createRef } from "react";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Radio from "@material-ui/core/Radio";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { red, green } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";

import asyncProcess from "./utils/async-process";
import prepareRequestUrl from "./utils/prepareRequestUrl";
import { triggerWorkflow, clearCache } from "./api";
import { RepositoryType } from "./types";

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

type ActiveParametersGroupType = "REVISION-BRANCH" | "TAG";

type FormDataType = {
  tag: string;
  branch: string;
  revision: string;
};

const ACTIONS = {
  "TRIGGER-WORKFLOW": "TRIGGER-WORKFLOW",
  "CLEAR-CACHE": "CLEAR-CACHE"
};

function prepareRequestPayload(formDataType: FormDataType, activeParametersGroup: ActiveParametersGroupType) {
  const { tag, branch, revision } = formDataType;

  if (activeParametersGroup === "REVISION-BRANCH") {
    return {
      branch: branch || undefined,
      revision: revision || undefined
    };
  }

  return { tag };
}

const styles = (theme: Theme) =>
  createStyles({
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "70%",
      flexShrink: 0
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary
    },
    panelDetails: {
      flexDirection: "column"
    },
    triggerButton: {
      height: "40px"
    },
    subActionButton: {
      textTransform: "none",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(2),
      backgroundColor: theme.palette.grey[200],
      "&:last-child": {
        marginRight: 0
      }
    },
    curlInput: {
      position: "absolute",
      opacity: 0,
      zIndex: -1,
      pointerEvents: "none"
    },
    curlIcon: {
      fontSize: 20,
      marginLeft: theme.spacing(1)
    },
    introduction: {
      marginBottom: theme.spacing(3)
    },
    form: {
      alignItems: "stretch",
      flexDirection: "column",
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row"
      }
    },
    description: {
      fontSize: theme.typography.pxToRem(13)
    },
    dividerWrapper: {
      display: "flex",
      alignItems: "center",
      color: theme.palette.grey[400],
      [theme.breakpoints.up("sm")]: {
        textAlign: "right",
        flexDirection: "column"
      }
    },
    divider: {
      height: "1px",
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      flexGrow: 1,
      background: theme.palette.grey[300],
      [theme.breakpoints.up("sm")]: {
        height: "auto",
        width: "1px",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
      }
    },
    actions: {
      marginTop: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    externalLinks: {
      textAlign: "left",
      [theme.breakpoints.up("sm")]: {
        textAlign: "right"
      }
    },
    externalLink: {
      marginBottom: theme.spacing(1),
      fontSize: 12
    },
    popover: {
      padding: theme.spacing(1)
    },
    popoverSuccess: {
      color: "white",
      backgroundColor: green[600]
    },
    popoverError: {
      color: "white",
      backgroundColor: red[600],
      "& a": {
        color: "inherit"
      }
    }
  });

interface Props extends WithStyles<typeof styles> {
  expanded: boolean;
  token: string;
  repository: RepositoryType;
  onToggle: (id: PropType<RepositoryType, "id">) => any;
}

interface State extends FormDataType {
  tagError?: string;
  branchRevisionError?: string;
  error?: string;
  actionPending: string | null;
  clipboardPopoverVisible: boolean;
  triggerPopoverVisible: boolean;
  clearCachePopoverVisible: boolean;
  activeParametersGroup: "REVISION-BRANCH" | "TAG";
}

class Repository extends Component<Props, State> {
  curlInputRef = createRef<HTMLInputElement>();
  curlButtonRef = createRef<HTMLButtonElement>();
  clearCacheButtonRef = createRef<HTMLButtonElement>();
  triggerButtonRef = createRef<HTMLButtonElement>();
  cancelRequest?: () => void = undefined;

  state: State = {
    activeParametersGroup: "REVISION-BRANCH",
    tag: "",
    branch: "",
    revision: "",
    actionPending: null,
    clipboardPopoverVisible: false,
    triggerPopoverVisible: false,
    clearCachePopoverVisible: false
  };

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  triggerWorkflow() {
    const { repository, token } = this.props;
    let { tag, branch, revision, activeParametersGroup } = this.state;

    const [promise, cancel] = asyncProcess(
      triggerWorkflow.bind(
        null,
        repository,
        token,
        prepareRequestPayload({ tag, branch, revision }, activeParametersGroup)
      )
    );

    this.cancelRequest = cancel;

    promise
      .catch(error => {
        this.setState({
          error: error.message
        });
      })
      .finally(() => {
        this.cancelRequest = undefined;

        this.setState({
          actionPending: null,
          triggerPopoverVisible: true
        });
      });
  }

  setParametersSet = (parametersSet: PropType<State, "activeParametersGroup">) => {
    this.setState({
      activeParametersGroup: parametersSet
    });
  };

  generateCurl() {
    const { repository, token } = this.props;
    const { branch, tag, revision, activeParametersGroup } = this.state;

    return `curl -X POST ${prepareRequestUrl(
      repository,
      "build",
      token
    )} -H "Content-Type: application/json" -d '${JSON.stringify(
      prepareRequestPayload({ branch, tag, revision }, activeParametersGroup)
    )}'`;
  }

  onCopyCurl = () => {
    if (this.curlInputRef.current) {
      this.curlInputRef.current.select();
      document.execCommand("copy");

      this.setState({
        clipboardPopoverVisible: true
      });
    }
  };

  onResetCache = () => {
    const { repository, token } = this.props;

    const [promise, cancel] = asyncProcess(clearCache.bind(null, repository, token));

    this.cancelRequest = cancel;

    this.setState({
      error: undefined,
      tagError: undefined,
      branchRevisionError: undefined,
      actionPending: ACTIONS["CLEAR-CACHE"]
    });

    promise
      .catch(error => {
        this.setState({
          error: error.message
        });
      })
      .finally(() => {
        this.cancelRequest = undefined;

        this.setState({
          actionPending: null,
          clearCachePopoverVisible: true
        });
      });
  };

  onTriggerWorkflow = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { tag, branch, revision, activeParametersGroup } = this.state;

    this.setState({
      error: undefined,
      tagError: undefined,
      branchRevisionError: undefined
    });

    if (activeParametersGroup === "TAG" && tag.trim().length === 0) {
      this.setState({
        tagError: "Tag is required"
      });

      return;
    }

    if (activeParametersGroup === "REVISION-BRANCH" && branch.trim().length === 0 && revision.trim().length === 0) {
      this.setState({
        branchRevisionError: "Branch and/or revision is required"
      });

      return;
    }

    this.setState({
      actionPending: ACTIONS["TRIGGER-WORKFLOW"]
    });

    this.triggerWorkflow();
  };

  onParametersSetChose = (e: ChangeEvent<HTMLInputElement>) => {
    this.setParametersSet(e.currentTarget.value as PropType<State, "activeParametersGroup">);
  };

  onInputChange(inputName: "revision" | "tag" | "branch") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      if (inputName === "revision") {
        this.setState({
          revision: e.currentTarget.value! as string
        });
      }

      if (inputName === "tag") {
        this.setState({
          tag: e.currentTarget.value! as string
        });
      }

      if (inputName === "branch") {
        this.setState({
          branch: e.currentTarget.value! as string
        });
      }
    };
  }

  onClipboardPopoverClose = () => {
    this.setState({
      clipboardPopoverVisible: false
    });
  };

  onTriggerPopoverClose = () => {
    this.setState({
      triggerPopoverVisible: false
    });
  };

  onClearCachePopoverClose = () => {
    this.setState({
      clearCachePopoverVisible: false
    });
  };

  render() {
    const { expanded, onToggle, classes, repository } = this.props;
    const {
      tag,
      branch,
      revision,
      activeParametersGroup,
      error,
      actionPending,
      clipboardPopoverVisible,
      triggerPopoverVisible,
      clearCachePopoverVisible,
      tagError,
      branchRevisionError
    } = this.state;
    const { id, organisation, name, vcsType } = repository;

    return (
      <ExpansionPanel expanded={expanded} onChange={() => onToggle(id)}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>{name}</Typography>
          <Typography className={classes.secondaryHeading}>{organisation}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Grid container className={classes.introduction}>
            <Grid item sm={8}>
              <Typography variant="body1" gutterBottom className={classes.description}>
                To trigger workflow, you need to define revision, branch or tag.
                <br />
                Tag can't be used together with revision or branch.
                <br />
              </Typography>
            </Grid>
            <Grid item sm={4} className={classes.externalLinks}>
              <Link
                className={classes.externalLink}
                rel="noopener"
                href={`https://${vcsType ? "github.com" : "bitbucket.org"}/${organisation}/${name}`}
                target="_blank"
              >
                Go to repository <OpenInNewIcon fontSize="inherit" />
              </Link>
              <br />
              <Link
                className={classes.externalLink}
                rel="noopener"
                href={`https://circleci.com/${vcsType ? "gh" : "bb"}/${organisation}/${name}`}
                target="_blank"
              >
                Go to CircleCI project <OpenInNewIcon fontSize="inherit" />
              </Link>
            </Grid>
          </Grid>
          <form onSubmit={this.onTriggerWorkflow} autoComplete="off">
            <Grid container spacing={1} justify="space-between" className={classes.form}>
              <Grid item sm={5}>
                <Box justifyContent="center" display="flex">
                  <FormControlLabel
                    control={
                      <Radio
                        name="parameters-set"
                        value="REVISION-BRANCH"
                        checked={activeParametersGroup === "REVISION-BRANCH"}
                        onChange={this.onParametersSetChose}
                      />
                    }
                    label="Revision and/or branch"
                  />
                </Box>
                <TextField
                  InputLabelProps={{
                    shrink: true
                  }}
                  variant="outlined"
                  margin="dense"
                  onChange={this.onInputChange("branch")}
                  fullWidth
                  id="branch"
                  placeholder="e.g. develop"
                  label="branch"
                  name="branch"
                  disabled={actionPending === ACTIONS["TRIGGER-WORKFLOW"]}
                  value={branch}
                />
                <TextField
                  variant="outlined"
                  onChange={this.onInputChange("revision")}
                  margin="dense"
                  InputLabelProps={{
                    shrink: true
                  }}
                  fullWidth
                  id="revision"
                  label="revision"
                  placeholder="e.g. 13c5a2d689eea3803c267a"
                  name="revision"
                  disabled={actionPending === ACTIONS["TRIGGER-WORKFLOW"]}
                  value={revision}
                />
                <FormHelperText error={true}>{branchRevisionError}</FormHelperText>
              </Grid>
              <Grid item sm={2} className={classes.dividerWrapper}>
                <div className={classes.divider}></div>
                <span>or</span>
                <div className={classes.divider}></div>
              </Grid>
              <Grid item sm={5}>
                <Box justifyContent="center" display="flex">
                  <FormControlLabel
                    control={
                      <Radio
                        value="TAG"
                        name="parameters-set"
                        checked={activeParametersGroup === "TAG"}
                        onChange={this.onParametersSetChose}
                      />
                    }
                    label="Tag"
                  />
                </Box>
                <TextField
                  variant="outlined"
                  margin="dense"
                  onChange={this.onInputChange("tag")}
                  fullWidth
                  id="tag"
                  label="tag"
                  InputLabelProps={{
                    shrink: true
                  }}
                  placeholder="e.g. v1.4.1"
                  name="tag"
                  autoComplete="off"
                  disabled={actionPending === ACTIONS["TRIGGER-WORKFLOW"]}
                  value={tag}
                />
                <FormHelperText error={true}>{tagError}</FormHelperText>
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Grid container justify="center">
                <Grid item xs={4}>
                  <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                    <Popover
                      open={triggerPopoverVisible}
                      anchorEl={this.triggerButtonRef.current}
                      onClose={this.onTriggerPopoverClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center"
                      }}
                      transformOrigin={{
                        vertical: "center",
                        horizontal: "center"
                      }}
                    >
                      {error ? (
                        <Typography
                          className={`${classes.popover} ${classes.popoverError}`}
                          dangerouslySetInnerHTML={{ __html: error || "" }}
                        ></Typography>
                      ) : (
                        <Typography className={`${classes.popover} ${classes.popoverSuccess}`}>
                          Workflow triggered!
                        </Typography>
                      )}
                    </Popover>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      ref={this.triggerButtonRef}
                      fullWidth
                      disabled={actionPending === ACTIONS["TRIGGER-WORKFLOW"]}
                      className={classes.triggerButton}
                    >
                      {actionPending === ACTIONS["TRIGGER-WORKFLOW"] ? "Loading..." : "Trigger"}
                    </Button>
                    <Box display="flex">
                      <Popover
                        open={clipboardPopoverVisible}
                        anchorEl={this.curlButtonRef.current}
                        onClose={this.onClipboardPopoverClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center"
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "center"
                        }}
                      >
                        <Typography className={classes.popover}>cURL copied to clipboard</Typography>
                      </Popover>
                      <Button
                        size="small"
                        type="button"
                        variant="contained"
                        className={classes.subActionButton}
                        ref={this.curlButtonRef}
                        onClick={this.onCopyCurl}
                      >
                        cURL
                        <SaveAltIcon className={classes.curlIcon} />
                      </Button>
                      <input
                        placeholder="curl"
                        className={classes.curlInput}
                        value={this.generateCurl()}
                        ref={this.curlInputRef}
                        tabIndex={-1}
                        readOnly
                      />
                      <Popover
                        open={clearCachePopoverVisible}
                        anchorEl={this.clearCacheButtonRef.current}
                        onClose={this.onClearCachePopoverClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center"
                        }}
                        transformOrigin={{
                          vertical: "center",
                          horizontal: "center"
                        }}
                      >
                        <Typography className={`${classes.popover} ${classes.popoverSuccess}`}>
                          Cache cleared!
                        </Typography>
                      </Popover>
                      <Button
                        size="small"
                        type="button"
                        variant="contained"
                        className={classes.subActionButton}
                        ref={this.clearCacheButtonRef}
                        disabled={actionPending === ACTIONS["CLEAR-CACHE"]}
                        onClick={this.onResetCache}
                      >
                        {actionPending === ACTIONS["CLEAR-CACHE"] ? "Loading..." : "clear build cache"}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </div>
          </form>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(Repository);
