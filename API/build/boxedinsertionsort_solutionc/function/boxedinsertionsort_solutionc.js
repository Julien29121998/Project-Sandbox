exports.boxedinsertionsort_solutionc=boxedinsertionsort_solutioncfunction boxedinsertionsort_solutionc() {	var input = [];	var output = [];	input.push([3])	input.push([4])	input.push([5])	function fib(n) { if (n < 2) {return 1;}var a = 1, b = 1; for (var i = 2; i < n - 1 ;i++ ) { b = a + b;a = b - a; } return a + b; }	output.push(fib(input[0][0]))	output.push(fib(input[1][0]))	output.push(fib(input[2][0]))	return output}