def handle(req):
	def boxedexercise_solution():
		def hello():			print("hello")
		return(hello())
	return boxedexercise_solution()