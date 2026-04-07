import { describe, it } from 'bun:test'
import { Crypto } from '@nan0web/auth-core'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import { VerificationModel } from './src/domain/identity/VerificationModel.js'

async function debug() {
		const db = new DB({ predefined: [] })
		await db.connect()

		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: w1 } = Crypto.generateKeyPair()
		const { publicKey: w2 } = Crypto.generateKeyPair()

		const model = new VerificationModel({ db, did: myDid })
		const events = []
		
		const data = await runGenerator(model.run(), {
			ask: async (intent) => {
				if (intent.field === 'isGenesis') return { value: false }
				if (intent.field === 'witness1') return { value: w1 }
				if (intent.field === 'witness2') return { value: w2 }
			},
			log: (i) => events.push(`${i.level}:${i.message}`),
			progress: () => {},
		})

        console.log("DATA:", data)
        console.log("EVENTS:", events)
}
debug()
