define('b', ['storeinc!log'], function (log) {
	var mod = {};
	log.write('module b23 ok!(require modules: log)');
	// 通过return 返回对外api
	return mod;
});