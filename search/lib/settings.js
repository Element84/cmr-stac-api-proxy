let settings;

function getLoggerSettings () {
  const loggerSettings = {};

  loggerSettings.logLevel = 'silly';
  loggerSettings.quiet = false;

  return loggerSettings;
}

function getStacSettings () {
  const stacSettings = {};

  stacSettings.version = '0.8.0';
  stacSettings.baseUrl = 'http://localhost:3000/stac';

  return stacSettings;
}

function getSettings () {
  if (!settings) {
    settings = {};
    settings.logger = getLoggerSettings();
    settings.stac = getStacSettings();
  }
  return settings;
}

module.exports = getSettings();
