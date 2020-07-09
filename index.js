'use strict';

const __mutex = {};
const __intervals = {};
let tid = 1;

/**
 * Sets up and starts the interval process -- returns a
 * function that, when called, will abort the interval.
 * @param {function(): Promise} callback 
 * @param {number} interval 
 * @return {function: void}
 */
function MutexInterval(callback, interval) {
	if (typeof callback !== 'function' || typeof interval !== 'number') {
		throw new Error('Failed to set up interval object!');
	}

	const intvId = tid++;
	const intv = setInterval(async () => {
		try {
			if (__mutex[intvId]) return;
			__mutex[intvId] = true;
			await callback();
			__mutex[intvId] = false;
		} catch(err) {
			__mutex[intvId] = false;
		}
	}, interval)

	__intervals[intvId] = intv;

	if (intvId) {
		__mutex[intvId] = false;
		return function() { 
			delete __mutex[intvId];
			clearInterval(__intervals[intvId]);
			delete __intervals[intvId];
		}
	} else throw new Error('Failed to set up interval object!');
}

function clearAll() {
	for (let id in __mutex) {
		clearInterval(__intervals[id]);
		delete __intervals[id];
		delete __mutex[id];
	}
}

module.exports = MutexInterval;
module.exports.clearAll = clearAll;