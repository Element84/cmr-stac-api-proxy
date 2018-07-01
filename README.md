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
  * GET
    * Returns landing page or root JSON element
* /conformance
  * GET
    * Returns an array of WFS specs that it conforms to.
    * TODO figure out which of these it matches. See WFS3core+STAC.yaml line 375
    * For now hard code to JSON
* /collections
  * GET
    - Returns a bunch of collections.
    - response:
      - links - array of links for this document mostly linking to self.
        - TODO could we link to next page etc?
      - collections
        - each has name, title, description, links, extent (spatial area), crs
        - links are to items, other stuff in coll
* /collections/{collectionId}
  * GET TODO
* /collections/{collectionId}/items
  * GET TODO
* /collections/{collectionId}/items/{featureId}
* /search/stac
  * GET
    * query params
      * bbox
      * time
      * limit
      * collection
    * Returns GeoJSON with extra stuff
  - POST


## Plan

* Decide how collections will be handled
  * Dev see just includes a collection parameter - https://github.com/sat-utils/sat-api
  * But how do you know which collections there are?
    - We should implement collections.
    - How do you get from WFS responses to the related stac search?
      - Answer: in the links somewhere
    - Do we implement all the lower level /items and /items/{featureId} responses?
      - Answer: probably yes and include the _same_ results as /search/stac would return. It's a GeoJSON response so that _should_ be ok. Response validation will enforce that this isn't breaking.
* Decide the order in which to implement things
  - integration tests?
    - probably not.
  - Unit tests?
    - Converts this JSON into this other JSON?
    - probably not just for speed.
* HTML responses?
  - Maybe at the end with a JSON to HTML converter or something.
  - Would be cool to style with EUI.
* Order to implement
  - Top to bottom
* Use multiple lambdas for each area and a common api.



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
