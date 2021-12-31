'use-strict';


module.exports = {
	addDays: function(date, days=0) {
		const newDate = new Date(date);
		return newDate.setDate(newDate.getDate() + days);
	},

	formatDate: function({format='yyyy-mm-dd', date} = {}) {
		let _date = date ? new Date(date) : new Date();

		switch(format) {
			case 'yyyy-mm-dd':
				return _date.toISOString().split('T')[0];
			default:
				return new Date(_date.toISOString());
		}
	},
	// toIsoString: function(date) {
	// 	const tzo = -date.getTimezoneOffset();
	// 	const dif = tzo >= 0 ? '+' : '-';

	// 	function pad(num) {
	// 		const norm = Math.floor(Math.abs(num));
	// 		return (norm < 10 ? '0' : '') + norm;
	// 	};

	// 	return date.getFullYear() +
	// 		'-' + pad(date.getMonth() + 1) +
	// 		'-' + pad(date.getDate()) +
	// 		'T' + pad(date.getHours()) +
	// 		':' + pad(date.getMinutes()) +
	// 		':' + pad(date.getSeconds()) +
	// 		dif + pad(tzo / 60) +
	// 		':' + pad(tzo % 60);
	// }
}
