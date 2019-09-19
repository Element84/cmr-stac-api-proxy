const cmr = require('../../lib/cmr');
const cmrConverter = require('../../lib/convert');
const { getSearch, postSearch, getRootCatalog, getCatalog } = require('../../lib/api/stac');

const { mockFunction, revertFunction, logger } = require('../util');

describe('getSearch', () => {
  it('should return a set of collections that match a simple query', async () => {
    const request = { apiGateway: { event: {} }, app: { logger: logger } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockFunction(cmr, 'convertParams');
    mockFunction(cmr, 'findGranules');
    mockFunction(cmrConverter, 'cmrGranulesToFeatureCollection');

    cmr.convertParams.mockReturnValue([]);
    cmr.findGranules.mockReturnValue(Promise.resolve([]));
    cmrConverter.cmrGranulesToFeatureCollection.mockReturnValue(Promise.resolve([]));

    await getSearch(request, response);

    expect(response.json).toHaveBeenCalled();
    expect(cmr.convertParams).toHaveBeenCalledTimes(2);

    revertFunction(cmr, 'convertParams');
    revertFunction(cmr, 'findGranules');
    revertFunction(cmrConverter, 'cmrGranulesToFeatureCollection');
  });
});

describe('postSearch', () => {
  it('should return a set of collections that match a simple query', async () => {
    const request = { apiGateway: { event: {} }, body: '{}', app: { logger: logger } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockFunction(cmr, 'convertParams');
    mockFunction(cmr, 'findGranules');
    mockFunction(cmrConverter, 'cmrGranulesToFeatureCollection');

    cmr.convertParams.mockReturnValue([]);
    cmr.findGranules.mockReturnValue(Promise.resolve([]));
    cmrConverter.cmrGranulesToFeatureCollection.mockReturnValue(Promise.resolve([]));

    await postSearch(request, response);

    expect(response.json).toHaveBeenCalled();
    expect(cmr.convertParams).toHaveBeenCalledTimes(1);

    revertFunction(cmr, 'convertParams');
    revertFunction(cmr, 'findGranules');
    revertFunction(cmrConverter, 'cmrGranulesToFeatureCollection');
  });
});

describe('getRootCatalog', () => {
  it('should respond with a rootCatalog.', () => {
    const mockRequest = { app: { logger: logger } };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const expected = {
      stac_version: '0.8.0',
      title: 'Root Catalog',
      description: 'Generated root catalog for CMR.',
      id: 'root',
      links: [
        {
          href: 'http://localhost:3000/stac',
          rel: 'root',
          title: 'Root Catalog',
          type: 'application/json'
        },
        {
          href: 'http://localhost:3000/stac',
          rel: 'self',
          title: 'Root Catalog',
          type: 'application/json'
        },
        {
          href: 'http://localhost:3000/stac/default',
          rel: 'child',
          title: 'Default Catalog',
          type: 'application/json'
        }
      ]
    };

    getRootCatalog(mockRequest, mockResponse);
    expect(mockResponse.json).toHaveBeenCalledWith(expected);
  });
});

describe('getCatalog', () => {
  it('should respond with a catalog.', async () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockCmrCollection = [
      {
        id: 'C12145-SCIOPS',
        title: 'Test Title'
      }
    ];

    const tempFindCollections = cmr.findCollections;
    cmr.findCollections = jest.fn().mockReturnValue(Promise.resolve(mockCmrCollection));

    const expected = {
      stac_version: '0.8.0',
      id: 'default',
      title: 'Default Catalog',
      description: 'Default catalog for a no parameter search against common metadata repository.',
      links: [
        {
          rel: 'root',
          type: 'application/json',
          href: 'http://localhost:3000/stac',
          title: 'Root Catalog'
        },
        {
          rel: 'self',
          type: 'application/json',
          href: 'http://localhost:3000/stac/default',
          title: 'Default Catalog'
        },
        {
          rel: 'child',
          type: 'application/json',
          href: 'http://localhost:3000/stac/default/C12145-SCIOPS',
          title: 'Test Title'
        }
      ]
    };

    await getCatalog({ params: { catalogId: 'default' } }, mockResponse);

    expect(cmr.findCollections).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(expected);

    cmr.findCollections = tempFindCollections;
  });
});
