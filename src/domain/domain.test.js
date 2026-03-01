import test from 'node:test'
import assert from 'node:assert/strict'
import {
	BaseUser,
	User,
	Course,
	Subscription,
	Payment,
	Peer,
	MeshMessage,
	MeshNode,
	Message,
	DomainMessage,
} from './index.js'

// ── BaseUser ──────────────────────────────────────────────

test('BaseUser — defaults', () => {
	const m = new BaseUser()
	assert.equal(m.id, '')
	assert.equal(m.username, '')
	assert.equal(m.email, '')
	assert.equal(m.locale, 'uk')
	assert.equal(m.createdAt, '')
})

test('BaseUser — construct with data', () => {
	const m = new BaseUser({
		id: 'u1',
		username: 'yaro',
		email: 'y@i.ua',
		locale: 'en',
	})
	assert.equal(m.id, 'u1')
	assert.equal(m.username, 'yaro')
	assert.equal(m.email, 'y@i.ua')
	assert.equal(m.locale, 'en')
})

test('BaseUser.from — idempotent', () => {
	const m = new BaseUser({ id: 'u1' })
	assert.equal(BaseUser.from(m), m)
})

test('BaseUser.from — from plain object', () => {
	const m = BaseUser.from({ username: 'test' })
	assert.ok(m instanceof BaseUser)
	assert.equal(m.username, 'test')
})

test('BaseUser — static help exists for every field', () => {
	for (const key of ['id', 'username', 'email', 'locale', 'createdAt']) {
		assert.ok(BaseUser[key], `missing static schema for "${key}"`)
		assert.equal(
			typeof BaseUser[key].help,
			'string',
			`"${key}.help" must be a string`,
		)
		assert.ok('default' in BaseUser[key], `"${key}" must have a default`)
	}
})

// ── User (extends BaseUser) ──────────────────────────

test('User — defaults', () => {
	const m = new User()
	assert.equal(m.role, 'citizen')
	assert.equal(m.verified, false)
	// inherited
	assert.equal(m.id, '')
	assert.equal(m.locale, 'uk')
})

test('User — construct with data', () => {
	const m = new User({ id: 'u2', role: 'admin', verified: true })
	assert.equal(m.id, 'u2')
	assert.equal(m.role, 'admin')
	assert.equal(m.verified, true)
})

test('User — inherits BaseUser', () => {
	const m = new User()
	assert.ok(m instanceof BaseUser)
})

test('User.from — idempotent', () => {
	const m = new User({ id: 'u3' })
	assert.equal(User.from(m), m)
})

test('User.from — from plain object', () => {
	const m = User.from({ role: 'elder' })
	assert.ok(m instanceof User)
	assert.equal(m.role, 'elder')
})

test('User — options defined', () => {
	assert.ok(Array.isArray(User.role.options))
	assert.ok(User.role.options.includes('citizen'))
	assert.ok(User.role.options.includes('admin'))
})

// ── Course ────────────────────────────────────────────────

test('Course — defaults', () => {
	const m = new Course()
	assert.equal(m.id, '')
	assert.equal(m.title, '')
	assert.equal(m.price, 0)
	assert.equal(m.status, 'draft')
})

test('Course — construct with data', () => {
	const m = new Course({ id: 'c1', title: 'Sovereignty 101', price: 99 })
	assert.equal(m.id, 'c1')
	assert.equal(m.title, 'Sovereignty 101')
	assert.equal(m.price, 99)
})

test('Course.from — idempotent', () => {
	const m = new Course({ id: 'c2' })
	assert.equal(Course.from(m), m)
})

test('Course — static help', () => {
	for (const key of [
		'id',
		'title',
		'description',
		'instructorId',
		'price',
		'status',
		'createdAt',
	]) {
		assert.ok(Course[key], `missing static schema for "${key}"`)
		assert.equal(typeof Course[key].help, 'string')
	}
})

// ── Subscription ──────────────────────────────────────────

test('Subscription — defaults', () => {
	const m = new Subscription()
	assert.equal(m.planId, 'basic')
	assert.equal(m.status, 'active')
})

