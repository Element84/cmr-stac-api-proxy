# CMR STAC API Proxy

An implementation of the STAC API on top of NASA's [Common Metadata Repository](https://cmr.earthdata.nasa.gov/search/).

TODO links to STAC API

## TODO

* Finish writing the README.
* Update search/package.json
* Linting
* Tests
  - Add tests validating a granule converts into correct GeoJSON

## API

TODO

TODO link to swagger docs

https://app.swaggerhub.com/apis/cholmesgeo/STAC-standalone/0.4.1#/

* /
  - TODO what should the root do
  * /search/stac
    - GET
      - query params
        - bbox
        - time
        - limit
      - Returns GeoJSON with extra stuff
    - POST
    -
* STAC API
  - Implement the basic one
  - Implement WFS extension
    - This makes sense considering the collection API
*

## Development

### Prerequisites

* node.js 8.10 (nvm is the best way)
* Docker
* AWS CLI
* [SAM CLI](https://github.com/awslabs/aws-sam-cli)

### Setup

TODO

### Running locally

TODO

### Running tests

TODO

### Deploying

TODO


## License

TODO license information
