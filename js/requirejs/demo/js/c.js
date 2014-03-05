define('c', ['storeinc!log','storeinc!b'], function (log) {
	var mod = {name:'C'};
	log.write('module c3 ok! (require modules: b)');
	// 通过return 返回对外api
	return mod;
});