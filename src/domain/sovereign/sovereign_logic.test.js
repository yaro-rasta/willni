import test from 'node:test'
import assert from 'node:assert/strict'
import { Verse, Case, Product, Chronicle, Declaration, Node } from './index.js'

test('Case — consensus logic (verdict)', () => {
	const c = new Case({ title: 'Universal Justice' })

	// Pending
	assert.equal(c.verdict, 'pending')
	assert.equal(c.isConsensus, false)

	// Guilty Consensus (100%)
	c.votes = { guilty: 5, innocent: 0 }
	assert.equal(c.verdict, 'guilty_consensus')
	assert.equal(c.isConsensus, true)

	// Innocent Consensus (100%)
	c.votes = { guilty: 0, innocent: 3 }
	assert.equal(c.verdict, 'innocent_consensus')
	assert.equal(c.isConsensus, true)

	// Guilty Compromise (>= 66%)
	c.votes = { guilty: 2, innocent: 1 } // 66.6%
	assert.equal(c.verdict, 'guilty_compromise')
	assert.equal(c.isConsensus, false)

	// Innocent Compromise (< 66% guilty)
	c.votes = { guilty: 1, innocent: 1 } // 50%
	assert.equal(c.verdict, 'innocent_compromise')
	assert.equal(c.isConsensus, false)
})

test('Verse — structure and defaults', () => {
	const v = new Verse({ id: 'v1', slug: 'yaro' })
	assert.equal(v.id, 'v1')
	assert.equal(v.slug, 'yaro')
	assert.deepEqual(v.ecosystem, { ubi: 33, dev: 33, treasury: 33, fee: 1 })
	assert.ok(Array.isArray(v.products))
	assert.ok(Array.isArray(v.chronicles))
})

test('Verse — integration with Product and Chronicle', () => {
	const p = new Product({ title: 'Sovereign Art', price: 0.1 })
	const ch = new Chronicle({ date: '2026-03-01', event: 'First Mesh message' })

	const v = new Verse({
		products: [p],
		chronicles: [ch],
	})

	assert.equal(v.products[0].title, 'Sovereign Art')
	assert.equal(v.chronicles[0].event, 'First Mesh message')
})

test('Declaration — defaults and text', () => {
	const d = new Declaration({ text: 'I am a free being' })
	assert.equal(d.text, 'I am a free being')
	assert.ok(d.timestamp > 0)
	assert.equal(d.isPublic, true)
})

test('Node — status tracking', () => {
	const n = new Node({ battery: 85, signal: -70 })
	assert.equal(n.battery, 85)
	assert.equal(n.signal, -70)
})
