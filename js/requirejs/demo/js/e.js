define('e', ['storeinc!log'], function (log) {
	var mod = {};
	log.write('module e3 ok! (require modules: log)');
	// 通过return 返回对外api
	return mod;
});
