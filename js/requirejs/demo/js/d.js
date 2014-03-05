define('d', ['storeinc!log'], function (log) {
	var mod = {name:'D'};
	log.write('module d3 ok! (require modules: log)');
	// 通过return 返回对外api
	return mod;
});
