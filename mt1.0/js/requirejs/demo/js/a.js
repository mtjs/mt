define('log', [], function () {
	var mod = {};
	mod.write = function (msg) {
		document.getElementById('log').innerHTML += msg + '<br/>';
	}
	mod.write('module modify log3 ok!xxx');
	// 通过return 返回对外api
	return mod;
});