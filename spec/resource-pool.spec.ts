// tslint:disable: no-string-literal no-import-side-effect no-unused-expression
// tslint:disable:no-var-requires no-require-imports no-implicit-dependencies
import 'jasmine'
// tslint:disable-next-line: typedef
import { ResourcePool } from '../src/resource-pool'

const creator = (): object => ({})
const factor = 100

describe('Resource Pool', () => {
  // Validation

  it('Constructs sucessfully without the 2nd param', () => {
    const pool = new ResourcePool(creator)
    expect(pool).toBeDefined()
  })
  it('Constructs sucessfully with 1 as the 2nd param', () => {
    const pool = new ResourcePool(creator, 1)
    expect(pool).toBeDefined()
  })
  it('Throws if 2nd param is less than 1', () => {
    const setUp = (): void => { new ResourcePool(creator, 0) }
    expect(setUp).toThrow()
  })
  it('Throws if 2nd param is equal to MAX_SAFE_INTEGER', () => {
    const setUp = (): void => {
      new ResourcePool(creator, Number.MAX_SAFE_INTEGER)
    }
    expect(setUp).toThrow()
  })
  it('Throws if 2nd param is greater than MAX_SAFE_INTEGER', () => {
    const setUp = (): void => {
      new ResourcePool(creator, Number.MAX_SAFE_INTEGER + 1)
    }
    expect(setUp).toThrow()
  })
  it('Throws if 2nd param is not an integer', () => {
    const decimal = 3.20901238
    const setUp = (): void => {
      new ResourcePool(creator, decimal)
    }
    expect(setUp).toThrow()
  })
  it('Throws if creator fn returns the same object at least twice ', () => {
    const obj: object = {}
    const badCreator = (): object => obj
    const setUp = (): void => {
      new ResourcePool(badCreator, 1)
    }
    expect(setUp).toThrow()
  })

  // Private props

  it('Correctly stores the 2nd param passed in to the constructor', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    const storedNumber: number = pool['maxResources']
    expect(storedNumber).toEqual(n)
  })
  it('Correctly starts with empty available resources', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    expect(pool['availables'].length).toEqual(0)
  })
  it('Correctly starts with empty available resources', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    expect(pool['availables'].length).toEqual(0)
  })
  it('Correctly starts with empty busy resources', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    expect(pool['busies'].length).toEqual(0)
  })
  it('Correctly starts with empty debts', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    expect(pool['debts'].length).toEqual(0)
  })

  // Private methods

  it('Correctly returns the total resources number at beginning', () => {
    const n = Math.round(Math.random() * factor)
    const pool = new ResourcePool(creator, n)
    const availLen = pool['availables'].length
    const busiesLen = pool['busies'].length
    const total = availLen + busiesLen
    expect(pool['resCount']()).toEqual(total)
  })
})

describe('Async tests on private props and method resCount', () => {
  let pool: ResourcePool<object>
  let resN: number
  beforeEach(() => {
    resN = Math.round(Math.random() * factor)
    pool = new ResourcePool(creator, resN)
  })

  it(
    'Has the correct number of resources when filling up the pool',
    async () => {
      await Promise.all(
        (new Array(resN))
        .fill(undefined)
        .map<Promise<object>>(_ => pool.getRes()),
      )
      expect(pool['busies'].length).toEqual(resN)
      expect(pool['availables'].length).toEqual(0)
      expect(pool['resCount']()).toEqual(resN)
  })

  it(
    'Has the correct number of resources after filling up then releasing' +
    ' the whole pool',
    async () => {
      const resources = await Promise.all(
        (new Array(resN))
          .fill(undefined)
          .map<Promise<object>>(_ => pool.getRes()),
      )
      resources.forEach(res => {
        pool.release(res)
      })
      expect(pool['busies'].length).toEqual(0)
      expect(pool['availables'].length).toEqual(resN)
      expect(pool['resCount']()).toEqual(resN)
    },
  )
})

describe('async test on releasing the correct resource', () => {
  const pool = new ResourcePool(creator, 1)

  it('Returns the same resource when using only one resource', async () => {
    const resource = await pool.getRes()
    pool.release(resource)
    const releasedResource = await pool.getRes()
    const theyEqual = resource === releasedResource
    expect(theyEqual).toEqual(true)
  })
})
