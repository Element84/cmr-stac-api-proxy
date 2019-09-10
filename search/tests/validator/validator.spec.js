const { createSchemaValidator } = require('../../lib/validator');
const fs = require('fs');
const yaml = require('js-yaml');

const yamlContents = fs.readFileSync('./docs/WFS3core+STAC.yaml');
const yamlSchema = yaml.safeLoad(yamlContents);

describe('validator', () => {
  // console.log(createSchemaValidator())

  // const valid = createSchemaValidator(testObj);

  it.skip('should validate a swagger component', () => {
    expect(createSchemaValidator(yamlSchema.components.schemas.content)).toBe(true);
  });

  it.skip('should validate a schema with a schema element', () => {
    expect(createSchemaValidator('#/components/schemas/exception')).toBeTruthy();
  });
});

// expect(createSchemaValidator()).toEqual({
//   schema: {
//     components: {
//       parameters: {
//         limit: {

//         },
//         bbox: {

//         },
//         time: {

//         },
//         providerId: {

//         },
//         collectionId: {

//         },
//         queryCollectionId: {

//         },
//         featureId: {

//         }
//       },
//       schemas: {
//         exception: {

//         },
//         root: {

//         },
//         'req-classes': {

//         },
//         link: {

//         },
//         content: {

//         },
//         collectionInfo: {

//         },
//         extent: {

//         },
//         featureCollectionGeoJSON: {

//         },
//         geometryGeoJSON: {

//         },
//         searchBody: {

//         },
//         bbox: {

//         },
//         bboxFilter: {

//         },
//         timeFilter: {

//         },
//         intersectsFilter: {

//         },
//         polygon: {

//         },
//         polygon2D: {

//         },
//         linearRing2D: {

//         },
//         time: {

//         },
//         itemCollection: {

//         },
//         item: {

//         },
//         itemProperties: {

//         },
//         itemCollectionLinks: {

//         }
//       }
//     },
//     errors: null,
//     refs: {},
//     refVal: [[]],
//     root: []
//   }
// })
