const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');

// function to get the yaml files
function retrieveYaml (yamlUrl) {
  if (!yamlUrl) throw new Error('Missing yaml url');

  axios({
    method: 'get',
    url: yamlUrl
  })
    .then(yamlData => {
      return JSON.parse(yamlData.data);
    });
}

// function to merge yaml objects
// function to call first two, compare new and old, and write if old.

// const WFS3YamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/STAC.yaml';

// const STACYamlUrl = 'https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml';

// const newWFS3Yaml = axios.get(WFS3YamlUrl)
//   .then(response => {
//     return yaml.safeLoad(fs.readFileSync(response));
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const newSTACYaml = axios.get(STACYamlUrl)
//   .then(response => {
//     return yaml.safeLoad(fs.readFileSync(response));
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const mergedYaml = Object.assign({}, newWFS3Yaml, newSTACYaml);

// const oldYaml = yaml.safeLoad(fs.readFileSync('../search/docs/WFS3core+STAC.yaml'));

// if (JSON.stringify(mergedYaml) === JSON.stringify(oldYaml)) {

// } else {
//   fs.writeFileSync('../search/docs/newWFS3core+STAC.yaml', yaml.safeDump(mergedYaml), function (error) {
//     return console.error(error);
//   });
// }

module.exports = {
  retrieveYaml
};
