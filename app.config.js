const appJson = require('./app.json');

// GitHub Pages (and similar static hosts) serve a project site under a
// sub-path (e.g. https://user.github.io/project-05/), not at the domain
// root. Expo Router needs to know that sub-path at build time to prefix its
// own asset/route URLs correctly — set GH_PAGES_BASE_URL when building for
// that target; leave it unset for local dev and root-hosted deployments
// (e.g. the Artifact preview), which is the default in app.json.
module.exports = ({ config }) => {
  const baseUrl = process.env.GH_PAGES_BASE_URL;
  if (!baseUrl) return config;

  return {
    ...config,
    experiments: {
      ...appJson.expo.experiments,
      baseUrl,
    },
  };
};
