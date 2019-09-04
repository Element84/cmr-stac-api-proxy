const {createSchemaValidator} = require('../../lib/validator/validator')

describe('validator', () => {
  it.skip('should validate a swagger components', () => {
    expect(createSchemaValidator()).toEqual({})
  })

  it.skip('should validate a schema with a schema element', () => {
    expect(createSchemaValidator()).toEqual()
  })
})