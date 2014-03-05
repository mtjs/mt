define('p1', ['p2', 'p3'], function (p2, p3) {
    var o = {
        k: 'v'
    };
    console.log('p1 depend on p2 p3 ok!');
	document.write('p1 depend on p2 p3 ok!</br>');
    return o;
});
