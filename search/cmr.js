const axios = require('axios');


// TODO items from previous clojure impl to incorporate
// sorting by granule ur
// https://github.com/Element84/catalog-api-spec/blob/dev/implementations/e84/src/e84_api_impl/search_service.clj
// has mappings from JSON response to GeoJSON features


p = axios.get('https://cmr.earthdata.nasa.gov/search/granules.json?concept_id=C204690560-LAADS')

let result;
p.then(v => result = v)


result



// TODO when finding collections:
// - limit to just the ones with granules
// -
