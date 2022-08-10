import charwise from 'charwise'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

const carcid = buffer => CID.createV1(0x0202, sha256.digest(buffer))

const executeAtomic = async buffer => {
  // does stuff and
  // returns [ CAR file as a Buffer, operations array for level ]
}
const executeMutex = async buffers => {
  // does stuff and preserves the order of responses in order to
  // return [ [ carBuffer, opertionsArray ], [ carBuffer, operationsArray ] ]
}

const create = (level, execute, mutex=false) => {
  let queue = []
  const schedule = (buffer) => {
    const handlers = {}
    queue.push({ buffer, handlers }) 
    setTimeout(kick, 0)
    return handlers
  }

  const kick = async () => {
    if (queue.length) {
      if (mutex) {
        const bulk = queue
        queue = []
        const cars = bulk.map(({ buffer }) => buffer)
        const results = await execute(buffers)
        throw new Error('not implemented')
      } else {
        return run(queue.shift())
      }
    }
  }

  const run = async ({ buffer, handlers }) => {
    const cid = await carcid(buffer)
    const runkey = [ null, cid.toString(), null ]
    // TODO: check if this operation has already been run
    const [ car, ops ] = await execute(buffer)
    ops.push({ key: charwise.encode(runkey), value: car, type: 'put' })
    await level.batch(ops)
    if (handlers.finished) handlers.finished(cid, car)
  }

  const receipt = async cid => {
    const runkey = [ null, cid.toString(), null ]
    const buffer = await level.get(charwise.encode(runkey))
    return buffer
  }
  
  return { schedule, receipt } 
}

export default create
