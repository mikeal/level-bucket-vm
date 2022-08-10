import { MemoryLevel } from 'memory-level'
import create from './index.js'
import Transaction from '../car-transaction/index.js'

const setup = (execute) => {
  const level = new MemoryLevel({ valueEncoding: 'binary' })
  const { schedule, receipt } = create(level, execute)
  const rpc = buffer => {
    const handlers = schedule(buffer)
    return new Promise((resolve, reject) => {
      handlers.finished = (input, output) => {
        resolve({ input, output })
      }
    })
  }
  return { level, schedule, receipt, rpc }
}

const test = async () => {
  const execute = async buffer => {
    const { root, get } = await Transaction.load(buffer)
    const { hello } = await get(root)
    if (hello !== 'world') throw new Error('hello is not world')
    const transaction = Transaction.create()
    await transaction.write({ test: { hello } })
    return [ buffer, [] ]
  }
  const { rpc } = setup(execute)
  const transaction = Transaction.create()
  await transaction.write({ hello: 'world' })
  const { input, output } = await rpc(await transaction.commit())
  console.log({ input, output })
}

test()
