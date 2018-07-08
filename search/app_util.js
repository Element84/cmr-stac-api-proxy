const generateAppUrl = (event, path) => {
  const host = event.headers.Host;
  const protocol = event.headers['X-Forwarded-Proto'];
  let stageUrlPart = '';
  if (!host.includes('localhost')) {
    // If we're running locally the stage isn't part of the URL.
    stageUrlPart = `/${event.requestContext.stage}`;
  }
  return `${protocol}://${host}${stageUrlPart}/search${path}`;
};

const createLink = (rel, href, title, type = 'application/json') => ({
  href, rel, type, title
});

module.exports = {
  generateAppUrl,
  wfs: {
    createLink
  }
};