test('Subscription — isActive getter', () => {
	const active = new Subscription({ status: 'active' })
	assert.equal(active.isActive, true)
	const cancelled = new Subscription({ status: 'cancelled' })
	assert.equal(cancelled.isActive, false)
})

test('Subscription.from — idempotent', () => {
	const m = new Subscription({ id: 's1' })
	assert.equal(Subscription.from(m), m)
})

test('Subscription — options', () => {
	assert.ok(Subscription.planId.options.includes('vip'))
	assert.ok(Subscription.status.options.includes('expired'))
})

// ── Payment ───────────────────────────────────────────────

test('Payment — defaults', () => {
	const m = new Payment()
	assert.equal(m.amount, 0)
	assert.equal(m.currency, 'WILLNI')
	assert.equal(m.status, 'pending')
})

test('Payment — construct with data', () => {
	const m = new Payment({ amount: 99, status: 'completed' })
	assert.equal(m.amount, 99)
	assert.equal(m.status, 'completed')
})

test('Payment.from — from plain object', () => {
	const m = Payment.from({ amount: 50 })
	assert.ok(m instanceof Payment)
	assert.equal(m.amount, 50)
})

// ── MeshMessage (Sovereign) ──────────────────────────────────

test('MeshMessage — defaults', () => {
	const m = new MeshMessage()
	assert.equal(m.id, '')
	assert.equal(m.type, 'text')
	assert.equal(m.text, '')
	assert.equal(m.location, null)
})

test('MeshMessage — construct with data', () => {
	const m = new MeshMessage({
		id: 'msg1',
		type: 'sos',
		location: [50.45, 30.52],
	})
	assert.equal(m.id, 'msg1')
	assert.equal(m.type, 'sos')
	assert.deepEqual(m.location, [50.45, 30.52])
})

test('MeshMessage.from — idempotent', () => {
	const m = new MeshMessage({ id: 'msg2' })
	assert.equal(MeshMessage.from(m), m)
})

test('MeshMessage — options', () => {
	assert.ok(MeshMessage.type.options.includes('sos'))
	assert.ok(MeshMessage.type.options.includes('raid'))
})

// ── MeshNode ──────────────────────────────────────────────────

test('MeshNode — defaults', () => {
	const m = new MeshNode()
	assert.equal(m.battery, 100)
	assert.equal(m.signal, 0)
})

test('MeshNode — construct with data', () => {
	const m = new MeshNode({ battery: 78, signal: -42 })
	assert.equal(m.battery, 78)
	assert.equal(m.signal, -42)
})

// ── Peer ──────────────────────────────────────────────────

test('Peer — defaults', () => {
	const m = new Peer()
	assert.equal(m.id, '')
	assert.equal(m.name, '')
	assert.equal(m.avatar, '👤')
	assert.equal(m.status, 'offline')
})

test('Peer — construct with data', () => {
	const m = new Peer({ id: 'peer1', name: 'Yaro', status: 'online' })
	assert.equal(m.id, 'peer1')
	assert.equal(m.name, 'Yaro')
	assert.equal(m.status, 'online')
})

test('Peer.from — idempotent', () => {
	const m = new Peer({ id: 'peer2' })
	assert.equal(Peer.from(m), m)
})

test('Peer — status options', () => {
	assert.ok(Peer.status.options.includes('online'))
	assert.ok(Peer.status.options.includes('offline'))
})

// ── Message & DomainMessage ────────────────────────────────────

test('Message — defaults', () => {
	const m = new Message()
	assert.deepEqual(m.head, {})
	assert.deepEqual(m.body, {})
})

test('Message — construct with data', () => {
	const m = new Message({ head: { from: 'a' }, body: { text: 'hi' } })
	assert.deepEqual(m.head, { from: 'a' })
	assert.deepEqual(m.body, { text: 'hi' })
})

test('Message.from — idempotent', () => {
	const m = new Message({ head: { x: 1 } })
	assert.equal(Message.from(m), m)
})

test('DomainMessage — extends Message', () => {
	const m = new DomainMessage({ head: { type: 'event' } })
	assert.ok(m instanceof Message)
	assert.deepEqual(m.head, { type: 'event' })
})
