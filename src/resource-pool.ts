/**
 * A resource pool is a set of resources that are kept ready to use, rather than
 * acquired on use and released afterwards. In this context, resources can refer
 * to system resources such as file handles, which are external to a process, or
 * internal resources such as objects. A pool client requests a resource from
 * the pool and performs desired operations on/with the returned resource. When
 * the client finishes its use of the resource, it is returned to the pool
 * rather than released or lost.
 */
export class ResourcePool<T extends object> {
  /**
   * Available resources are stored here
   */
  private readonly availables: T[] = []
  /**
   * Busy resources are stored here
   */
  private readonly busies: T[] = []
  /**
   * Function which creates a new resource. Provided at creation time
   */
  private readonly creator: () => T
  /**
   * Array of unique identifiers to keep track of resource requests
   */
  private readonly debts: number[] = []
  /**
   * Maximum number of resources that can be created
   */
  private readonly maxResources: number

  /**
   * Constructs a new empty ResourcePool
   * @param creator Function which creates a new resource
   * @param maxResources Maximum number of resources that can be created
   * @throws {Error} If creator returns the same object on diff calls
   * @throws {TypeError} If maxResources is not an integer
   * @throws {RangeError} If not [ 1 <= maxResources <= MAX_SAFE_INTEGER - 1 ]
   */
  public constructor(
    creator: () => T,
    maxResources: number = Number.MAX_SAFE_INTEGER - 1,
  ) {
    if (creator() === creator()) {
      throw new Error('Creator function returns the same object on diff calls')
    }
    if (!Number.isInteger(maxResources)) {
      throw new TypeError()
    }
    if (maxResources < 1) {
      throw new RangeError()
    }
    if (maxResources >= Number.MAX_SAFE_INTEGER) {
      throw new RangeError()
    }
    this.creator = creator
    this.maxResources = maxResources
  }

  /**
   * Returns a reference to a resource when it becomes available
   * @returns A resource if/when available
   */
  public getRes(): Promise<T> {
    // Id to differentiate each call to this method
    const id: number = Math.random()
    this.debts.push(id)

    return new Promise((resolve): void => {
      if (this.availables.length > 0) {
        const theRes: T = this.availables.pop() as T
        this.busies.push(theRes)
        this.debts.splice(this.debts.indexOf(id), 1)
        resolve(theRes)
      }
      else if (this.resCount() < this.maxResources) {
        const theRes: T = this.creator()
        this.busies.push(theRes)
        this.debts.splice(this.debts.indexOf(id), 1)
        resolve(theRes)
      }
      else {
        const interval = setInterval(() => {
          if (this.availables.length > 0) {
            const theRes: T = this.availables.pop() as T
            this.busies.push(theRes)
            this.debts.splice(this.debts.indexOf(id), 1)
            clearInterval(interval)
            resolve(theRes)
          }
        }, 0) // tslint:disable-line:align
      }
    })

  }

  /**
   * Release a resource by a consumer of the pool
   * @param res The resource to be released
   */
  public release(res: T): void {
    const posInBusies: number = this.busies.indexOf(res)
    this.busies.splice(posInBusies, 1)
    this.availables.push(res)
  }

  /**
   * Total existing resource count, includes both available and busy resources
   * @returns The total existing resource count
   */
  private resCount(): number {
    return this.busies.length + this.availables.length
  }
}
