'use strict';
const assert = require('assert');
const mutex = require('../');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("Mutex-Interval", () => {
	afterEach(() => {
		mutex.clearAll();
	});

	it('Throws on bad arguments', () => {
		try {
			mutex();
			throw new Error('No throw?');
		} catch(err) {
			assert(err.message === 'Failed to set up interval object!');
		}
	});

	it('Creates a mutex OK + cancel works', async () => {
		let counter = 0;
		const cancel = mutex(() => { counter++ }, 100);
		assert(typeof cancel === 'function');
		await wait(500);
		assert(counter >= 2, counter);
		cancel();
		let check = counter;
		await wait(500);
		assert(counter === check);
	});

	it('Operates properly as a mutex', async () => {
		let counter = 0;
		// the increment happens first so if the callback
		// is being fired at the designated interval, the
		// count should be higher than 1.
		const cancel = mutex(async () => {
			counter++;
			await wait(400);
		}, 100);
		await wait(500);
		assert(typeof cancel === 'function');
		assert(counter === 1, counter);
		cancel();
	});

	it('Operates properly as a mutex on error', async () => {
		let counter = 1;
		// If an error occurs at an even number, ensure it doesn't
		// hang the mutex handler...
		const cancel = mutex(async () => {
			counter++;
			if (counter % 2 === 0) throw new Error('Ack!');
		}, 100);
		await wait(500);
		assert(typeof cancel === 'function');
		assert(counter >= 4, counter);
		cancel();
	});	
});