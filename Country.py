#Definition of the Class Country, with the metadata and GAIN operations


class Country:
    def __init__(self,ISO3):
        self.ISO3 = ISO3
		self.measure={} #Dictionary to keep measure data

    name="Country name"
	income_level="Income Level"
	
	def area(self):
        return self.x * self.y
    def perimeter(self):
        return 2 * self.x + 2 * self.y
    def describe(self,text):
        self.description = text
    def authorName(self,text):
        self.author = text
    def scaleSize(self,scale):
        self.x = self.x * scale
    self.y = self.y * scale