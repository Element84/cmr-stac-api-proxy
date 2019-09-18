const cmr = require('../../lib/cmr');
const { getRootCatalog, getCatalog } = require('../../lib/api/stac');

describe('getRootCatalog', () => {
  it('should respond with a rootCatalog.', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const expected = {
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

    getRootCatalog(null, mockResponse);
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
