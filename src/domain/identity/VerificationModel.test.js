import { describe, it, expect } from 'bun:test'
import { Crypto } from '@nan0web/auth-core'
import { VerificationModel } from './VerificationModel.js'

describe('VerificationModel — 2LW Protocol Rules', () => {
	it('fail: requires DID', () => {
		const model = new VerificationModel()
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/DID is required/)
	})

	it('fail: cannot be witness for oneself', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: otherDid } = Crypto.generateKeyPair()
		const model = new VerificationModel({
			did: myDid,
			witnesses: [myDid, otherDid]
		})
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/cannot be a witness for themselves/)
	})

	it('fail: requires at least 2 unique witnesses for normal 2LW', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: wp1 } = Crypto.generateKeyPair()

		const model1 = new VerificationModel({ did: myDid, witnesses: [wp1] })
		expect(model1.validate().isValid).toBe(false)
		expect(model1.validate().error).toMatch(/least 2 verified witnesses/)

		const modelDup = new VerificationModel({ did: myDid, witnesses: [wp1, wp1] })
		expect(modelDup.validate().isValid).toBe(false)
		expect(modelDup.validate().error).toMatch(/unique/)
	})

	it('pass: 2 unique witnesses (normal 2LW)', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: wp1 } = Crypto.generateKeyPair()
		const { publicKey: wp2 } = Crypto.generateKeyPair()

		const model = new VerificationModel({ did: myDid, witnesses: [wp1, wp2] })
		const res = model.validate()
		expect(res.isValid).toBe(true)
	})

	it('fail: Genesis Circle requires 3 mutual witnesses minimum', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: wp1 } = Crypto.generateKeyPair()
		const { publicKey: wp2 } = Crypto.generateKeyPair()

		const model = new VerificationModel({
			did: myDid,
			isGenesis: true,
			witnesses: [wp1, wp2]
		})
		const res = model.validate()
		expect(res.isValid).toBe(false)
		expect(res.error).toMatch(/requires at least 3/)
	})

	it('pass: Genesis Circle with 3 witnesses', () => {
		const { publicKey: myDid } = Crypto.generateKeyPair()
		const { publicKey: wp1 } = Crypto.generateKeyPair()
		const { publicKey: wp2 } = Crypto.generateKeyPair()
		const { publicKey: wp3 } = Crypto.generateKeyPair()

		const model = new VerificationModel({
			did: myDid,
			isGenesis: true,
			witnesses: [wp1, wp2, wp3]
		})
		expect(model.validate().isValid).toBe(true)
	})
})
