const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const CollectionRoutes = require(`${__dirname}/../../../../../app/lib/helpers/collection-routes`)

let collectionRoutes

beforeEach(() => {
  collectionRoutes = new CollectionRoutes()
})

describe('String', () => {
  it('should export object', () => {
    expect(collectionRoutes).toBeInstanceOf(Object)
  })

  describe('Reduce to type', () => {
    it('should handle incorrect map variable type.', () => {
      expect(collectionRoutes.reduceToType(false, 'edit'))
        .toBeUndefined()
    })

    it('should handle incorrect type variable type.', () => {
      expect(collectionRoutes.reduceToType('edit', false))
        .toEqual(false)
    })

    it('should return false if dot notated route does not end with type', () => {
      expect(collectionRoutes.reduceToType('edit.create', 'edit'))
        .toEqual(false)
    })

    it('should return true if dot notated route ends with type', () => {
      expect(collectionRoutes.reduceToType('edit.edit', 'edit'))
        .toEqual(true)
    })
  })

  describe('Append group', () => {
    it('should handle incorrect routes variable type.', () => {
      expect(collectionRoutes.appendGroup(undefined))
        .toBeFalsy()
    })

    it('should add a prepended group regular expression parameter in addition to existing routes.', () => {
      expect(collectionRoutes.appendGroup(['route/path']))
        .toEqual(expect.arrayContaining(['route/path', ':group[^[a-z-]]/route/path']))
    })
  })

  describe('Get collection by slug', () => {
    it ('should only accept an array of collections', () => {
      expect(collectionRoutes.getCollectionBySlug(undefined, 'foo'))
        .toBeUndefined()
    })

    it ('should only accept a string of collectionNames', () => {
      expect(collectionRoutes.getCollectionBySlug([], undefined))
        .toBeUndefined()
    })

    it ('should return a collection if the collection.slug matches collectionName', () => {
      const collections = [{
        slug: 'foo'
      }]
      expect(collectionRoutes.getCollectionBySlug(collections, 'foo'))
        .toEqual(expect.objectContaining(collections[0]))
    })

    it ('should return undefined if the collection.slug does not match collectionName', () => {
      const collections = [{
        slug: 'bar'
      }]
      expect(collectionRoutes.getCollectionBySlug(collections, 'foo'))
        .toBeUndefined()
    })
  })

})

// it('should reduce array to map dot notations ending with specified type.', () => {
//   const maps = ['edit.create', 'edit.create.edit']
//   const type = 'edit'

//   expect(collectionRoutes.reduceToType(maps, type))
//     .toEqual(expect.arrayContaining(['edit.create.edit']))
// })

// reduceToType √
// buildRoutes
// mapToDepth
// getDeepestCollection
// getCollectionDepth
// fieldReferenceDepth
// getMaxDepth
// filterReferenceFields
// canExtend
// appendGroup √
// getCollectionBySlug √

